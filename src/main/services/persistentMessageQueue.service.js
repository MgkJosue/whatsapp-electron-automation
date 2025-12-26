const whatsappService = require('./whatsapp.service');
const messageRepository = require('../persistence/repositories/messageRepository');
const queueRepository = require('../persistence/repositories/queueRepository');
const configRepository = require('../persistence/repositories/configRepository');
const userRepository = require('../persistence/repositories/userRepository');

class PersistentMessageQueueService {
  constructor() {
    this.isProcessing = false;
    this.isPaused = false;
    this.currentQueueItemId = null;
    this.statusCallback = null;
    this.userId = null;
    this.processingInterval = null;
  }

  setUserId(userId) {
    this.userId = userId;
    queueRepository.getOrCreateQueueState(userId);
  }

  async addToQueue(messageData) {
    if (!this.userId) {
      const user = userRepository.getFirst();
      this.userId = user.id;
    }

    const queueItem = queueRepository.addToQueue(
      this.userId,
      messageData.contactId || null,
      messageData.phoneNumber,
      messageData.contactName || messageData.phoneNumber,
      messageData.content || messageData.message,
      messageData.mediaPath || null
    );

    const stats = queueRepository.getQueueStats(this.userId);
    queueRepository.updateQueueState(this.userId, {
      total_messages: stats.total
    });

    console.log(`Message added to persistent queue. Position: ${queueItem.position}`);
    
    this.notifyStatus({
      type: 'queued',
      queueItem: queueItem,
      queueSize: stats.pending,
      isProcessing: this.isProcessing,
      isPaused: this.isPaused
    });
    
    if (!this.isProcessing && !this.isPaused) {
      this.processQueue();
    }
    
    return {
      queuePosition: queueItem.position,
      queueSize: stats.total
    };
  }

  async bulkAddToQueue(messagesData) {
    if (!this.userId) {
      const user = userRepository.getFirst();
      this.userId = user.id;
    }

    const items = messagesData.map(msg => ({
      contactId: msg.contactId || null,
      phoneNumber: msg.phoneNumber,
      contactName: msg.contactName || msg.phoneNumber,
      messageContent: msg.content,
      mediaPath: msg.mediaPath || null
    }));

    const results = queueRepository.bulkAddToQueue(this.userId, items);
    
    const stats = queueRepository.getQueueStats(this.userId);
    queueRepository.updateQueueState(this.userId, {
      total_messages: stats.total
    });

    console.log(`${results.length} messages added to persistent queue`);
    
    this.notifyStatus({
      type: 'bulk_queued',
      count: results.length,
      queueSize: stats.pending,
      isProcessing: this.isProcessing,
      isPaused: this.isPaused
    });
    
    if (!this.isProcessing && !this.isPaused) {
      this.processQueue();
    }
    
    return {
      count: results.length,
      queueSize: stats.total
    };
  }

  async processQueue() {
    if (this.isProcessing) {
      console.log('⚠️ Queue already processing');
      return;
    }

    if (!this.userId) {
      const user = userRepository.getFirst();
      if (!user) {
        console.error('No user found');
        return;
      }
      this.userId = user.id;
    }

    const state = queueRepository.getQueueState(this.userId);
    
    if (state && state.is_paused) {
      console.log('⏸️ Queue is paused');
      this.isPaused = true;
      return;
    }

    const pendingItems = queueRepository.getPendingQueueItems(this.userId);
    
    if (pendingItems.length === 0) {
      console.log('✅ Queue processing completed');
      this.isProcessing = false;
      this.isPaused = false;
      
      const stats = queueRepository.getQueueStats(this.userId);
      
      // Clear all queue items and reset state completely
      queueRepository.clearQueue(this.userId);
      queueRepository.resetQueueState(this.userId);
      
      this.notifyStatus({
        type: 'completed',
        queueSize: 0,
        isProcessing: false,
        isPaused: false,
        stats: {
          total: stats.total,
          processed: stats.processed,
          successCount: stats.success,
          failedCount: stats.failed
        }
      });
      return;
    }

    this.isProcessing = true;
    this.isPaused = false;
    
    queueRepository.updateQueueState(this.userId, { 
      is_processing: 1,
      is_paused: 0
    });
    
    console.log(`🚀 Starting queue processing - ${pendingItems.length} messages pending`);
    
    this.notifyStatus({
      type: 'processing',
      queueSize: pendingItems.length,
      isProcessing: true,
      isPaused: false
    });

    await this.processNextItem();
  }

  async processNextItem() {
    if (this.isPaused) {
      console.log('⏸️ Queue paused');
      this.isProcessing = false;
      return;
    }

    const state = queueRepository.getQueueState(this.userId);
    const currentPosition = state?.current_position || 0;
    
    const nextItem = queueRepository.getNextQueueItem(this.userId, currentPosition);
    
    if (!nextItem) {
      console.log('✅ Queue processing completed');
      this.isProcessing = false;
      queueRepository.updateQueueState(this.userId, { 
        is_processing: 0,
        current_position: 0
      });
      
      const stats = queueRepository.getQueueStats(this.userId);
      this.notifyStatus({
        type: 'completed',
        stats: stats,
        queueSize: 0,
        isProcessing: false,
        isPaused: false
      });
      return;
    }

    this.currentQueueItemId = nextItem.id;
    
    queueRepository.updateQueueState(this.userId, { 
      current_position: nextItem.position
    });
    
    this.notifyStatus({
      type: 'sending',
      queueItem: nextItem,
      phoneNumber: nextItem.phone_number,
      contactName: nextItem.contact_name,
      position: nextItem.position,
      queueSize: queueRepository.getPendingQueueItems(this.userId).length
    });

    try {
      const config = configRepository.findByUserId(this.userId);
      const delay = (config?.delay_between_messages || 5) * 1000;
      
      console.log(`📤 Sending message to ${nextItem.contact_name} (${nextItem.phone_number})`);
      
      let result;
      if (nextItem.media_path) {
        console.log(`📎 Sending with media: ${nextItem.media_path}`);
        result = await whatsappService.sendMessageWithMedia(
          nextItem.phone_number,
          nextItem.message_content,
          nextItem.media_path
        );
      } else {
        result = await whatsappService.sendMessage(
          nextItem.phone_number,
          nextItem.message_content
        );
      }

      if (result.success) {
        queueRepository.updateQueueItemStatus(nextItem.id, 'SUCCESS');
        queueRepository.incrementProcessed(this.userId, true);
        
        messageRepository.create(
          this.userId,
          nextItem.phone_number,
          nextItem.message_content,
          nextItem.contact_id,
          nextItem.media_path,
          null
        );

        console.log(`✅ Message sent successfully to ${nextItem.contact_name}`);
        
        this.notifyStatus({
          type: 'success',
          queueItem: nextItem,
          phoneNumber: nextItem.phone_number,
          contactName: nextItem.contact_name
        });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }

      console.log(`⏳ Waiting ${delay}ms before next message...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await this.processNextItem();

    } catch (error) {
      console.error(`❌ Error sending message to ${nextItem.contact_name}:`, error);
      
      queueRepository.incrementRetryCount(nextItem.id);
      const updatedItem = queueRepository.findQueueItemById(nextItem.id);
      
      const maxRetries = 3;
      
      if (updatedItem.retry_count >= maxRetries) {
        queueRepository.updateQueueItemStatus(
          nextItem.id, 
          'FAILED', 
          error.message
        );
        queueRepository.incrementProcessed(this.userId, false);
        
        messageRepository.create(
          this.userId,
          nextItem.phone_number,
          nextItem.message_content,
          nextItem.contact_id,
          nextItem.media_path,
          null
        );

        console.log(`⚠️ Message failed after ${maxRetries} retries. Skipping to next contact.`);
        
        this.notifyStatus({
          type: 'failed',
          queueItem: nextItem,
          phoneNumber: nextItem.phone_number,
          contactName: nextItem.contact_name,
          error: error.message,
          skipped: true
        });
      } else {
        console.log(`🔄 Retry ${updatedItem.retry_count}/${maxRetries} for ${nextItem.contact_name}`);
        
        this.notifyStatus({
          type: 'retry',
          queueItem: nextItem,
          phoneNumber: nextItem.phone_number,
          contactName: nextItem.contact_name,
          retryCount: updatedItem.retry_count,
          maxRetries: maxRetries
        });
      }
      
      const config = configRepository.findByUserId(this.userId);
      const delay = (config?.delay_between_messages || 5) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await this.processNextItem();
    }
  }

  pause() {
    if (!this.userId) {
      const user = userRepository.getFirst();
      this.userId = user.id;
    }

    this.isPaused = true;
    queueRepository.pauseQueue(this.userId);
    
    console.log('⏸️ Queue paused');
    
    this.notifyStatus({
      type: 'paused',
      isProcessing: this.isProcessing,
      isPaused: true,
      queueSize: queueRepository.getPendingQueueItems(this.userId).length
    });
    
    return { success: true, message: 'Queue paused' };
  }

  resume() {
    if (!this.userId) {
      const user = userRepository.getFirst();
      this.userId = user.id;
    }

    this.isPaused = false;
    queueRepository.resumeQueue(this.userId);
    
    console.log('▶️ Queue resumed');
    
    this.notifyStatus({
      type: 'resumed',
      isProcessing: this.isProcessing,
      isPaused: false,
      queueSize: queueRepository.getPendingQueueItems(this.userId).length
    });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return { success: true, message: 'Queue resumed' };
  }

  stop() {
    if (!this.userId) {
      const user = userRepository.getFirst();
      this.userId = user.id;
    }

    this.isPaused = false;
    this.isProcessing = false;
    this.currentQueueItemId = null;
    
    queueRepository.stopQueue(this.userId);
    
    console.log('⏹️ Queue stopped and cleared');
    
    this.notifyStatus({
      type: 'stopped',
      isProcessing: false,
      isPaused: false,
      queueSize: 0
    });
    
    return { success: true, message: 'Queue stopped and cleared' };
  }

  getStatus() {
    if (!this.userId) {
      const user = userRepository.getFirst();
      if (!user) {
        return {
          queueSize: 0,
          isProcessing: false,
          isPaused: false,
          stats: null
        };
      }
      this.userId = user.id;
    }

    const state = queueRepository.getQueueState(this.userId);
    const stats = queueRepository.getQueueStats(this.userId);
    
    return {
      queueSize: stats.pending || 0,
      isProcessing: state?.is_processing === 1 || this.isProcessing,
      isPaused: state?.is_paused === 1 || this.isPaused,
      currentPosition: state?.current_position || 0,
      stats: {
        total: stats.total || 0,
        pending: stats.pending || 0,
        processing: stats.processing || 0,
        success: stats.success || 0,
        failed: stats.failed || 0,
        processed: state?.processed_count || 0,
        successCount: state?.success_count || 0,
        failedCount: state?.failed_count || 0
      }
    };
  }

  async restoreQueue() {
    if (!this.userId) {
      const user = userRepository.getFirst();
      if (!user) {
        console.log('No user found, cannot restore queue');
        return;
      }
      this.userId = user.id;
    }

    const state = queueRepository.getQueueState(this.userId);
    
    if (!state) {
      console.log('No queue state found');
      return;
    }

    if (state.is_paused === 1) {
      this.isPaused = true;
      console.log('⏸️ Queue was paused, keeping paused state');
      
      this.notifyStatus({
        type: 'restored_paused',
        isProcessing: false,
        isPaused: true,
        queueSize: queueRepository.getPendingQueueItems(this.userId).length,
        stats: this.getStatus().stats
      });
      
      return;
    }

    const pendingItems = queueRepository.getPendingQueueItems(this.userId);
    
    if (pendingItems.length > 0) {
      console.log(`🔄 Restoring queue with ${pendingItems.length} pending messages`);
      
      this.notifyStatus({
        type: 'restored',
        queueSize: pendingItems.length,
        isProcessing: false,
        isPaused: false,
        stats: this.getStatus().stats
      });
      
      this.processQueue();
    } else {
      console.log('No pending messages to restore');
      queueRepository.resetQueueState(this.userId);
    }
  }

  setStatusCallback(callback) {
    this.statusCallback = callback;
  }

  notifyStatus(status) {
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  clearProcessedMessages() {
    if (!this.userId) {
      const user = userRepository.getFirst();
      this.userId = user.id;
    }

    queueRepository.clearProcessedItems(this.userId);
    console.log('🗑️ Cleared processed messages from queue');
    
    return { success: true, message: 'Processed messages cleared' };
  }
}

module.exports = new PersistentMessageQueueService();
