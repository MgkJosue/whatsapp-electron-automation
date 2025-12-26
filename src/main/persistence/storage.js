const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

class Database {
  constructor() {
    this.db = null;
    
    try {
      const { app } = require('electron');
      this.dbPath = path.join(app.getPath('userData'), 'whatsapp-automation.db');
    } catch (error) {
      this.dbPath = path.join(os.tmpdir(), 'whatsapp-automation-test.db');
    }
  }

  async initialize() {
    try {
      const SQL = await initSqlJs();
      
      if (fs.existsSync(this.dbPath)) {
        const buffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(buffer);
        console.log('Database loaded from:', this.dbPath);
      } else {
        this.db = new SQL.Database();
        await this.createSchema();
        this.save();
        console.log('New database created at:', this.dbPath);
      }
      
      return this.db;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        whatsapp_phone_number TEXT UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_login_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        session_data TEXT,
        is_authenticated INTEGER NOT NULL DEFAULT 0,
        last_activity TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS configurations (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        delay_between_messages INTEGER NOT NULL DEFAULT 5,
        max_retries INTEGER NOT NULL DEFAULT 3,
        session_path TEXT NOT NULL,
        auto_save_history INTEGER NOT NULL DEFAULT 1,
        last_modified TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        formatted_number TEXT NOT NULL,
        is_valid INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        contact_id TEXT,
        phone_number TEXT NOT NULL,
        content TEXT NOT NULL,
        file_path TEXT,
        file_name TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        error_message TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        sent_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS message_templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        media_path TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS message_queue (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        contact_id TEXT,
        phone_number TEXT NOT NULL,
        contact_name TEXT,
        message_content TEXT NOT NULL,
        media_path TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        error_message TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        position INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        processed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS queue_state (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        is_paused INTEGER NOT NULL DEFAULT 0,
        is_processing INTEGER NOT NULL DEFAULT 0,
        current_position INTEGER NOT NULL DEFAULT 0,
        total_messages INTEGER NOT NULL DEFAULT 0,
        processed_count INTEGER NOT NULL DEFAULT 0,
        success_count INTEGER NOT NULL DEFAULT 0,
        failed_count INTEGER NOT NULL DEFAULT 0,
        last_updated TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_authenticated ON sessions(is_authenticated);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_configurations_user_id ON configurations(user_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_user_phone_unique ON contacts(user_id, phone_number);
      CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
      CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages(contact_id);
      CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
      CREATE INDEX IF NOT EXISTS idx_templates_user_id ON message_templates(user_id);
      CREATE INDEX IF NOT EXISTS idx_templates_category ON message_templates(category);
      CREATE INDEX IF NOT EXISTS idx_messages_phone ON messages(phone_number);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_user_status ON messages(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_queue_user_id ON message_queue(user_id);
      CREATE INDEX IF NOT EXISTS idx_queue_status ON message_queue(status);
      CREATE INDEX IF NOT EXISTS idx_queue_position ON message_queue(position);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_state_user_id ON queue_state(user_id);
    `;

    this.db.run(schema);
    console.log('Database schema created successfully');
  }

  run(sql, params = []) {
    try {
      this.db.run(sql, params);
      this.save();
      return { success: true };
    } catch (error) {
      console.error('Error running SQL:', error);
      throw error;
    }
  }

  get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      
      stmt.free();
      return null;
    } catch (error) {
      console.error('Error executing get query:', error);
      throw error;
    }
  }

  all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Error executing all query:', error);
      throw error;
    }
  }

  save() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error('Error saving database:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.save();
      this.db.close();
      console.log('Database closed');
    }
  }
}

const database = new Database();

module.exports = database;
