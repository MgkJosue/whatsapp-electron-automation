class ReportRepository {
  constructor(db) {
    this.db = db;
  }

  getStatisticsByUserId(userId) {
    const result = this.db.exec(`
      SELECT 
        COUNT(*) as total_messages,
        SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as sent_messages,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_messages,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_messages,
        SUM(CASE WHEN status = 'SENDING' THEN 1 ELSE 0 END) as sending_messages
      FROM messages
      WHERE user_id = ?
    `, [userId]);

    if (result.length === 0 || result[0].values.length === 0) {
      return {
        total_messages: 0,
        sent_messages: 0,
        failed_messages: 0,
        pending_messages: 0,
        sending_messages: 0,
        success_rate: 0
      };
    }

    const stats = this._mapRowToObject(result[0].columns, result[0].values[0]);
    
    const successRate = stats.total_messages > 0 
      ? ((stats.sent_messages / stats.total_messages) * 100).toFixed(2)
      : 0;

    return {
      ...stats,
      success_rate: parseFloat(successRate)
    };
  }

  getMessagesByDateRange(userId, startDate, endDate) {
    const result = this.db.exec(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM messages
      WHERE user_id = ?
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [userId, startDate, endDate]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  getRecentMessages(userId, limit = 50) {
    const result = this.db.exec(`
      SELECT 
        m.id,
        m.phone_number,
        m.content,
        m.status,
        m.error_message,
        m.created_at,
        m.sent_at,
        c.name as contact_name
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `, [userId, limit]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  getMessagesByStatus(userId, status) {
    const result = this.db.exec(`
      SELECT 
        m.id,
        m.phone_number,
        m.content,
        m.status,
        m.error_message,
        m.created_at,
        m.sent_at,
        c.name as contact_name
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ? AND m.status = ?
      ORDER BY m.created_at DESC
    `, [userId, status]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  getMessagesByContact(userId, phoneNumber) {
    const result = this.db.exec(`
      SELECT 
        m.id,
        m.phone_number,
        m.content,
        m.status,
        m.error_message,
        m.created_at,
        m.sent_at,
        c.name as contact_name
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ? AND m.phone_number = ?
      ORDER BY m.created_at DESC
    `, [userId, phoneNumber]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  getMessagesWithFilters(userId, filters = {}) {
    // First, get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ?
    `;

    const countParams = [userId];

    if (filters.status) {
      countQuery += ` AND m.status = ?`;
      countParams.push(filters.status);
    }

    if (filters.phoneNumber) {
      countQuery += ` AND m.phone_number LIKE ?`;
      countParams.push(`%${filters.phoneNumber}%`);
    }

    if (filters.startDate) {
      countQuery += ` AND m.created_at >= ?`;
      countParams.push(filters.startDate);
    }

    if (filters.endDate) {
      countQuery += ` AND m.created_at <= ?`;
      countParams.push(filters.endDate);
    }

    if (filters.searchTerm) {
      countQuery += ` AND (m.content LIKE ? OR c.name LIKE ?)`;
      countParams.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
    }

    const countResult = this.db.exec(countQuery, countParams);
    const totalCount = countResult.length > 0 ? countResult[0].values[0][0] : 0;

    // Now get the paginated results
    let query = `
      SELECT 
        m.id,
        m.phone_number,
        m.content,
        m.status,
        m.error_message,
        m.created_at,
        m.sent_at,
        c.name as contact_name
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ?
    `;

    const params = [userId];

    if (filters.status) {
      query += ` AND m.status = ?`;
      params.push(filters.status);
    }

    if (filters.phoneNumber) {
      query += ` AND m.phone_number LIKE ?`;
      params.push(`%${filters.phoneNumber}%`);
    }

    if (filters.startDate) {
      query += ` AND m.created_at >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND m.created_at <= ?`;
      params.push(filters.endDate);
    }

    if (filters.searchTerm) {
      query += ` AND (m.content LIKE ? OR c.name LIKE ?)`;
      params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
    }

    query += ` ORDER BY m.created_at DESC`;

    // Add pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = this.db.exec(query, params);

    const messages = result.length === 0 ? [] : result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );

    return {
      messages,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  getTopContacts(userId, limit = 10) {
    const result = this.db.exec(`
      SELECT 
        m.phone_number,
        c.name as contact_name,
        COUNT(*) as message_count,
        SUM(CASE WHEN m.status = 'SENT' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN m.status = 'FAILED' THEN 1 ELSE 0 END) as failed_count
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ?
      GROUP BY m.phone_number, c.name
      ORDER BY message_count DESC
      LIMIT ?
    `, [userId, limit]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  getMessageCountByDay(userId, days = 7) {
    const result = this.db.exec(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM messages
      WHERE user_id = ?
        AND created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [userId, days]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  getAllMessagesForExport(userId) {
    const result = this.db.exec(`
      SELECT 
        m.id,
        m.phone_number,
        c.name as contact_name,
        m.content,
        m.status,
        m.error_message,
        m.file_path,
        m.created_at,
        m.sent_at
      FROM messages m
      LEFT JOIN contacts c ON m.contact_id = c.id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
    `, [userId]);

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map(row => 
      this._mapRowToObject(result[0].columns, row)
    );
  }

  _mapRowToObject(columns, row) {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  }
}

module.exports = ReportRepository;
