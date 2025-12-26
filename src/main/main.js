const { app, BrowserWindow } = require('electron');
const path = require('path');
const db = require('./persistence/storage');
const { setupMessageHandlers } = require('./ipc/messageHandlers');
const { setupContactHandlers } = require('./ipc/contactHandlers');
const { setupTemplateHandlers } = require('./ipc/templateHandlers');
const { setupReportHandlers } = require('./ipc/reportHandlers');
const { setupDataManagementHandlers } = require('./ipc/dataManagementHandlers');
const whatsappService = require('./services/whatsapp.service');

let mainWindow;

async function initializeApp() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../renderer/assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  setupMessageHandlers(mainWindow);
  setupContactHandlers(mainWindow);
  setupTemplateHandlers(db.db);
  setupReportHandlers(db.db);
  setupDataManagementHandlers(db.db, db.dbPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initializeApp();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  try {
    await whatsappService.destroy();
    db.close();
    console.log('Application cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});
