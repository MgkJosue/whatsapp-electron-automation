const whatsappService = require('./whatsapp.service');
const messageRepository = require('../persistence/repositories/messageRepository');
const configRepository = require('../persistence/repositories/configRepository');
const userRepository = require('../persistence/repositories/userRepository');

class MessageQueueService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.isPaused = false;
    this.currentMessageId = null;
    this.statusCallback = null;
  }

  async addToQueue(messageData) {
    this.queue.push(messageData);
    console.log(`Message added to queue. Queue size: ${this.queue.length}`);
    
    if (this.statusCallback) {
      this.statusCallback({
        type: 'queued',
        messageId: messageData.messageId,
        queueSize: this.queue.length,
        isProcessing: this.isProcessing,
        isPaused: this.isPaused
      });
    }
    
    if (!this.isProcessing && !this.isPaused) {
      this.processQueue();
    }
    
    return {
      queuePosition: this.queue.length,
      queueSize: this.queue.length
    };
  }

  async processQueue() {
    if (this.isProcessing || this.isPaused) {
      console.log(`⚠️ Queue processing blocked - isProcessing: ${this.isProcessing}, isPaused: ${this.isPaused}`);
      return;
    }

    if (this.queue.length === 0) {
      console.log('Queue is empty');
      this.isProcessing = false;
      
      if (this.statusCallback) {
        this.statusCallback({
          type: 'idle',
          queueSize: 0,
          isProcessing: false,
          isPaused: false
        });
      }
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 Starting queue processing - ${this.queue.length} messages in queue`);
    
    if (this.statusCallback) {
      this.statusCallback({
        type: 'processing',
        queueSize: this.queue.length,
        isProcessing: true,
        isPaused: false
      });
    }

    while (this.queue.length > 0 && !this.isPaused) {
      const messageData = this.queue.shift();
      this.currentMessageId = messageData.messageId;
      
      if (this.statusCallback) {
        this.statusCallback({
          type: 'sending',
          messageId: messageData.messageId,
          phoneNumber: messageData.phoneNumber,
          contactName: messageData.contactName,
          queueSize: this.queue.length,
          isProcessing: true,
          isPaused: false
        });
      }

      try {
        await this.sendMessage(messageData);
        
        if (this.statusCallback) {
          this.statusCallback({
            type: 'sent',
            messageId: messageData.messageId,
            queueSize: this.queue.length,
            isProcessing: true,
            isPaused: false
          });
        }
        
        if (this.queue.length > 0) {
          const user = userRepository.getFirst();
          const config = configRepository.findByUserId(user.id);
          const delay = config ? config.delay_between_messages : 5;
          
          console.log(`⏳ Waiting ${delay} seconds before next message... (${this.queue.length} messages remaining)`);
          await this.sleep(delay * 1000);
          console.log(`✅ Delay completed, processing next message...`);
        }

      } catch (error) {
        console.error('Error processing message:', error);
        
        if (this.statusCallback) {
          this.statusCallback({
            type: 'error',
            messageId: messageData.messageId,
            error: error.message,
            queueSize: this.queue.length,
            isProcessing: true,
            isPaused: false
          });
        }
      }
    }

    this.isProcessing = false;
    this.currentMessageId = null;
    console.log('Queue processing completed');
    
    if (this.statusCallback) {
      this.statusCallback({
        type: 'completed',
        queueSize: this.queue.length,
        isProcessing: false,
        isPaused: false
      });
    }
  }

  async sendMessage(messageData) {
    const { messageId, phoneNumber, message, mediaPath } = messageData;

    try {
      messageRepository.updateStatus(messageId, 'SENDING');

      if (this.statusCallback) {
        this.statusCallback({
          type: 'sending',
          messageId,
          phoneNumber
        });
      }

      let result;
      if (mediaPath) {
        result = await whatsappService.sendMessageWithMedia(phoneNumber, message, mediaPath);
      } else {
        result = await whatsappService.sendMessage(phoneNumber, message);
      }

      messageRepository.updateStatus(messageId, 'SENT');

      if (this.statusCallback) {
        this.statusCallback({
          type: 'sent',
          messageId,
          phoneNumber,
          result
        });
      }

      console.log(`Message ${messageId} sent successfully`);
      return result;

    } catch (error) {
      const user = userRepository.getFirst();
      const config = configRepository.findByUserId(user.id);
      const maxRetries = config ? config.max_retries : 3;
      
      const currentMessage = messageRepository.findById(messageId);
      
      if (currentMessage && currentMessage.retry_count < maxRetries) {
        messageRepository.incrementRetryCount(messageId);
        console.log(`Retrying message ${messageId}. Retry ${currentMessage.retry_count + 1}/${maxRetries}`);
        
        await this.sleep(2000);
        return this.sendMessage(messageData);
      } else {
        messageRepository.updateStatus(messageId, 'FAILED', error.message);
        throw error;
      }
    }
  }

  pause() {
    this.isPaused = true;
    console.log('Queue paused');
    
    if (this.statusCallback) {
      this.statusCallback({
        type: 'paused',
        queueSize: this.queue.length
      });
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      console.log('Queue resumed');
      
      if (this.statusCallback) {
        this.statusCallback({
          type: 'resumed',
          queueSize: this.queue.length
        });
      }
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    }
  }

  stop() {
    this.queue = [];
    this.isPaused = false;
    this.isProcessing = false;
    this.currentMessageId = null;
    console.log('Queue stopped and cleared');
    
    if (this.statusCallback) {
      this.statusCallback({
        type: 'stopped'
      });
    }
  }

  getStatus() {
    return {
      isProcessing: this.isProcessing,
      isPaused: this.isPaused,
      queueSize: this.queue.length,
      currentMessageId: this.currentMessageId
    };
  }

  onStatusChange(callback) {
    this.statusCallback = callback;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new MessageQueueService();
