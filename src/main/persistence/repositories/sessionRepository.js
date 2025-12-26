const { v4: uuidv4 } = require('uuid');
const db = require('../storage');

class SessionRepository {
  create(userId, sessionData = null) {
    const id = uuidv4();
    const sql = `
      INSERT INTO sessions (id, user_id, session_data, is_authenticated, last_activity, created_at)
      VALUES (?, ?, ?, 0, datetime('now'), datetime('now'))
    `;
    
    db.run(sql, [id, userId, sessionData]);
    return this.findById(id);
  }

  findById(id) {
    const sql = 'SELECT * FROM sessions WHERE id = ?';
    return db.get(sql, [id]);
  }

  findByUserId(userId) {
    const sql = 'SELECT * FROM sessions WHERE user_id = ?';
    return db.get(sql, [userId]);
  }

  updateSessionData(userId, sessionData) {
    const sql = `
      UPDATE sessions 
      SET session_data = ?, last_activity = datetime('now')
      WHERE user_id = ?
    `;
    db.run(sql, [sessionData, userId]);
    return this.findByUserId(userId);
  }

  setAuthenticated(userId, isAuthenticated) {
    const sql = `
      UPDATE sessions 
      SET is_authenticated = ?, last_activity = datetime('now')
      WHERE user_id = ?
    `;
    db.run(sql, [isAuthenticated ? 1 : 0, userId]);
    return this.findByUserId(userId);
  }

  updateActivity(userId) {
    const sql = 'UPDATE sessions SET last_activity = datetime(\'now\') WHERE user_id = ?';
    db.run(sql, [userId]);
    return this.findByUserId(userId);
  }

  delete(userId) {
    const sql = 'DELETE FROM sessions WHERE user_id = ?';
    db.run(sql, [userId]);
    return { success: true };
  }

  getOrCreate(userId) {
    let session = this.findByUserId(userId);
    
    if (!session) {
      session = this.create(userId);
    }
    
    return session;
  }

  isAuthenticated(userId) {
    const session = this.findByUserId(userId);
    return session ? session.is_authenticated === 1 : false;
  }
}

module.exports = new SessionRepository();
