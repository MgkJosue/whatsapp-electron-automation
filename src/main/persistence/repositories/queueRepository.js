const db = require('../storage');
const { v4: uuidv4 } = require('uuid');

class QueueRepository {
  // ==================== QUEUE ITEMS ====================
  
  addToQueue(userId, contactId, phoneNumber, contactName, messageContent, mediaPath = null) {
    const id = uuidv4();
    const position = this.getNextPosition(userId);
    
    db.run(
      `INSERT INTO message_queue (id, user_id, contact_id, phone_number, contact_name, message_content, media_path, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, contactId, phoneNumber, contactName, messageContent, mediaPath, position]
    );
    
    return this.findQueueItemById(id);
  }

  bulkAddToQueue(userId, items) {
    const results = [];
    let position = this.getNextPosition(userId);
    
    for (const item of items) {
      const id = uuidv4();
      
      db.run(
        `INSERT INTO message_queue (id, user_id, contact_id, phone_number, contact_name, message_content, media_path, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, item.contactId, item.phoneNumber, item.contactName, item.messageContent, item.mediaPath, position]
      );
      
      results.push({ id, position });
      position++;
    }
    
    return results;
  }

  findQueueItemById(id) {
    return db.get(
      `SELECT * FROM message_queue WHERE id = ?`,
      [id]
    );
  }

  getPendingQueueItems(userId) {
    return db.all(
      `SELECT * FROM message_queue 
       WHERE user_id = ? AND status = 'PENDING'
       ORDER BY position ASC`,
      [userId]
    );
  }

  getNextQueueItem(userId, currentPosition) {
    return db.get(
      `SELECT * FROM message_queue 
       WHERE user_id = ? AND status = 'PENDING' AND position > ?
       ORDER BY position ASC
       LIMIT 1`,
      [userId, currentPosition]
    );
  }

  updateQueueItemStatus(id, status, errorMessage = null) {
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE message_queue 
       SET status = ?, error_message = ?, processed_at = ?
       WHERE id = ?`,
      [status, errorMessage, now, id]
    );
    
    return this.findQueueItemById(id);
  }

  incrementRetryCount(id) {
    db.run(
      `UPDATE message_queue 
       SET retry_count = retry_count + 1
       WHERE id = ?`,
      [id]
    );
    
    return this.findQueueItemById(id);
  }

  clearQueue(userId) {
    db.run(
      `DELETE FROM message_queue WHERE user_id = ?`,
      [userId]
    );
    
    return true;
  }

  clearProcessedItems(userId) {
    db.run(
      `DELETE FROM message_queue 
       WHERE user_id = ? AND status IN ('SUCCESS', 'FAILED')`,
      [userId]
    );
    
    return true;
  }

  getQueueStats(userId) {
    const stats = db.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM message_queue
       WHERE user_id = ?`,
      [userId]
    );
    
    return stats;
  }

  getNextPosition(userId) {
    const result = db.get(
      `SELECT MAX(position) as max_position FROM message_queue WHERE user_id = ?`,
      [userId]
    );
    
    return (result?.max_position || 0) + 1;
  }

  // ==================== QUEUE STATE ====================
  
  getQueueState(userId) {
    return db.get(
      `SELECT * FROM queue_state WHERE user_id = ?`,
      [userId]
    );
  }

  createQueueState(userId) {
    const id = uuidv4();
    
    db.run(
      `INSERT INTO queue_state (id, user_id, is_paused, is_processing, current_position, total_messages, processed_count, success_count, failed_count)
       VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)`,
      [id, userId]
    );
    
    return this.getQueueState(userId);
  }

  getOrCreateQueueState(userId) {
    let state = this.getQueueState(userId);
    
    if (!state) {
      state = this.createQueueState(userId);
    }
    
    return state;
  }

  updateQueueState(userId, updates) {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];
    
    if (updates.is_paused !== undefined) {
      fields.push('is_paused = ?');
      values.push(updates.is_paused ? 1 : 0);
    }
    
    if (updates.is_processing !== undefined) {
      fields.push('is_processing = ?');
      values.push(updates.is_processing ? 1 : 0);
    }
    
    if (updates.current_position !== undefined) {
      fields.push('current_position = ?');
      values.push(updates.current_position);
    }
    
    if (updates.total_messages !== undefined) {
      fields.push('total_messages = ?');
      values.push(updates.total_messages);
    }
    
    if (updates.processed_count !== undefined) {
      fields.push('processed_count = ?');
      values.push(updates.processed_count);
    }
    
    if (updates.success_count !== undefined) {
      fields.push('success_count = ?');
      values.push(updates.success_count);
    }
    
    if (updates.failed_count !== undefined) {
      fields.push('failed_count = ?');
      values.push(updates.failed_count);
    }
    
    fields.push('last_updated = ?');
    values.push(now);
    
    values.push(userId);
    
    db.run(
      `UPDATE queue_state SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
    
    return this.getQueueState(userId);
  }

  pauseQueue(userId) {
    this.getOrCreateQueueState(userId);
    return this.updateQueueState(userId, { is_paused: 1, is_processing: 0 });
  }

  resumeQueue(userId) {
    this.getOrCreateQueueState(userId);
    return this.updateQueueState(userId, { is_paused: 0 });
  }

  stopQueue(userId) {
    this.clearQueue(userId);
    return this.updateQueueState(userId, { 
      is_paused: 0, 
      is_processing: 0, 
      current_position: 0,
      total_messages: 0,
      processed_count: 0,
      success_count: 0,
      failed_count: 0
    });
  }

  incrementProcessed(userId, success = true) {
    const state = this.getOrCreateQueueState(userId);
    
    return this.updateQueueState(userId, {
      processed_count: (state.processed_count || 0) + 1,
      success_count: success ? (state.success_count || 0) + 1 : (state.success_count || 0),
      failed_count: !success ? (state.failed_count || 0) + 1 : (state.failed_count || 0)
    });
  }

  resetQueueState(userId) {
    return this.updateQueueState(userId, {
      is_paused: 0,
      is_processing: 0,
      current_position: 0,
      processed_count: 0,
      success_count: 0,
      failed_count: 0
    });
  }
}

module.exports = new QueueRepository();
