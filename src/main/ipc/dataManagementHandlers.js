const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function setupDataManagementHandlers(db, dbPath) {
  
  ipcMain.handle('data:delete-all', async (event) => {
    try {
      // Delete all contacts
      db.run('DELETE FROM contacts', []);
      
      // Delete all messages
      db.run('DELETE FROM messages', []);
      
      // Delete all templates
      db.run('DELETE FROM message_templates', []);
      
      // Delete all sessions (will force re-authentication)
      db.run('DELETE FROM sessions', []);
      
      // Keep users and configurations for next login
      
      console.log('All user data deleted successfully');
      
      return {
        success: true,
        message: 'All data deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting all data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('data:get-database-size', async (event) => {
    try {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const sizeInBytes = stats.size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        return {
          success: true,
          sizeInBytes,
          sizeInMB,
          path: dbPath
        };
      } else {
        return {
          success: false,
          error: 'Database file not found'
        };
      }
    } catch (error) {
      console.error('Error getting database size:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('data:get-statistics-count', async (event) => {
    try {
      const contactsResult = db.exec('SELECT COUNT(*) as count FROM contacts', []);
      const messagesResult = db.exec('SELECT COUNT(*) as count FROM messages', []);
      const templatesResult = db.exec('SELECT COUNT(*) as count FROM message_templates', []);
      
      const contactsCount = contactsResult.length > 0 ? contactsResult[0].values[0][0] : 0;
      const messagesCount = messagesResult.length > 0 ? messagesResult[0].values[0][0] : 0;
      const templatesCount = templatesResult.length > 0 ? templatesResult[0].values[0][0] : 0;
      
      return {
        success: true,
        counts: {
          contacts: contactsCount,
          messages: messagesCount,
          templates: templatesCount
        }
      };
    } catch (error) {
      console.error('Error getting statistics count:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('data:vacuum-database', async (event) => {
    try {
      // VACUUM reclaims unused space and optimizes the database
      db.run('VACUUM', []);
      
      console.log('Database vacuumed successfully');
      
      return {
        success: true,
        message: 'Database optimized successfully'
      };
    } catch (error) {
      console.error('Error vacuuming database:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Data management IPC handlers registered');
}

module.exports = { setupDataManagementHandlers };
