const { ipcMain, dialog } = require('electron');
const ReportRepository = require('../persistence/repositories/reportRepository');
const userRepository = require('../persistence/repositories/userRepository');
const fs = require('fs');
const path = require('path');

function setupReportHandlers(db) {
  const reportRepository = new ReportRepository(db);

  ipcMain.handle('reports:get-statistics', async (event) => {
    try {
      const user = userRepository.getOrCreate();
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const statistics = reportRepository.getStatisticsByUserId(user.id);
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:get-recent-messages', async (event, data) => {
    try {
      const { limit = 50 } = data || {};
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const messages = reportRepository.getRecentMessages(user.id, limit);
      
      return {
        success: true,
        messages
      };
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:get-messages-by-status', async (event, data) => {
    try {
      const { status } = data;
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const messages = reportRepository.getMessagesByStatus(user.id, status);
      
      return {
        success: true,
        messages
      };
    } catch (error) {
      console.error('Error getting messages by status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:get-messages-with-filters', async (event, data) => {
    try {
      const { filters } = data;
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const result = reportRepository.getMessagesWithFilters(user.id, filters);
      
      return {
        success: true,
        messages: result.messages,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error getting messages with filters:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:get-top-contacts', async (event, data) => {
    try {
      const { limit = 10 } = data || {};
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const topContacts = reportRepository.getTopContacts(user.id, limit);
      
      return {
        success: true,
        topContacts
      };
    } catch (error) {
      console.error('Error getting top contacts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:get-messages-by-day', async (event, data) => {
    try {
      const { days = 7 } = data || {};
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const messagesByDay = reportRepository.getMessageCountByDay(user.id, days);
      
      return {
        success: true,
        messagesByDay
      };
    } catch (error) {
      console.error('Error getting messages by day:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:export-csv', async (event) => {
    try {
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const messages = reportRepository.getAllMessagesForExport(user.id);
      
      if (messages.length === 0) {
        return {
          success: false,
          error: 'No messages to export'
        };
      }

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Messages Report',
        defaultPath: `messages-report-${new Date().toISOString().split('T')[0]}.csv`,
        filters: [
          { name: 'CSV Files', extensions: ['csv'] }
        ]
      });

      if (!filePath) {
        return {
          success: false,
          error: 'Export cancelled'
        };
      }

      const headers = ['ID', 'Phone Number', 'Contact Name', 'Message', 'Status', 'Error', 'File Path', 'Created At', 'Sent At'];
      const csvRows = [headers.join(',')];

      messages.forEach(msg => {
        const row = [
          msg.id || '',
          msg.phone_number || '',
          msg.contact_name || '',
          `"${(msg.content || '').replace(/"/g, '""')}"`,
          msg.status || '',
          `"${(msg.error_message || '').replace(/"/g, '""')}"`,
          msg.file_path || '',
          msg.created_at || '',
          msg.sent_at || ''
        ];
        csvRows.push(row.join(','));
      });

      fs.writeFileSync(filePath, csvRows.join('\n'), 'utf8');

      return {
        success: true,
        filePath,
        count: messages.length
      };
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('reports:export-json', async (event) => {
    try {
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const messages = reportRepository.getAllMessagesForExport(user.id);
      
      if (messages.length === 0) {
        return {
          success: false,
          error: 'No messages to export'
        };
      }

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Messages Report',
        defaultPath: `messages-report-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });

      if (!filePath) {
        return {
          success: false,
          error: 'Export cancelled'
        };
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        totalMessages: messages.length,
        messages: messages
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf8');

      return {
        success: true,
        filePath,
        count: messages.length
      };
    } catch (error) {
      console.error('Error exporting JSON:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Report IPC handlers registered');
}

module.exports = { setupReportHandlers };
