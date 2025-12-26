const { v4: uuidv4 } = require('uuid');
const db = require('../storage');

class UserRepository {
  create(whatsappPhoneNumber = null) {
    const id = uuidv4();
    const sql = `
      INSERT INTO users (id, whatsapp_phone_number, created_at, last_login_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `;
    
    db.run(sql, [id, whatsappPhoneNumber]);
    return this.findById(id);
  }

  findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return db.get(sql, [id]);
  }

  findByPhoneNumber(phoneNumber) {
    const sql = 'SELECT * FROM users WHERE whatsapp_phone_number = ?';
    return db.get(sql, [phoneNumber]);
  }

  getFirst() {
    const sql = 'SELECT * FROM users LIMIT 1';
    return db.get(sql, []);
  }

  updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login_at = datetime(\'now\') WHERE id = ?';
    db.run(sql, [id]);
    return this.findById(id);
  }

  updatePhoneNumber(id, phoneNumber) {
    const sql = 'UPDATE users SET whatsapp_phone_number = ? WHERE id = ?';
    db.run(sql, [phoneNumber, id]);
    return this.findById(id);
  }

  delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [id]);
    return { success: true };
  }

  getOrCreate() {
    let user = this.getFirst();
    
    if (!user) {
      user = this.create();
    }
    
    return user;
  }
}

module.exports = new UserRepository();
