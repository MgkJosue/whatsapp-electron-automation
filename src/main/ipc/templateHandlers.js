const { ipcMain } = require('electron');
const TemplateRepository = require('../persistence/repositories/templateRepository');
const userRepository = require('../persistence/repositories/userRepository');

function setupTemplateHandlers(db) {
  const templateRepository = new TemplateRepository(db);

  ipcMain.handle('templates:create', async (event, data) => {
    try {
      const { name, content, category, mediaPath } = data;
      
      if (!name || !content) {
        return {
          success: false,
          error: 'Name and content are required'
        };
      }

      const user = userRepository.getOrCreate();
      if (!user || !user.id) {
        console.error('Failed to get or create user:', user);
        return {
          success: false,
          error: 'User not found or could not be created'
        };
      }

      console.log('Creating template for user:', user.id);
      const template = templateRepository.create(user.id, name, content, category, mediaPath);
      
      return {
        success: true,
        template
      };
    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('templates:get-all', async (event) => {
    try {
      const user = userRepository.getOrCreate();
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const templates = templateRepository.findByUserId(user.id);
      
      return {
        success: true,
        templates
      };
    } catch (error) {
      console.error('Error getting templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('templates:get-by-id', async (event, data) => {
    try {
      const { id } = data;
      const template = templateRepository.findById(id);
      
      if (!template) {
        return {
          success: false,
          error: 'Template not found'
        };
      }

      return {
        success: true,
        template
      };
    } catch (error) {
      console.error('Error getting template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('templates:get-by-category', async (event, data) => {
    try {
      const { category } = data;
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const templates = templateRepository.findByCategory(user.id, category);
      
      return {
        success: true,
        templates
      };
    } catch (error) {
      console.error('Error getting templates by category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('templates:update', async (event, data) => {
    try {
      const { id, name, content, category, mediaPath } = data;
      
      if (!id || !name || !content) {
        return {
          success: false,
          error: 'ID, name and content are required'
        };
      }

      const template = templateRepository.update(id, name, content, category, mediaPath);
      
      if (!template) {
        return {
          success: false,
          error: 'Template not found'
        };
      }

      return {
        success: true,
        template
      };
    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('templates:delete', async (event, data) => {
    try {
      const { id } = data;
      
      templateRepository.delete(id);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('templates:search', async (event, data) => {
    try {
      const { searchTerm } = data;
      const user = userRepository.getOrCreate();
      
      if (!user || !user.id) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const templates = templateRepository.search(user.id, searchTerm);
      
      return {
        success: true,
        templates
      };
    } catch (error) {
      console.error('Error searching templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  console.log('Template IPC handlers registered');
}

module.exports = { setupTemplateHandlers };
