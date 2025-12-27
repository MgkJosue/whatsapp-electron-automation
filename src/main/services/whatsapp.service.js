const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const userRepository = require('../persistence/repositories/userRepository');
const sessionRepository = require('../persistence/repositories/sessionRepository');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isAuthenticating = false;
    this.qrCallback = null;
    this.readyCallback = null;
    this.authFailureCallback = null;
    this.disconnectedCallback = null;
  }

  async initialize(sessionPath) {
    if (this.client) {
      console.log('WhatsApp client already initialized');
      return;
    }

    try {
      const authPath = path.resolve(sessionPath || './.wwebjs_auth');
      
      console.log('Auth path:', authPath);
      
      if (!fs.existsSync(authPath)) {
        console.log('Creating auth directory...');
        fs.mkdirSync(authPath, { recursive: true });
      }

      console.log('Creating WhatsApp client...');
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'whatsapp-automation',
          dataPath: authPath
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      console.log('Setting up event handlers...');
      this.setupEventHandlers();
      
      console.log('WhatsApp client initialized, starting authentication...');
      console.log('Waiting for QR code... (this may take 30-60 seconds)');
      
      // Add timeout warning
      setTimeout(() => {
        if (!this.isReady && !this.isAuthenticating) {
          console.log('⚠️ QR code not received yet. This could mean:');
          console.log('   1. Chromium is still downloading (first time only)');
          console.log('   2. Firewall/Antivirus is blocking the connection');
          console.log('   3. Network issues preventing WhatsApp Web connection');
          console.log('   Please wait or check your firewall settings...');
        }
      }, 30000);
      
      await this.client.initialize();

    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  setupEventHandlers() {
    console.log('📱 Registering WhatsApp event handlers...');
    
    this.client.on('qr', (qr) => {
      console.log('✅ QR Code received! Generating QR in terminal...');
      this.isAuthenticating = true;
      
      try {
        qrcode.generate(qr, { small: true });
        console.log('👆 Scan the QR code above with your WhatsApp mobile app');
      } catch (error) {
        console.error('Error generating QR code in terminal:', error);
      }
      
      if (this.qrCallback) {
        this.qrCallback(qr);
      }
    });
    
    this.client.on('loading_screen', (percent, message) => {
      console.log('Loading WhatsApp Web:', percent + '%', message);
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
      this.isAuthenticating = false;

      try {
        const clientInfo = this.client.info;
        console.log('Connected as:', clientInfo.pushname, clientInfo.wid.user);

        const user = userRepository.getOrCreate();
        userRepository.updatePhoneNumber(user.id, clientInfo.wid.user);
        userRepository.updateLastLogin(user.id);

        sessionRepository.setAuthenticated(user.id, true);
        sessionRepository.updateActivity(user.id);

        if (this.readyCallback) {
          this.readyCallback(clientInfo);
        }
      } catch (error) {
        console.error('Error updating user session:', error);
      }
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp authenticated successfully');
      this.isAuthenticating = false;
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failure:', msg);
      this.isAuthenticating = false;
      
      if (this.authFailureCallback) {
        this.authFailureCallback(msg);
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
      
      try {
        const user = userRepository.getFirst();
        if (user) {
          sessionRepository.setAuthenticated(user.id, false);
        }
      } catch (error) {
        console.error('Error updating session on disconnect:', error);
      }

      if (this.disconnectedCallback) {
        this.disconnectedCallback(reason);
      }
    });

    this.client.on('message', (message) => {
      console.log('Message received:', message.from, message.body);
    });
  }

  onQR(callback) {
    this.qrCallback = callback;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }

  onAuthFailure(callback) {
    this.authFailureCallback = callback;
  }

  onDisconnected(callback) {
    this.disconnectedCallback = callback;
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;
      
      await this.client.sendMessage(chatId, message);
      
      console.log(`Message sent to ${phoneNumber}: ${message}`);
      return { success: true, phoneNumber, message };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMessageWithMedia(phoneNumber, message, mediaPath) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    const chatId = `${formattedNumber}@c.us`;
    
    const fs = require('fs');
    const path = require('path');
    const mime = require('mime-types');
    const { MessageMedia } = require('whatsapp-web.js');
    
    if (!fs.existsSync(mediaPath)) {
      throw new Error(`File not found: ${mediaPath}`);
    }

    console.log(`Attempting to send media file: ${mediaPath}`);
    console.log(`File size: ${fs.statSync(mediaPath).size} bytes`);
    
    const fileData = fs.readFileSync(mediaPath);
    const base64Data = fileData.toString('base64');
    const mimeType = mime.lookup(mediaPath) || 'application/octet-stream';
    const fileName = path.basename(mediaPath);
    
    console.log(`MIME type detected: ${mimeType}`);
    
    const media = new MessageMedia(mimeType, base64Data, fileName);
    
    const isVideo = mimeType.startsWith('video/');
    const isImage = mimeType.startsWith('image/');
    const isAudio = mimeType.startsWith('audio/');
    const isVeryLargeFile = fileData.length > 64 * 1024 * 1024;
    
    console.log(`File type checks: isVideo=${isVideo}, isImage=${isImage}, isAudio=${isAudio}, isVeryLargeFile=${isVeryLargeFile}`);
    
    try {
      if (isVeryLargeFile) {
        console.log('⚠️ Sending as document (file too large for media)...');
        await this.client.sendMessage(chatId, media, { 
          caption: message || '',
          sendMediaAsDocument: true
        });
      } else if (isVideo) {
        console.log('🎥 Sending video as document (whatsapp-web.js limitation)...');
        await this.client.sendMessage(chatId, media, { 
          caption: message || '',
          sendMediaAsDocument: true
        });
      } else if (isImage) {
        console.log('🖼️ Sending image as media...');
        await this.client.sendMessage(chatId, media, { 
          caption: message || '',
          sendMediaAsDocument: false
        });
      } else if (isAudio) {
        console.log('🎵 Sending audio as media...');
        await this.client.sendMessage(chatId, media, { 
          caption: message || '',
          sendMediaAsDocument: false,
          sendAudioAsVoice: false
        });
      } else {
        console.log('📄 Sending as document...');
        await this.client.sendMessage(chatId, media, { 
          caption: message || '',
          sendMediaAsDocument: true
        });
      }
      
      console.log(`Message with media sent successfully to ${phoneNumber}`);
      return { success: true, phoneNumber, message, mediaPath };
    } catch (error) {
      console.error('Error sending message with media:', error);
      console.error('Error details:', error.message);
      
      console.log('Retrying as document...');
      try {
        await this.client.sendMessage(chatId, media, { 
          caption: message || '',
          sendMediaAsDocument: true
        });
        
        console.log(`Message with media sent as document to ${phoneNumber}`);
        return { success: true, phoneNumber, message, mediaPath };
      } catch (retryError) {
        console.error('Retry also failed:', retryError.message);
        throw new Error(`Failed to send media file: ${error.message}. This is a known limitation of WhatsApp Web API for certain file types/sizes.`);
      }
    }
  }

  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.replace(/\D/g, '');
    
    if (!formatted.startsWith('1') && formatted.length === 10) {
      formatted = '1' + formatted;
    }
    
    return formatted;
  }

  async getState() {
    if (!this.client) {
      return 'NOT_INITIALIZED';
    }
    
    try {
      const state = await this.client.getState();
      return state;
    } catch (error) {
      return 'UNKNOWN';
    }
  }

  async logout() {
    if (this.client) {
      try {
        await this.client.logout();
        console.log('WhatsApp client logged out');
        
        const user = userRepository.getFirst();
        if (user) {
          sessionRepository.setAuthenticated(user.id, false);
        }

        await this.destroy();
      } catch (error) {
        console.error('Error logging out:', error);
        throw error;
      }
    }
  }

  async destroy() {
    if (this.client) {
      try {
        await this.client.destroy();
        this.client = null;
        this.isReady = false;
        this.isAuthenticating = false;
        console.log('WhatsApp client destroyed');
      } catch (error) {
        console.error('Error destroying client:', error);
        throw error;
      }
    }
  }

  getClientInfo() {
    if (this.isReady && this.client) {
      return this.client.info;
    }
    return null;
  }

  isClientReady() {
    return this.isReady;
  }

  isClientAuthenticating() {
    return this.isAuthenticating;
  }
}

module.exports = new WhatsAppService();
