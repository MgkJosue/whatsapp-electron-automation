const { v4: uuidv4 } = require('uuid');
const db = require('../storage');

class MessageRepository {
  create(userId, phoneNumber, content, contactId = null, filePath = null, fileName = null) {
    const id = uuidv4();
    const sql = `
      INSERT INTO messages (id, user_id, contact_id, phone_number, content, file_path, file_name, status, retry_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, datetime('now'))
    `;
    
    db.run(sql, [id, userId, contactId, phoneNumber, content, filePath, fileName]);
    return this.findById(id);
  }

  findById(id) {
    const sql = 'SELECT * FROM messages WHERE id = ?';
    return db.get(sql, [id]);
  }

  findByUserId(userId, limit = 100) {
    const sql = `
      SELECT * FROM messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    return db.all(sql, [userId, limit]);
  }

  findByStatus(userId, status) {
    const sql = `
      SELECT * FROM messages 
      WHERE user_id = ? AND status = ?
      ORDER BY created_at ASC
    `;
    return db.all(sql, [userId, status]);
  }

  findByContactId(contactId) {
    const sql = `
      SELECT * FROM messages 
      WHERE contact_id = ?
      ORDER BY created_at DESC
    `;
    return db.all(sql, [contactId]);
  }

  updateStatus(id, status, errorMessage = null) {
    let sql = 'UPDATE messages SET status = ?';
    const params = [status];
    
    if (status === 'SENT') {
      sql += ', sent_at = datetime(\'now\')';
    }
    
    if (errorMessage) {
      sql += ', error_message = ?';
      params.push(errorMessage);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    db.run(sql, params);
    return this.findById(id);
  }

  incrementRetryCount(id) {
    const sql = 'UPDATE messages SET retry_count = retry_count + 1 WHERE id = ?';
    db.run(sql, [id]);
    return this.findById(id);
  }

  delete(id) {
    const sql = 'DELETE FROM messages WHERE id = ?';
    db.run(sql, [id]);
    return { success: true };
  }

  deleteByUserId(userId) {
    const sql = 'DELETE FROM messages WHERE user_id = ?';
    db.run(sql, [userId]);
    return { success: true };
  }

  getStatistics(userId) {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM messages
      WHERE user_id = ?
      GROUP BY status
    `;
    return db.all(sql, [userId]);
  }

  getRecentMessages(userId, days = 7) {
    const sql = `
      SELECT * FROM messages
      WHERE user_id = ? 
      AND created_at >= datetime('now', '-' || ? || ' days')
      ORDER BY created_at DESC
    `;
    return db.all(sql, [userId, days]);
  }

  count(userId) {
    const sql = 'SELECT COUNT(*) as count FROM messages WHERE user_id = ?';
    const result = db.get(sql, [userId]);
    return result ? result.count : 0;
  }

  getPendingQueue(userId) {
    const sql = `
      SELECT * FROM messages
      WHERE user_id = ? AND status = 'PENDING'
      ORDER BY created_at ASC
    `;
    return db.all(sql, [userId]);
  }
}

module.exports = new MessageRepository();
