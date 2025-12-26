const { ipcMain } = require('electron');
const whatsappService = require('../services/whatsapp.service');
const messageRepository = require('../persistence/repositories/messageRepository');
const userRepository = require('../persistence/repositories/userRepository');
const configRepository = require('../persistence/repositories/configRepository');
const phoneValidator = require('../validators/phoneValidator');
const messageQueue = require('../services/messageQueue.service');

function setupMessageHandlers(mainWindow) {
  messageQueue.onStatusChange((status) => {
    mainWindow.webContents.send('message-queue:status', status);
  });

  ipcMain.on('whatsapp:initialize', async (event) => {
    try {
      const sessionPath = './.wwebjs_auth';
      
      whatsappService.onQR((qr) => {
        mainWindow.webContents.send('whatsapp:qr', qr);
      });

      whatsappService.onReady((clientInfo) => {
        mainWindow.webContents.send('whatsapp:ready', clientInfo);
      });

      whatsappService.onAuthFailure((error) => {
        mainWindow.webContents.send('whatsapp:auth-failure', error);
      });

      whatsappService.onDisconnected((reason) => {
        mainWindow.webContents.send('whatsapp:disconnected', reason);
      });

      await whatsappService.initialize(sessionPath);
      
      event.reply('whatsapp:initialize-response', { success: true });
    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      event.reply('whatsapp:initialize-response', { 
        success: false, 
        error: error.message 
      });
    }
  });

  ipcMain.on('whatsapp:get-state', async (event) => {
    try {
      const state = await whatsappService.getState();
      const isReady = whatsappService.isClientReady();
      const isAuthenticating = whatsappService.isClientAuthenticating();
      
      event.reply('whatsapp:state-response', {
        state,
        isReady,
        isAuthenticating
      });
    } catch (error) {
      event.reply('whatsapp:state-response', {
        state: 'ERROR',
        isReady: false,
        isAuthenticating: false,
        error: error.message
      });
    }
  });

  ipcMain.handle('whatsapp:send-message', async (event, data) => {
    try {
      const { phoneNumber, message, mediaPath, contactId, contactName } = data;
      
      const validation = phoneValidator.validate(phoneNumber);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          validationError: true
        };
      }

      const user = userRepository.getFirst();
      if (!user) {
        throw new Error('User not found');
      }

      const fileName = mediaPath ? require('path').basename(mediaPath) : null;
      
      const messageRecord = messageRepository.create(
        user.id,
        validation.formatted,
        message,
        contactId || null,
        mediaPath || null,
        fileName
      );

      const queueData = {
        messageId: messageRecord.id,
        phoneNumber: validation.formatted,
        message,
        mediaPath: mediaPath || null,
        contactName: contactName || validation.formatted
      };

      await messageQueue.addToQueue(queueData);

      return {
        success: true,
        messageId: messageRecord.id,
        formattedPhone: validation.formatted
      };

    } catch (error) {
      console.error('Error queueing message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.on('whatsapp:send-message', async (event, data) => {
    try {
      const { phoneNumber, message, contactId } = data;
      
      const validation = phoneValidator.validate(phoneNumber);
      if (!validation.isValid) {
        event.reply('whatsapp:send-message-response', {
          success: false,
          error: validation.error,
          validationError: true
        });
        return;
      }

      const user = userRepository.getFirst();
      if (!user) {
        throw new Error('User not found');
      }

      const messageRecord = messageRepository.create(
        user.id,
        validation.formatted,
        message,
        contactId || null
      );

      const queueData = {
        messageId: messageRecord.id,
        phoneNumber: validation.formatted,
        message,
        mediaPath: null
      };

      await messageQueue.addToQueue(queueData);

      event.reply('whatsapp:send-message-response', {
        success: true,
        messageId: messageRecord.id,
        formattedPhone: validation.formatted
      });

    } catch (error) {
      console.error('Error queueing message:', error);

      event.reply('whatsapp:send-message-response', {
        success: false,
        error: error.message
      });
    }
  });

  ipcMain.on('whatsapp:send-message-with-media', async (event, data) => {
    try {
      const { phoneNumber, message, mediaPath, contactId } = data;
      
      const validation = phoneValidator.validate(phoneNumber);
      if (!validation.isValid) {
        event.reply('whatsapp:send-message-response', {
          success: false,
          error: validation.error,
          validationError: true
        });
        return;
      }

      const user = userRepository.getFirst();
      if (!user) {
        throw new Error('User not found');
      }

      const fileName = require('path').basename(mediaPath);
      
      const messageRecord = messageRepository.create(
        user.id,
        validation.formatted,
        message,
        contactId || null,
        mediaPath,
        fileName
      );

      const queueData = {
        messageId: messageRecord.id,
        phoneNumber: validation.formatted,
        message,
        mediaPath
      };

      await messageQueue.addToQueue(queueData);

      event.reply('whatsapp:send-message-response', {
        success: true,
        messageId: messageRecord.id,
        formattedPhone: validation.formatted
      });

    } catch (error) {
      console.error('Error queueing message with media:', error);

      event.reply('whatsapp:send-message-response', {
        success: false,
        error: error.message
      });
    }
  });

  ipcMain.on('whatsapp:logout', async (event) => {
    try {
      await whatsappService.logout();
      event.reply('whatsapp:logout-response', { success: true });
      
      mainWindow.webContents.send('whatsapp:logged-out');
    } catch (error) {
      event.reply('whatsapp:logout-response', {
        success: false,
        error: error.message
      });
    }
  });

  ipcMain.on('whatsapp:get-client-info', (event) => {
    try {
      const info = whatsappService.getClientInfo();
      event.reply('whatsapp:client-info-response', info);
    } catch (error) {
      event.reply('whatsapp:client-info-response', null);
    }
  });

  ipcMain.on('message-queue:pause', (event) => {
    messageQueue.pause();
    event.reply('message-queue:pause-response', { success: true });
  });

  ipcMain.on('message-queue:resume', (event) => {
    messageQueue.resume();
    event.reply('message-queue:resume-response', { success: true });
  });

  ipcMain.on('message-queue:stop', (event) => {
    messageQueue.stop();
    event.reply('message-queue:stop-response', { success: true });
  });

  ipcMain.on('message-queue:get-status', (event) => {
    const status = messageQueue.getStatus();
    event.reply('message-queue:status-response', status);
  });

  ipcMain.on('config:save-delay', (event, data) => {
    try {
      const { delay } = data;
      const user = userRepository.getFirst();
      
      if (!user) {
        throw new Error('User not found');
      }

      const config = configRepository.findByUserId(user.id);
      
      if (config) {
        configRepository.update(user.id, { delayBetweenMessages: delay });
      } else {
        configRepository.create(user.id, './.wwebjs_auth', delay);
      }

      event.reply('config:save-delay-response', { success: true });
    } catch (error) {
      console.error('Error saving delay configuration:', error);
      event.reply('config:save-delay-response', {
        success: false,
        error: error.message
      });
    }
  });

  ipcMain.on('config:get', (event) => {
    try {
      const user = userRepository.getFirst();
      
      if (user) {
        const config = configRepository.findByUserId(user.id);
        event.reply('config:get-response', { success: true, config });
      } else {
        event.reply('config:get-response', { success: false });
      }
    } catch (error) {
      event.reply('config:get-response', { success: false, error: error.message });
    }
  });

  console.log('Message handlers registered');
}

module.exports = { setupMessageHandlers };
