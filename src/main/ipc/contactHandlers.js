const { ipcMain, dialog } = require('electron');
const contactRepository = require('../persistence/repositories/contactRepository');
const userRepository = require('../persistence/repositories/userRepository');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const GoogleContactsParser = require('../utils/googleContactsParser');

function setupContactHandlers(mainWindow) {
  ipcMain.handle('contacts:get-all', async () => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const contacts = contactRepository.findByUserId(user.id);
      return { success: true, contacts };
    } catch (error) {
      console.error('Error getting contacts:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:get-paginated', async (event, { page = 1, limit = 50 }) => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const result = contactRepository.findByUserIdPaginated(user.id, page, limit);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error getting paginated contacts:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:create', async (event, { name, phoneNumber }) => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const formattedNumber = phoneNumber.replace(/\D/g, '');
      
      if (contactRepository.checkDuplicate(user.id, phoneNumber)) {
        return { success: false, error: 'Contact with this phone number already exists' };
      }

      const contact = contactRepository.create(user.id, name, phoneNumber, formattedNumber);
      return { success: true, contact };
    } catch (error) {
      console.error('Error creating contact:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:update', async (event, { id, name, phoneNumber }) => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const formattedNumber = phoneNumber.replace(/\D/g, '');
      
      if (contactRepository.checkDuplicate(user.id, phoneNumber, id)) {
        return { success: false, error: 'Another contact with this phone number already exists' };
      }

      const contact = contactRepository.update(id, name, phoneNumber, formattedNumber);
      return { success: true, contact };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:delete', async (event, { id }) => {
    try {
      contactRepository.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:search', async (event, { searchTerm }) => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const contacts = contactRepository.search(user.id, searchTerm);
      return { success: true, contacts };
    } catch (error) {
      console.error('Error searching contacts:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:search-paginated', async (event, { searchTerm, page = 1, limit = 50 }) => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const result = contactRepository.searchPaginated(user.id, searchTerm, page, limit);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error searching paginated contacts:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:import-csv', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Contacts from CSV',
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: false, error: 'No file selected' };
      }

      const filePath = result.filePaths[0];
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase()
      });

      if (parsed.errors.length > 0) {
        console.error('CSV parsing errors:', parsed.errors);
        return { success: false, error: 'Error parsing CSV file' };
      }

      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const contacts = parsed.data.map(row => ({
        name: row.name || row.nombre || '',
        phoneNumber: row.phone || row.phone_number || row.telefono || row.numero || '',
        formattedNumber: (row.phone || row.phone_number || row.telefono || row.numero || '').replace(/\D/g, '')
      })).filter(contact => contact.name && contact.phoneNumber);

      if (contacts.length === 0) {
        return { success: false, error: 'No valid contacts found in CSV. Expected columns: name, phone' };
      }

      const results = contactRepository.bulkCreate(user.id, contacts);

      return {
        success: true,
        imported: results.success.length,
        duplicates: results.duplicates.length,
        errors: results.errors.length,
        details: results
      };
    } catch (error) {
      console.error('Error importing CSV:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:delete-all', async () => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const contacts = contactRepository.findByUserId(user.id);
      contacts.forEach(contact => {
        contactRepository.delete(contact.id);
      });

      return { success: true, count: contacts.length };
    } catch (error) {
      console.error('Error deleting all contacts:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:delete-selected', async (event, { ids }) => {
    try {
      if (!ids || ids.length === 0) {
        return { success: false, error: 'No contacts selected' };
      }

      ids.forEach(id => {
        contactRepository.delete(id);
      });

      return { success: true, count: ids.length };
    } catch (error) {
      console.error('Error deleting selected contacts:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:download-example', async () => {
    try {
      const exampleCSV = 'name,phone\nJohn Doe,+12345678901\nJane Smith,+12345678902\nCarlos Rodriguez,+12345678903';
      
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Download Example CSV',
        defaultPath: 'example_contacts.csv',
        filters: [
          { name: 'CSV Files', extensions: ['csv'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Download canceled' };
      }

      fs.writeFileSync(result.filePath, exampleCSV, 'utf-8');
      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('Error downloading example:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:export-csv', async () => {
    try {
      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const contacts = contactRepository.findByUserId(user.id);

      if (!contacts || contacts.length === 0) {
        return { success: false, error: 'No contacts to export' };
      }

      const csvData = contacts.map(contact => ({
        name: contact.name,
        phone: contact.phone_number
      }));

      const csv = Papa.unparse(csvData);

      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Contacts to CSV',
        defaultPath: `contacts_${new Date().toISOString().split('T')[0]}.csv`,
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export canceled' };
      }

      fs.writeFileSync(result.filePath, csv, 'utf-8');

      return {
        success: true,
        filePath: result.filePath,
        count: contacts.length
      };
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('contacts:import-google-csv', async (event, { countryCode = '+593' }) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Importar Contactos de Google',
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: false, error: 'No se seleccionó ningún archivo' };
      }

      const filePath = result.filePaths[0];
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const parser = new GoogleContactsParser(countryCode);
      const parseResult = await parser.parseCSV(fileContent);

      if (!parseResult.success) {
        return { success: false, error: 'Error al procesar el archivo CSV' };
      }

      const user = userRepository.getFirst();
      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const contactsToImport = parseResult.contacts.map(contact => ({
        name: contact.name,
        phoneNumber: contact.phone,
        formattedNumber: contact.phone.replace(/\D/g, '')
      }));

      const importResults = contactRepository.bulkCreate(user.id, contactsToImport);

      const report = parser.generateReport(parseResult);

      return {
        success: true,
        imported: importResults.success.length,
        duplicates: importResults.duplicates.length + parseResult.duplicatesRemoved,
        errors: importResults.errors.length + parseResult.errors.length,
        report: report,
        details: {
          importResults: importResults,
          parseResult: parseResult
        }
      };
    } catch (error) {
      console.error('Error importing Google CSV:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('Contact handlers registered');
}

module.exports = { setupContactHandlers };
