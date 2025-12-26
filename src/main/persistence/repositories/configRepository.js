const { v4: uuidv4 } = require('uuid');
const db = require('../storage');

class ConfigRepository {
  create(userId, sessionPath, delayBetweenMessages = 5, maxRetries = 3, autoSaveHistory = true) {
    const id = uuidv4();
    const sql = `
      INSERT INTO configurations (id, user_id, delay_between_messages, max_retries, session_path, auto_save_history, last_modified)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    db.run(sql, [id, userId, delayBetweenMessages, maxRetries, sessionPath, autoSaveHistory ? 1 : 0]);
    return this.findById(id);
  }

  findById(id) {
    const sql = 'SELECT * FROM configurations WHERE id = ?';
    return db.get(sql, [id]);
  }

  findByUserId(userId) {
    const sql = 'SELECT * FROM configurations WHERE user_id = ?';
    return db.get(sql, [userId]);
  }

  update(userId, updates) {
    const fields = [];
    const params = [];

    if (updates.delayBetweenMessages !== undefined) {
      fields.push('delay_between_messages = ?');
      params.push(updates.delayBetweenMessages);
    }

    if (updates.maxRetries !== undefined) {
      fields.push('max_retries = ?');
      params.push(updates.maxRetries);
    }

    if (updates.sessionPath !== undefined) {
      fields.push('session_path = ?');
      params.push(updates.sessionPath);
    }

    if (updates.autoSaveHistory !== undefined) {
      fields.push('auto_save_history = ?');
      params.push(updates.autoSaveHistory ? 1 : 0);
    }

    fields.push('last_modified = datetime(\'now\')');
    params.push(userId);

    const sql = `UPDATE configurations SET ${fields.join(', ')} WHERE user_id = ?`;
    db.run(sql, params);
    
    return this.findByUserId(userId);
  }

  delete(userId) {
    const sql = 'DELETE FROM configurations WHERE user_id = ?';
    db.run(sql, [userId]);
    return { success: true };
  }

  getOrCreate(userId, sessionPath) {
    let config = this.findByUserId(userId);
    
    if (!config) {
      config = this.create(userId, sessionPath);
    }
    
    return config;
  }
}

module.exports = new ConfigRepository();
