const { v4: uuidv4 } = require('uuid');
const db = require('../storage');

class ContactRepository {
  create(userId, name, phoneNumber, formattedNumber) {
    const id = uuidv4();
    const sql = `
      INSERT INTO contacts (id, user_id, name, phone_number, formatted_number, is_valid, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `;
    
    db.run(sql, [id, userId, name, phoneNumber, formattedNumber]);
    return this.findById(id);
  }

  findById(id) {
    const sql = 'SELECT * FROM contacts WHERE id = ?';
    return db.get(sql, [id]);
  }

  findByUserId(userId) {
    const sql = 'SELECT * FROM contacts WHERE user_id = ? ORDER BY name ASC';
    return db.all(sql, [userId]);
  }

  findByPhoneNumber(userId, phoneNumber) {
    const sql = 'SELECT * FROM contacts WHERE user_id = ? AND phone_number = ?';
    return db.get(sql, [userId, phoneNumber]);
  }

  search(userId, searchTerm) {
    const sql = `
      SELECT * FROM contacts 
      WHERE user_id = ? AND (name LIKE ? OR phone_number LIKE ?)
      ORDER BY name ASC
    `;
    const term = `%${searchTerm}%`;
    return db.all(sql, [userId, term, term]);
  }

  update(id, name, phoneNumber, formattedNumber) {
    const sql = `
      UPDATE contacts 
      SET name = ?, phone_number = ?, formatted_number = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    db.run(sql, [name, phoneNumber, formattedNumber, id]);
    return this.findById(id);
  }

  delete(id) {
    const sql = 'DELETE FROM contacts WHERE id = ?';
    db.run(sql, [id]);
    return { success: true };
  }

  checkDuplicate(userId, phoneNumber, excludeId = null) {
    let sql = 'SELECT id FROM contacts WHERE user_id = ? AND phone_number = ?';
    const params = [userId, phoneNumber];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = db.get(sql, params);
    return result !== null;
  }

  count(userId) {
    const sql = 'SELECT COUNT(*) as count FROM contacts WHERE user_id = ?';
    const result = db.get(sql, [userId]);
    return result ? result.count : 0;
  }

  bulkCreate(userId, contacts) {
    const results = {
      success: [],
      duplicates: [],
      errors: []
    };

    contacts.forEach(contact => {
      try {
        if (this.checkDuplicate(userId, contact.phoneNumber)) {
          results.duplicates.push(contact);
        } else {
          const created = this.create(userId, contact.name, contact.phoneNumber, contact.formattedNumber);
          results.success.push(created);
        }
      } catch (error) {
        results.errors.push({ contact, error: error.message });
      }
    });

    return results;
  }
}

module.exports = new ContactRepository();
