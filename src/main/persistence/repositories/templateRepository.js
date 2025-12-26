const { v4: uuidv4 } = require('uuid');

class TemplateRepository {
  constructor(db) {
    this.db = db;
  }

  create(userId, name, content, category = null, mediaPath = null) {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    this.db.run(
      `INSERT INTO message_templates (id, user_id, name, content, category, media_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, name, content, category, mediaPath, now, now]
    );
    
    return this.findById(id);
  }

  findById(id) {
    const result = this.db.exec(
      `SELECT * FROM message_templates WHERE id = ?`,
      [id]
    );
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    
    return this._mapRowToTemplate(result[0].columns, result[0].values[0]);
  }

  findByUserId(userId) {
    const result = this.db.exec(
      `SELECT * FROM message_templates WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    
    if (result.length === 0) {
      return [];
    }
    
    return result[0].values.map(row => 
      this._mapRowToTemplate(result[0].columns, row)
    );
  }

  findByCategory(userId, category) {
    const result = this.db.exec(
      `SELECT * FROM message_templates WHERE user_id = ? AND category = ? ORDER BY created_at DESC`,
      [userId, category]
    );
    
    if (result.length === 0) {
      return [];
    }
    
    return result[0].values.map(row => 
      this._mapRowToTemplate(result[0].columns, row)
    );
  }

  update(id, name, content, category = null, mediaPath = null) {
    const now = new Date().toISOString();
    
    this.db.run(
      `UPDATE message_templates 
       SET name = ?, content = ?, category = ?, media_path = ?, updated_at = ?
       WHERE id = ?`,
      [name, content, category, mediaPath, now, id]
    );
    
    return this.findById(id);
  }

  delete(id) {
    this.db.run(
      `DELETE FROM message_templates WHERE id = ?`,
      [id]
    );
    
    return true;
  }

  deleteByUserId(userId) {
    const result = this.db.exec(
      `SELECT COUNT(*) as count FROM message_templates WHERE user_id = ?`,
      [userId]
    );
    
    const count = result[0].values[0][0];
    
    this.db.run(
      `DELETE FROM message_templates WHERE user_id = ?`,
      [userId]
    );
    
    return count;
  }

  search(userId, searchTerm) {
    const result = this.db.exec(
      `SELECT * FROM message_templates 
       WHERE user_id = ? AND (name LIKE ? OR content LIKE ?)
       ORDER BY created_at DESC`,
      [userId, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    
    if (result.length === 0) {
      return [];
    }
    
    return result[0].values.map(row => 
      this._mapRowToTemplate(result[0].columns, row)
    );
  }

  _mapRowToTemplate(columns, row) {
    const template = {};
    columns.forEach((col, index) => {
      template[col] = row[index];
    });
    return template;
  }
}

module.exports = TemplateRepository;
