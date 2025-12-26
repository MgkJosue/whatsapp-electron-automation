const { ipcRenderer } = require('electron');

console.log('WhatsApp Desktop Automation - UI Loaded');

const UI = {
  elements: {},
  currentContactsPage: 1,
  contactsPerPage: 50,
  currentSearchTerm: '',
  
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupTabs();
    this.initializeWhatsApp();
  },

  cacheElements() {
    this.elements = {
      statusText: document.getElementById('status-text'),
      authSection: document.getElementById('auth-section'),
      messageSection: document.getElementById('message-section'),
      qrContainer: document.getElementById('qr-container'),
      qrCode: document.getElementById('qr-code'),
      loadingContainer: document.getElementById('loading-container'),
      readyContainer: document.getElementById('ready-container'),
      errorContainer: document.getElementById('error-container'),
      userInfo: document.getElementById('user-info'),
      errorMessage: document.getElementById('error-message'),
      btnLogout: document.getElementById('btn-logout'),
      btnRetry: document.getElementById('btn-retry'),
      messageForm: document.getElementById('message-form'),
      phoneNumber: document.getElementById('phone-number'),
      messageText: document.getElementById('message-text'),
      mediaFile: document.getElementById('media-file'),
      messageStatus: document.getElementById('message-status'),
      delaySeconds: document.getElementById('delay-seconds'),
      btnSaveConfig: document.getElementById('btn-save-config'),
      queueStatus: document.getElementById('queue-status'),
      queueState: document.getElementById('queue-state'),
      queueSize: document.getElementById('queue-size'),
      btnPauseQueue: document.getElementById('btn-pause-queue'),
      btnResumeQueue: document.getElementById('btn-resume-queue'),
      btnStopQueue: document.getElementById('btn-stop-queue'),
      testMode: document.getElementById('test-mode'),
      testOptions: document.getElementById('test-options'),
      testCount: document.getElementById('test-count'),
      btnAddContact: document.getElementById('btn-add-contact'),
      btnImportContacts: document.getElementById('btn-import-contacts'),
      btnImportGoogleContacts: document.getElementById('btn-import-google-contacts'),
      btnExportContacts: document.getElementById('btn-export-contacts'),
      contactSearch: document.getElementById('contact-search'),
      contactsList: document.getElementById('contacts-list'),
      contactModal: document.getElementById('contact-modal'),
      contactForm: document.getElementById('contact-form'),
      modalTitle: document.getElementById('modal-title'),
      contactName: document.getElementById('contact-name'),
      contactPhone: document.getElementById('contact-phone'),
      closeModal: document.getElementById('close-modal'),
      cancelContact: document.getElementById('cancel-contact'),
      btnDeleteSelected: document.getElementById('btn-delete-selected'),
      btnDeleteAll: document.getElementById('btn-delete-all'),
      btnSendAllContacts: document.getElementById('btn-send-all-contacts'),
      btnSendSelectedContacts: document.getElementById('btn-send-selected-contacts'),
      selectAllContacts: document.getElementById('select-all-contacts'),
      csvHelpModal: document.getElementById('csv-help-modal'),
      closeCsvHelp: document.getElementById('close-csv-help'),
      closeCsvHelpBtn: document.getElementById('close-csv-help-btn'),
      btnDownloadExample: document.getElementById('btn-download-example'),
      btnProceedImport: document.getElementById('btn-proceed-import'),
      displayDelay: document.getElementById('display-delay'),
      currentContactInfo: document.getElementById('current-contact-info'),
      currentContactName: document.getElementById('current-contact-name'),
      messagingStatus: document.getElementById('messaging-status'),
      contactsStatus: document.getElementById('contacts-status'),
      contactsPagination: document.getElementById('contacts-pagination'),
      contactsBtnFirstPage: document.getElementById('contacts-btn-first-page'),
      contactsBtnPrevPage: document.getElementById('contacts-btn-prev-page'),
      contactsBtnNextPage: document.getElementById('contacts-btn-next-page'),
      contactsBtnLastPage: document.getElementById('contacts-btn-last-page'),
      contactsCurrentPage: document.getElementById('contacts-current-page'),
      contactsTotalPages: document.getElementById('contacts-total-pages'),
      contactsShowingFrom: document.getElementById('contacts-showing-from'),
      contactsShowingTo: document.getElementById('contacts-showing-to'),
      contactsTotal: document.getElementById('contacts-total'),
      queueProgressContainer: document.getElementById('queue-progress-container'),
      queueProgressBar: document.getElementById('queue-progress-bar'),
      queueProcessed: document.getElementById('queue-processed'),
      queueTotal: document.getElementById('queue-total'),
      queuePercentage: document.getElementById('queue-percentage'),
      queueSuccess: document.getElementById('queue-success'),
      queueFailed: document.getElementById('queue-failed'),
      settingsStatus: document.getElementById('settings-status'),
      templatesStatus: document.getElementById('templates-status'),
      btnAddTemplate: document.getElementById('btn-add-template'),
      templateSearch: document.getElementById('template-search'),
      templatesList: document.getElementById('templates-list'),
      templateModal: document.getElementById('template-modal'),
      templateForm: document.getElementById('template-form'),
      templateModalTitle: document.getElementById('template-modal-title'),
      templateName: document.getElementById('template-name'),
      templateCategory: document.getElementById('template-category'),
      templateContent: document.getElementById('template-content'),
      templateMedia: document.getElementById('template-media'),
      closeTemplateModal: document.getElementById('close-template-modal'),
      cancelTemplate: document.getElementById('cancel-template'),
      templateSelector: document.getElementById('template-selector'),
      reportsStatus: document.getElementById('reports-status'),
      statTotal: document.getElementById('stat-total'),
      statSent: document.getElementById('stat-sent'),
      statFailed: document.getElementById('stat-failed'),
      statRate: document.getElementById('stat-rate'),
      filterStatus: document.getElementById('filter-status'),
      filterSearch: document.getElementById('filter-search'),
      filterStartDate: document.getElementById('filter-start-date'),
      filterEndDate: document.getElementById('filter-end-date'),
      btnApplyFilters: document.getElementById('btn-apply-filters'),
      btnClearFilters: document.getElementById('btn-clear-filters'),
      btnExportCsv: document.getElementById('btn-export-csv'),
      btnExportJson: document.getElementById('btn-export-json'),
      btnRefreshReports: document.getElementById('btn-refresh-reports'),
      messagesTableBody: document.getElementById('messages-table-body'),
      paginationControls: document.getElementById('pagination-controls'),
      paginationInfoText: document.getElementById('pagination-info-text'),
      paginationPages: document.getElementById('pagination-pages'),
      btnFirstPage: document.getElementById('btn-first-page'),
      btnPrevPage: document.getElementById('btn-prev-page'),
      btnNextPage: document.getElementById('btn-next-page'),
      btnLastPage: document.getElementById('btn-last-page'),
      dbSize: document.getElementById('db-size'),
      dataContactsCount: document.getElementById('data-contacts-count'),
      dataMessagesCount: document.getElementById('data-messages-count'),
      dataTemplatesCount: document.getElementById('data-templates-count'),
      btnOptimizeDb: document.getElementById('btn-optimize-db'),
      btnDeleteAllData: document.getElementById('btn-delete-all-data')
    };
  },

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  },

  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-gradient-to-r', 'from-indigo-600', 'to-purple-600', 'text-white', 'shadow-lg', 'scale-105');
      btn.classList.add('text-gray-700', 'dark:text-gray-300');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
      content.style.display = 'none';
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`tab-${tabName}`);
    
    if (activeBtn) {
      activeBtn.classList.remove('text-gray-700', 'dark:text-gray-300');
      activeBtn.classList.add('active', 'bg-gradient-to-r', 'from-indigo-600', 'to-purple-600', 'text-white', 'shadow-lg', 'scale-105');
    }
    if (activeContent) {
      activeContent.classList.add('active');
      activeContent.style.display = 'block';
    }
  },

  setupEventListeners() {
    this.elements.btnLogout?.addEventListener('click', () => this.logout());
    this.elements.btnRetry?.addEventListener('click', () => this.initializeWhatsApp());
    this.elements.messageForm?.addEventListener('submit', (e) => this.sendMessage(e));
    this.elements.btnSaveConfig?.addEventListener('click', () => this.saveConfiguration());
    this.elements.btnPauseQueue?.addEventListener('click', () => this.pauseQueue());
    this.elements.btnResumeQueue?.addEventListener('click', () => this.resumeQueue());
    this.elements.btnStopQueue?.addEventListener('click', () => this.stopQueue());
    this.elements.testMode?.addEventListener('change', (e) => this.toggleTestMode(e));
    
    this.elements.btnAddContact?.addEventListener('click', () => this.openContactModal());
    this.elements.btnImportContacts?.addEventListener('click', () => this.showCsvHelpModal());
    this.elements.btnImportGoogleContacts?.addEventListener('click', () => this.importGoogleContacts());
    this.elements.btnExportContacts?.addEventListener('click', () => this.exportContacts());
    this.elements.btnDeleteSelected?.addEventListener('click', () => this.deleteSelectedContacts());
    this.elements.btnDeleteAll?.addEventListener('click', () => this.deleteAllContacts());
    this.elements.btnSendAllContacts?.addEventListener('click', () => this.sendToAllContacts());
    this.elements.btnSendSelectedContacts?.addEventListener('click', () => this.sendToSelectedContacts());
    this.elements.selectAllContacts?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
    this.elements.closeModal?.addEventListener('click', () => this.closeContactModal());
    this.elements.cancelContact?.addEventListener('click', () => this.closeContactModal());
    this.elements.contactForm?.addEventListener('submit', (e) => this.saveContact(e));
    this.elements.contactSearch?.addEventListener('input', (e) => this.searchContacts(e.target.value));
    this.elements.closeCsvHelp?.addEventListener('click', () => this.closeCsvHelpModal());
    this.elements.closeCsvHelpBtn?.addEventListener('click', () => this.closeCsvHelpModal());
    this.elements.btnDownloadExample?.addEventListener('click', () => this.downloadExampleCsv());
    this.elements.btnProceedImport?.addEventListener('click', () => this.importContacts());
    
    // Pagination event listeners
    this.elements.contactsBtnFirstPage?.addEventListener('click', () => this.goToPage(1));
    this.elements.contactsBtnPrevPage?.addEventListener('click', () => this.goToPage(this.currentContactsPage - 1));
    this.elements.contactsBtnNextPage?.addEventListener('click', () => this.goToPage(this.currentContactsPage + 1));
    this.elements.contactsBtnLastPage?.addEventListener('click', () => this.goToLastPage());
    
    this.elements.btnAddTemplate?.addEventListener('click', () => this.openTemplateModal());
    this.elements.closeTemplateModal?.addEventListener('click', () => this.closeTemplateModal());
    this.elements.cancelTemplate?.addEventListener('click', () => this.closeTemplateModal());
    this.elements.templateForm?.addEventListener('submit', (e) => this.saveTemplate(e));
    this.elements.templateSearch?.addEventListener('input', (e) => this.searchTemplates(e.target.value));
    this.elements.templateSelector?.addEventListener('change', (e) => this.useTemplate(e.target.value));
    
    this.elements.btnApplyFilters?.addEventListener('click', () => this.applyReportFilters());
    this.elements.btnClearFilters?.addEventListener('click', () => this.clearReportFilters());
    this.elements.btnExportCsv?.addEventListener('click', () => this.exportReportCsv());
    this.elements.btnExportJson?.addEventListener('click', () => this.exportReportJson());
    this.elements.btnRefreshReports?.addEventListener('click', () => this.loadReports());
    this.elements.btnFirstPage?.addEventListener('click', () => this.goToPage(1));
    this.elements.btnPrevPage?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
    this.elements.btnNextPage?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
    this.elements.btnLastPage?.addEventListener('click', () => this.goToPage(this.totalPages));
    this.elements.btnOptimizeDb?.addEventListener('click', () => this.optimizeDatabase());
    this.elements.btnDeleteAllData?.addEventListener('click', () => this.deleteAllData());

    ipcRenderer.on('whatsapp:qr', (event, qr) => this.displayQR(qr));
    ipcRenderer.on('whatsapp:ready', (event, clientInfo) => this.onReady(clientInfo));
    ipcRenderer.on('whatsapp:auth-failure', (event, error) => this.onAuthFailure(error));
    ipcRenderer.on('whatsapp:disconnected', (event, reason) => this.onDisconnected(reason));
    ipcRenderer.on('whatsapp:message-sent', (event, data) => this.onMessageSent(data));
    ipcRenderer.on('whatsapp:logged-out', () => this.onLoggedOut());
    ipcRenderer.on('message-queue:status', (event, status) => this.updateQueueStatus(status));
  },

  initializeWhatsApp() {
    this.updateStatus('Connecting to WhatsApp...');
    this.showLoading();
    
    ipcRenderer.send('whatsapp:initialize');
    
    ipcRenderer.once('whatsapp:initialize-response', (event, response) => {
      if (!response.success) {
        this.onAuthFailure(response.error);
      }
    });
  },

  displayQR(qr) {
    this.updateStatus('Scan QR Code to authenticate');
    this.hideLoading();
    
    this.elements.qrCode.innerHTML = '';
    
    const qrImage = document.createElement('img');
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    qrImage.alt = 'WhatsApp QR Code';
    
    this.elements.qrCode.appendChild(qrImage);
    this.elements.qrContainer.style.display = 'block';
  },

  async onReady(clientInfo) {
    this.updateStatus('Connected to WhatsApp');
    this.hideLoading();
    this.elements.qrContainer.style.display = 'none';
    
    this.elements.userInfo.textContent = `Connected as: ${clientInfo.pushname || clientInfo.number}`;
    this.elements.readyContainer.style.display = 'block';
    
    this.loadConfiguration();
    this.loadContacts();
    this.loadTemplates();
    this.loadReports();
    this.loadDataStatistics();
    
    setTimeout(() => {
      this.elements.authSection.style.display = 'none';
      this.elements.messageSection.style.display = 'block';
    }, 2000);
  },

  onAuthFailure(error) {
    this.updateStatus('Authentication failed');
    this.hideLoading();
    this.elements.qrContainer.style.display = 'none';
    
    this.elements.errorMessage.textContent = error || 'Failed to authenticate with WhatsApp';
    this.elements.errorContainer.style.display = 'block';
  },

  onDisconnected(reason) {
    this.updateStatus('Disconnected from WhatsApp');
    this.elements.messageSection.style.display = 'none';
    this.elements.authSection.style.display = 'block';
    this.elements.readyContainer.style.display = 'none';
    
    alert(`Disconnected: ${reason}\nPlease reconnect.`);
    this.initializeWhatsApp();
  },

  async sendMessage(event) {
    event.preventDefault();
    
    const phoneNumber = this.elements.phoneNumber.value.trim();
    const message = this.elements.messageText.value.trim();
    const mediaFile = this.elements.mediaFile.files[0];
    const isTestMode = this.elements.testMode.checked;
    
    if (!phoneNumber || !message) {
      this.showMessageStatus('Please fill in all required fields', 'error');
      return;
    }

    if (isTestMode) {
      const count = parseInt(this.elements.testCount.value);
      this.sendMultipleMessages(phoneNumber, message, count, mediaFile);
    } else {
      this.sendSingleMessage(phoneNumber, message, mediaFile);
    }
  },

  sendSingleMessage(phoneNumber, message, mediaFile) {
    this.showMessageStatus('Validating and sending message...', 'info');
    
    const data = {
      phoneNumber,
      message,
      contactId: null
    };
    
    if (mediaFile) {
      data.mediaPath = mediaFile.path;
      ipcRenderer.send('whatsapp:send-message-with-media', data);
    } else {
      ipcRenderer.send('whatsapp:send-message', data);
    }
    
    ipcRenderer.once('whatsapp:send-message-response', (event, response) => {
      if (response.success) {
        const formattedPhone = response.formattedPhone || phoneNumber;
        this.showMessageStatus(`Message sent successfully to ${formattedPhone}!`, 'success');
        this.elements.messageForm.reset();
      } else {
        if (response.validationError) {
          this.showMessageStatus(`Validation Error: ${response.error}`, 'error');
        } else {
          this.showMessageStatus(`Error: ${response.error}`, 'error');
        }
      }
    });
  },

  sendMultipleMessages(phoneNumber, baseMessage, count, mediaFile) {
    this.showMessageStatus(`Queuing ${count} test messages...`, 'info');
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i <= count; i++) {
      const message = `${baseMessage} [Test ${i}/${count}]`;
      
      const data = {
        phoneNumber,
        message,
        contactId: null
      };
      
      if (mediaFile) {
        data.mediaPath = mediaFile.path;
        ipcRenderer.send('whatsapp:send-message-with-media', data);
      } else {
        ipcRenderer.send('whatsapp:send-message', data);
      }

      ipcRenderer.once('whatsapp:send-message-response', (event, response) => {
        if (response.success) {
          successCount++;
        } else {
          errorCount++;
        }

        if (successCount + errorCount === count) {
          this.showMessageStatus(
            `Test complete: ${successCount} queued, ${errorCount} errors`,
            errorCount > 0 ? 'error' : 'success'
          );
          this.elements.messageForm.reset();
          this.elements.testMode.checked = false;
          this.toggleTestMode({ target: { checked: false } });
        }
      });

      if (i < count) {
        setTimeout(() => {}, 100);
      }
    }
  },

  toggleTestMode(event) {
    const isChecked = event.target.checked;
    this.elements.testOptions.style.display = isChecked ? 'block' : 'none';
  },

  onMessageSent(data) {
    console.log('Message sent:', data);
  },

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.updateStatus('Logging out...');
      this.showLoading();
      ipcRenderer.send('whatsapp:logout');
      
      ipcRenderer.once('whatsapp:logout-response', (event, response) => {
        if (!response.success) {
          this.showMessageStatus(`Logout failed: ${response.error}`, 'error');
          this.hideLoading();
        }
      });
    }
  },

  onLoggedOut() {
    this.elements.messageSection.style.display = 'none';
    this.elements.authSection.style.display = 'block';
    this.elements.readyContainer.style.display = 'none';
    this.elements.errorContainer.style.display = 'none';
    this.elements.qrContainer.style.display = 'none';
    
    this.updateStatus('Logged out successfully. Reconnecting...');
    
    setTimeout(() => {
      this.initializeWhatsApp();
    }, 1000);
  },

  showLoading() {
    this.elements.loadingContainer.style.display = 'block';
    this.elements.qrContainer.style.display = 'none';
    this.elements.readyContainer.style.display = 'none';
    this.elements.errorContainer.style.display = 'none';
  },

  hideLoading() {
    this.elements.loadingContainer.style.display = 'none';
  },

  updateStatus(text) {
    this.elements.statusText.textContent = text;
  },

  showNotification(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `status-notification ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  },

  showMessagingStatus(message, type) {
    this.showNotification(this.elements.messagingStatus, message, type);
  },

  showContactsStatus(message, type) {
    this.showNotification(this.elements.contactsStatus, message, type);
  },

  showSettingsStatus(message, type) {
    this.showNotification(this.elements.settingsStatus, message, type);
  },

  loadConfiguration() {
    ipcRenderer.send('config:get');
    
    ipcRenderer.once('config:get-response', (event, response) => {
      if (response.success && response.config) {
        const delay = response.config.delay_between_messages || 5;
        this.elements.delaySeconds.value = delay;
        if (this.elements.displayDelay) {
          this.elements.displayDelay.textContent = delay;
        }
      }
    });
  },

  saveConfiguration() {
    const delay = parseInt(this.elements.delaySeconds.value);
    
    if (delay < 1 || delay > 60) {
      this.showSettingsStatus('Delay must be between 1 and 60 seconds', 'error');
      return;
    }

    ipcRenderer.send('config:save-delay', { delay });
    
    ipcRenderer.once('config:save-delay-response', (event, response) => {
      if (response.success) {
        this.showSettingsStatus('Configuration saved successfully!', 'success');
        if (this.elements.displayDelay) {
          this.elements.displayDelay.textContent = delay;
        }
      } else {
        this.showSettingsStatus(`Error saving configuration: ${response.error}`, 'error');
      }
    });
  },

  pauseQueue() {
    ipcRenderer.send('message-queue:pause');
    
    ipcRenderer.once('message-queue:pause-response', (event, response) => {
      if (response.success) {
        console.log('Queue paused');
      }
    });
  },

  resumeQueue() {
    ipcRenderer.send('message-queue:resume');
    
    ipcRenderer.once('message-queue:resume-response', (event, response) => {
      if (response.success) {
        console.log('Queue resumed');
      }
    });
  },

  stopQueue() {
    if (confirm('Are you sure you want to stop and clear the message queue?')) {
      ipcRenderer.send('message-queue:stop');
      
      ipcRenderer.once('message-queue:stop-response', (event, response) => {
        if (response.success) {
          this.showMessageStatus('Queue stopped and cleared', 'success');
        }
      });
    }
  },

  updateQueueStatus(status) {
    const { type, queueSize, isProcessing, isPaused, contactName, phoneNumber, stats } = status;

    console.log('Queue status update:', status);

    if (type === 'queued' || type === 'sending' || type === 'processing' || type === 'bulk_queued') {
      this.elements.queueStatus.style.display = 'block';
    }

    // Update queue size
    if (queueSize !== undefined) {
      this.elements.queueSize.textContent = queueSize;
    }

    // Update progress bar and stats
    if (stats) {
      this.elements.queueProgressContainer.style.display = 'block';
      
      const processed = stats.processed || 0;
      const total = stats.total || 0;
      const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
      
      this.elements.queueProcessed.textContent = processed;
      this.elements.queueTotal.textContent = total;
      this.elements.queuePercentage.textContent = percentage + '%';
      this.elements.queueSuccess.textContent = stats.successCount || 0;
      this.elements.queueFailed.textContent = stats.failedCount || 0;
      this.elements.queueProgressBar.style.width = percentage + '%';
    }

    // Show current contact being processed
    if (type === 'sending' && contactName) {
      if (this.elements.currentContactInfo && this.elements.currentContactName) {
        this.elements.currentContactInfo.style.display = 'block';
        this.elements.currentContactName.textContent = `${contactName} (${phoneNumber})`;
      }
    }

    // Handle queue completion
    if (type === 'completed') {
      if (this.elements.currentContactInfo) {
        this.elements.currentContactInfo.style.display = 'none';
      }
      
      this.showMessageStatus(
        `✅ Queue completed! Success: ${stats?.successCount || 0}, Failed: ${stats?.failedCount || 0}`,
        'success'
      );
      
      // Hide queue UI after 5 seconds
      setTimeout(() => {
        this.elements.queueStatus.style.display = 'none';
        this.elements.queueProgressContainer.style.display = 'none';
        this.elements.queueSize.textContent = '0';
      }, 5000);
    }

    // Handle restored queue
    if (type === 'restored_paused') {
      this.elements.queueStatus.style.display = 'block';
      this.elements.queueProgressContainer.style.display = 'block';
      
      // Set paused state UI
      this.elements.queueState.textContent = '⏸️ Paused';
      this.elements.queueState.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      this.elements.btnPauseQueue.style.display = 'none';
      this.elements.btnResumeQueue.style.display = 'inline-block';
      this.elements.btnResumeQueue.disabled = false;
      this.elements.btnStopQueue.style.display = 'inline-block';
      this.elements.btnStopQueue.disabled = false;
      
      this.showMessageStatus(
        `⏸️ Queue restored with ${queueSize} pending messages. Click Resume to continue.`,
        'info'
      );
    }

    if (type === 'restored') {
      this.elements.queueStatus.style.display = 'block';
      this.elements.queueProgressContainer.style.display = 'block';
      
      this.showMessageStatus(
        `🔄 Queue restored with ${queueSize} pending messages. Processing will continue automatically.`,
        'info'
      );
    }

    // Update button states
    if (isProcessing !== undefined || isPaused !== undefined) {
      if (isPaused) {
        this.elements.queueState.textContent = '⏸️ Paused';
        this.elements.queueState.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
        this.elements.btnPauseQueue.style.display = 'none';
        this.elements.btnResumeQueue.style.display = 'inline-block';
        this.elements.btnResumeQueue.disabled = false;
        this.elements.btnStopQueue.style.display = 'inline-block';
        this.elements.btnStopQueue.disabled = false;
      } else if (isProcessing) {
        this.elements.queueState.textContent = '▶️ Processing';
        this.elements.queueState.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        this.elements.btnPauseQueue.style.display = 'inline-block';
        this.elements.btnPauseQueue.disabled = false;
        this.elements.btnResumeQueue.style.display = 'none';
        this.elements.btnStopQueue.style.display = 'inline-block';
        this.elements.btnStopQueue.disabled = false;
      } else {
        this.elements.queueState.textContent = '⏹️ Idle';
        this.elements.queueState.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
        this.elements.btnPauseQueue.style.display = 'none';
        this.elements.btnResumeQueue.style.display = 'none';
        this.elements.btnStopQueue.style.display = 'none';
      }
    }

    // Handle stopped queue
    if (type === 'stopped') {
      this.elements.queueStatus.style.display = 'none';
      this.elements.queueProgressContainer.style.display = 'none';
      this.elements.queueSize.textContent = '0';
      this.elements.queueState.textContent = '⏹️ Idle';
      this.elements.queueState.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
  },

  // Contact Management Methods
  currentEditingContactId: null,

  async loadContacts() {
    try {
      const response = await ipcRenderer.invoke('contacts:get-paginated', {
        page: this.currentContactsPage,
        limit: this.contactsPerPage
      });
      
      if (response.success) {
        this.renderContacts(response.contacts);
        this.updatePaginationControls(response.pagination);
      } else {
        this.showContactsStatus('Error loading contacts: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.showContactsStatus('Error loading contacts', 'error');
    }
  },

  updatePaginationControls(pagination) {
    if (!pagination || pagination.total === 0) {
      this.elements.contactsPagination.style.display = 'none';
      return;
    }

    this.elements.contactsPagination.style.display = 'flex';
    
    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);
    
    this.elements.contactsShowingFrom.textContent = from;
    this.elements.contactsShowingTo.textContent = to;
    this.elements.contactsTotal.textContent = pagination.total;
    this.elements.contactsCurrentPage.textContent = pagination.page;
    this.elements.contactsTotalPages.textContent = pagination.totalPages;
    
    this.elements.contactsBtnFirstPage.disabled = !pagination.hasPrev;
    this.elements.contactsBtnPrevPage.disabled = !pagination.hasPrev;
    this.elements.contactsBtnNextPage.disabled = !pagination.hasNext;
    this.elements.contactsBtnLastPage.disabled = !pagination.hasNext;
    
    this.lastTotalPages = pagination.totalPages;
  },

  async goToPage(page) {
    if (page < 1) return;
    this.currentContactsPage = page;
    
    if (this.currentSearchTerm) {
      await this.searchContactsPaginated(this.currentSearchTerm);
    } else {
      await this.loadContacts();
    }
  },

  async goToLastPage() {
    if (this.lastTotalPages) {
      await this.goToPage(this.lastTotalPages);
    }
  },

  renderContacts(contacts) {
    if (!contacts || contacts.length === 0) {
      this.elements.contactsList.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-12">No contacts yet. Add your first contact!</p>';
      this.elements.btnDeleteSelected.style.display = 'none';
      return;
    }

    this.elements.contactsList.innerHTML = contacts.map(contact => `
      <div class="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border flex items-center gap-4 hover:shadow-md transition-shadow" data-id="${contact.id}">
        <input type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" data-contact-id="${contact.id}" onchange="UI.updateSelectedCount()">
        <div class="flex-1">
          <div class="font-semibold text-gray-900 dark:text-gray-100">${this.escapeHtml(contact.name)}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${this.escapeHtml(contact.phone_number)}</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all" onclick="UI.sendToContact('${contact.id}', '${this.escapeHtml(contact.phone_number)}')">
            <span class="mr-1">📤</span> Send
          </button>
          <button class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all" onclick="UI.editContact('${contact.id}')">
            <span class="mr-1">✏️</span> Edit
          </button>
          <button class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all" onclick="UI.deleteContact('${contact.id}', '${this.escapeHtml(contact.name)}')">
            <span class="mr-1">🗑️</span> Delete
          </button>
        </div>
      </div>
    `).join('');
    
    this.updateSelectedCount();
  },

  openContactModal(contactId = null) {
    this.currentEditingContactId = contactId;
    
    if (contactId) {
      this.elements.modalTitle.textContent = 'Edit Contact';
      const contactItem = document.querySelector(`[data-id="${contactId}"]`);
      if (contactItem) {
        const name = contactItem.querySelector('.contact-name').textContent;
        const phone = contactItem.querySelector('.contact-phone').textContent;
        this.elements.contactName.value = name;
        this.elements.contactPhone.value = phone;
      }
    } else {
      this.elements.modalTitle.textContent = 'Add Contact';
      this.elements.contactForm.reset();
    }
    
    this.elements.contactModal.style.display = 'flex';
  },

  closeContactModal() {
    this.elements.contactModal.style.display = 'none';
    this.elements.contactForm.reset();
    this.currentEditingContactId = null;
  },

  async saveContact(e) {
    e.preventDefault();
    
    const name = this.elements.contactName.value.trim();
    const phoneNumber = this.elements.contactPhone.value.trim();

    if (!name || !phoneNumber) {
      this.showContactsStatus('Please fill in all fields', 'error');
      return;
    }

    try {
      let response;
      if (this.currentEditingContactId) {
        response = await ipcRenderer.invoke('contacts:update', {
          id: this.currentEditingContactId,
          name,
          phoneNumber
        });
      } else {
        response = await ipcRenderer.invoke('contacts:create', {
          name,
          phoneNumber
        });
      }

      if (response.success) {
        this.showContactsStatus(
          this.currentEditingContactId ? 'Contact updated successfully' : 'Contact added successfully',
          'success'
        );
        this.closeContactModal();
        await this.loadContacts();
      } else {
        this.showContactsStatus('Error: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      this.showContactsStatus('Error saving contact', 'error');
    }
  },

  async editContact(contactId) {
    this.openContactModal(contactId);
  },

  async deleteContact(contactId, contactName) {
    if (!confirm(`Are you sure you want to delete "${contactName}"?`)) {
      return;
    }

    try {
      const response = await ipcRenderer.invoke('contacts:delete', { id: contactId });
      if (response.success) {
        this.showContactsStatus('Contact deleted successfully', 'success');
        await this.loadContacts();
      } else {
        this.showContactsStatus('Error deleting contact: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      this.showContactsStatus('Error deleting contact', 'error');
    }
  },

  sendToContact(contactId, phoneNumber) {
    this.elements.phoneNumber.value = phoneNumber;
    this.elements.messageText.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async searchContacts(searchTerm) {
    this.currentSearchTerm = searchTerm.trim();
    this.currentContactsPage = 1;
    
    if (!this.currentSearchTerm) {
      await this.loadContacts();
      return;
    }

    await this.searchContactsPaginated(this.currentSearchTerm);
  },

  async searchContactsPaginated(searchTerm) {
    try {
      const response = await ipcRenderer.invoke('contacts:search-paginated', { 
        searchTerm: searchTerm,
        page: this.currentContactsPage,
        limit: this.contactsPerPage
      });
      
      if (response.success) {
        this.renderContacts(response.contacts);
        this.updatePaginationControls(response.pagination);
      } else {
        this.showContactsStatus('Error searching contacts: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error searching contacts:', error);
      this.showContactsStatus('Error searching contacts', 'error');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  async importContacts() {
    try {
      this.showMessageStatus('Opening file dialog...', 'info');
      
      const response = await ipcRenderer.invoke('contacts:import-csv');
      
      if (response.success) {
        const message = `Import successful!\n✅ Imported: ${response.imported}\n⚠️ Duplicates skipped: ${response.duplicates}\n❌ Errors: ${response.errors}`;
        this.showMessageStatus(message, 'success');
        await this.loadContacts();
      } else {
        this.showMessageStatus('Import failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      this.showMessageStatus('Error importing contacts', 'error');
    }
  },

  async exportContacts() {
    try {
      this.showContactsStatus('Exporting contacts...', 'info');
      
      const response = await ipcRenderer.invoke('contacts:export-csv');
      
      if (response.success) {
        this.showContactsStatus(`Exported ${response.count} contacts successfully!`, 'success');
      } else {
        this.showContactsStatus('Export failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error exporting contacts:', error);
      this.showContactsStatus('Error exporting contacts', 'error');
    }
  },

  showCsvHelpModal() {
    this.elements.csvHelpModal.style.display = 'flex';
  },

  closeCsvHelpModal() {
    this.elements.csvHelpModal.style.display = 'none';
  },

  async downloadExampleCsv() {
    try {
      const response = await ipcRenderer.invoke('contacts:download-example');
      if (response.success) {
        this.showContactsStatus('Example CSV downloaded successfully!', 'success');
      } else {
        this.showContactsStatus('Download failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error downloading example:', error);
      this.showContactsStatus('Error downloading example', 'error');
    }
  },

  async importContacts() {
    try {
      this.showContactsStatus('Opening file dialog...', 'info');
      
      const response = await ipcRenderer.invoke('contacts:import-csv');
      
      if (response.success) {
        const message = `Import successful!\n✅ Imported: ${response.imported}\n⚠️ Duplicates skipped: ${response.duplicates}\n❌ Errors: ${response.errors}`;
        this.showContactsStatus(message, 'success');
        await this.loadContacts();
        this.closeCsvHelpModal();
      } else {
        this.showContactsStatus('Import failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      this.showContactsStatus('Error importing contacts', 'error');
    }
  },

  async importGoogleContacts() {
    try {
      this.showContactsStatus('Abriendo archivo de Google Contacts...', 'info');
      
      const response = await ipcRenderer.invoke('contacts:import-google-csv', { 
        countryCode: '+593' 
      });
      
      if (response.success) {
        const message = `✅ Importación de Google Contacts completada!\n\n` +
          `📥 Contactos importados: ${response.imported}\n` +
          `🔄 Duplicados eliminados: ${response.duplicates}\n` +
          `❌ Errores: ${response.errors}\n\n` +
          `${response.report.summary}`;
        
        this.showContactsStatus(message, 'success');
        await this.loadContacts();
        
        if (response.errors > 0 && response.details.parseResult.errors.length > 0) {
          console.warn('Errores durante la importación:', response.details.parseResult.errors);
        }
      } else {
        this.showContactsStatus('Error al importar: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error importing Google contacts:', error);
      this.showContactsStatus('Error al importar contactos de Google', 'error');
    }
  },

  updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
    const count = checkboxes.length;
    
    if (count > 0) {
      this.elements.btnDeleteSelected.style.display = 'inline-block';
      this.elements.btnDeleteSelected.textContent = `🗑️ Delete Selected (${count})`;
      if (this.elements.btnSendSelectedContacts) {
        this.elements.btnSendSelectedContacts.style.display = 'inline-block';
        this.elements.btnSendSelectedContacts.textContent = `📤 Send to Selected (${count})`;
      }
    } else {
      this.elements.btnDeleteSelected.style.display = 'none';
      if (this.elements.btnSendSelectedContacts) {
        this.elements.btnSendSelectedContacts.style.display = 'none';
      }
    }
  },

  toggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.contact-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = checked;
      const item = cb.closest('.contact-item');
      if (checked) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    this.updateSelectedCount();
  },

  async deleteSelectedContacts() {
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.contactId);
    
    if (ids.length === 0) {
      this.showContactsStatus('No contacts selected', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${ids.length} selected contact(s)?`)) {
      return;
    }

    try {
      const response = await ipcRenderer.invoke('contacts:delete-selected', { ids });
      if (response.success) {
        this.showContactsStatus(`Deleted ${response.count} contacts successfully`, 'success');
        this.elements.selectAllContacts.checked = false;
        await this.loadContacts();
      } else {
        this.showContactsStatus('Error deleting contacts: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting selected contacts:', error);
      this.showContactsStatus('Error deleting contacts', 'error');
    }
  },

  async deleteAllContacts() {
    if (!confirm('⚠️ WARNING: This will delete ALL contacts. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('This action cannot be undone. Delete all contacts?')) {
      return;
    }

    try {
      const response = await ipcRenderer.invoke('contacts:delete-all');
      if (response.success) {
        this.showContactsStatus(`Deleted all ${response.count} contacts`, 'success');
        this.elements.selectAllContacts.checked = false;
        await this.loadContacts();
      } else {
        this.showContactsStatus('Error deleting contacts: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting all contacts:', error);
      this.showContactsStatus('Error deleting all contacts', 'error');
    }
  },

  async sendToAllContacts() {
    try {
      // Check if there's already a queue processing or paused
      const queueStatus = await ipcRenderer.invoke('message-queue:get-status');
      if (queueStatus && (queueStatus.isProcessing || queueStatus.isPaused)) {
        const action = queueStatus.isPaused ? 'paused' : 'processing';
        this.showMessagingStatus(`⚠️ Queue is already ${action}. Use Resume/Stop buttons to control it.`, 'warning');
        return;
      }

      const response = await ipcRenderer.invoke('contacts:get-all');
      if (!response.success || !response.contacts || response.contacts.length === 0) {
        this.showMessagingStatus('No contacts available to send messages', 'error');
        return;
      }

      const messageText = this.elements.messageText.value.trim();
      const mediaPath = this.elements.mediaFile.files[0]?.path || this.currentTemplateMediaPath;

      if (!messageText && !mediaPath) {
        this.showMessagingStatus('Please enter a message or select a media file', 'error');
        return;
      }

      const contactCount = response.contacts.length;
      if (!confirm(`Send this message to ${contactCount} contact(s)?\n\nMessages will be sent with the configured delay between each contact.`)) {
        return;
      }

      this.showMessagingStatus(`Queuing messages for ${contactCount} contacts...`, 'info');

      for (const contact of response.contacts) {
        await ipcRenderer.invoke('whatsapp:send-message', {
          phoneNumber: contact.phone_number,
          message: messageText,
          mediaPath: mediaPath || null,
          contactName: contact.name
        });
      }

      this.showMessagingStatus(`✅ ${contactCount} messages queued successfully! Check queue status above.`, 'success');
      this.elements.messageText.value = '';
      this.elements.mediaFile.value = '';
      this.currentTemplateMediaPath = null;
      
      await this.loadContacts();
    } catch (error) {
      console.error('Error sending to all contacts:', error);
      this.showMessagingStatus('Error sending messages to all contacts', 'error');
    }
  },

  async sendToSelectedContacts() {
    try {
      // Check if there's already a queue processing or paused
      const queueStatus = await ipcRenderer.invoke('message-queue:get-status');
      if (queueStatus && (queueStatus.isProcessing || queueStatus.isPaused)) {
        const action = queueStatus.isPaused ? 'paused' : 'processing';
        this.showMessagingStatus(`⚠️ Queue is already ${action}. Use Resume/Stop buttons to control it.`, 'warning');
        return;
      }

      const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
      if (checkboxes.length === 0) {
        this.showMessagingStatus('No contacts selected', 'error');
        return;
      }

      const selectedContacts = Array.from(checkboxes).map(cb => ({
        id: cb.dataset.contactId,
        name: cb.closest('.contact-item').querySelector('.contact-name').textContent,
        phone: cb.closest('.contact-item').querySelector('.contact-phone').textContent
      }));

      const messageText = this.elements.messageText.value.trim();
      const mediaPath = this.elements.mediaFile.files[0]?.path || this.currentTemplateMediaPath;

      if (!messageText && !mediaPath) {
        this.showMessagingStatus('Please enter a message or select a media file', 'error');
        return;
      }

      const contactCount = selectedContacts.length;
      if (!confirm(`Send this message to ${contactCount} selected contact(s)?\n\nMessages will be sent with the configured delay between each contact.`)) {
        return;
      }

      this.showMessagingStatus(`Queuing messages for ${contactCount} selected contacts...`, 'info');

      for (const contact of selectedContacts) {
        await ipcRenderer.invoke('whatsapp:send-message', {
          phoneNumber: contact.phone,
          message: messageText,
          mediaPath: mediaPath || null,
          contactName: contact.name
        });
      }

      this.showMessagingStatus(`✅ ${contactCount} messages queued successfully! Check queue status above.`, 'success');
      this.elements.messageText.value = '';
      this.elements.mediaFile.value = '';
      this.currentTemplateMediaPath = null;
      this.elements.selectAllContacts.checked = false;
      
      checkboxes.forEach(cb => {
        cb.checked = false;
        cb.closest('.contact-item').classList.remove('selected');
      });
      this.updateSelectedCount();
      
    } catch (error) {
      console.error('Error sending to selected contacts:', error);
      this.showMessagingStatus('Error sending messages to selected contacts', 'error');
    }
  },

  // Template Management Methods
  currentEditingTemplateId: null,
  currentTemplateMediaPath: null,

  showTemplatesStatus(message, type) {
    this.showNotification(this.elements.templatesStatus, message, type);
  },

  async loadTemplates() {
    try {
      const response = await ipcRenderer.invoke('templates:get-all');
      if (response.success) {
        this.renderTemplates(response.templates);
        this.loadTemplateSelector(response.templates);
      } else {
        this.showTemplatesStatus('Error loading templates: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      this.showTemplatesStatus('Error loading templates', 'error');
    }
  },

  renderTemplates(templates) {
    if (!templates || templates.length === 0) {
      this.elements.templatesList.innerHTML = '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">No templates yet. Create your first template!</p>';
      return;
    }

    this.elements.templatesList.innerHTML = templates.map(template => `
      <div class="bg-white dark:bg-dark-card rounded-xl p-5 border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow" data-template-id="${template.id}">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${this.escapeHtml(template.name)}</h3>
          ${template.category ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">${this.escapeHtml(template.category)}</span>` : ''}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">${this.escapeHtml(template.content)}</div>
        ${template.media_path ? `<div class="text-xs text-gray-500 dark:text-gray-400 mb-3">📎 Has attached file</div>` : ''}
        <div class="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button class="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all" onclick="UI.useTemplateFromCard('${template.id}')">
            <span class="mr-1">✓</span> Use
          </button>
          <button class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all" onclick="UI.editTemplate('${template.id}')">
            <span class="mr-1">✏️</span> Edit
          </button>
          <button class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all" onclick="UI.deleteTemplate('${template.id}', '${this.escapeHtml(template.name)}')">
            <span class="mr-1">🗑️</span> Delete
          </button>
        </div>
      </div>
    `).join('');
  },

  loadTemplateSelector(templates) {
    if (!this.elements.templateSelector) return;
    
    this.elements.templateSelector.innerHTML = '<option value="">-- Select a template --</option>';
    
    if (templates && templates.length > 0) {
      templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        option.dataset.content = template.content;
        this.elements.templateSelector.appendChild(option);
      });
    }
  },

  openTemplateModal(templateId = null) {
    this.currentEditingTemplateId = templateId;
    
    if (templateId) {
      this.elements.templateModalTitle.textContent = 'Edit Template';
      this.loadTemplateForEdit(templateId);
    } else {
      this.elements.templateModalTitle.textContent = 'New Template';
      this.elements.templateForm.reset();
    }
    
    this.elements.templateModal.style.display = 'flex';
  },

  async loadTemplateForEdit(templateId) {
    try {
      const response = await ipcRenderer.invoke('templates:get-by-id', { id: templateId });
      if (response.success && response.template) {
        this.elements.templateName.value = response.template.name;
        this.elements.templateCategory.value = response.template.category || '';
        this.elements.templateContent.value = response.template.content;
      }
    } catch (error) {
      console.error('Error loading template:', error);
      this.showTemplatesStatus('Error loading template', 'error');
    }
  },

  closeTemplateModal() {
    this.elements.templateModal.style.display = 'none';
    this.elements.templateForm.reset();
    this.currentEditingTemplateId = null;
  },

  async saveTemplate(e) {
    e.preventDefault();
    
    const name = this.elements.templateName.value.trim();
    const content = this.elements.templateContent.value.trim();
    const category = this.elements.templateCategory.value.trim() || null;
    const mediaFile = this.elements.templateMedia.files[0];
    const mediaPath = mediaFile ? mediaFile.path : null;

    if (!name || !content) {
      this.showTemplatesStatus('Please fill in all required fields', 'error');
      return;
    }

    try {
      let response;
      if (this.currentEditingTemplateId) {
        response = await ipcRenderer.invoke('templates:update', {
          id: this.currentEditingTemplateId,
          name,
          content,
          category,
          mediaPath
        });
      } else {
        response = await ipcRenderer.invoke('templates:create', {
          name,
          content,
          category,
          mediaPath
        });
      }

      if (response.success) {
        this.showTemplatesStatus(
          this.currentEditingTemplateId ? 'Template updated successfully' : 'Template created successfully',
          'success'
        );
        this.closeTemplateModal();
        await this.loadTemplates();
      } else {
        this.showTemplatesStatus('Error: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      this.showTemplatesStatus('Error saving template', 'error');
    }
  },

  async editTemplate(templateId) {
    this.openTemplateModal(templateId);
  },

  async deleteTemplate(templateId, templateName) {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return;
    }

    try {
      const response = await ipcRenderer.invoke('templates:delete', { id: templateId });
      if (response.success) {
        this.showTemplatesStatus('Template deleted successfully', 'success');
        await this.loadTemplates();
      } else {
        this.showTemplatesStatus('Error deleting template: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      this.showTemplatesStatus('Error deleting template', 'error');
    }
  },

  async searchTemplates(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      await this.loadTemplates();
      return;
    }

    try {
      const response = await ipcRenderer.invoke('templates:search', { searchTerm });
      if (response.success) {
        this.renderTemplates(response.templates);
      } else {
        this.showTemplatesStatus('Error searching templates: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error searching templates:', error);
      this.showTemplatesStatus('Error searching templates', 'error');
    }
  },

  async useTemplate(templateId) {
    if (!templateId) {
      this.currentTemplateMediaPath = null;
      return;
    }

    try {
      const response = await ipcRenderer.invoke('templates:get-by-id', { id: templateId });
      if (response.success && response.template) {
        this.elements.messageText.value = response.template.content;
        
        if (response.template.media_path) {
          this.currentTemplateMediaPath = response.template.media_path;
          this.showMessagingStatus(`✅ Template loaded with media file. The file will be sent automatically.`, 'success');
        } else {
          this.currentTemplateMediaPath = null;
        }
        
        this.switchTab('messaging');
      }
    } catch (error) {
      console.error('Error using template:', error);
      this.currentTemplateMediaPath = null;
    }
  },

  async useTemplateFromCard(templateId) {
    await this.useTemplate(templateId);
  },

  replaceVariables(text, contact) {
    if (!text) return text;
    
    let result = text;
    if (contact) {
      result = result.replace(/{nombre}/gi, contact.name || '');
      result = result.replace(/{telefono}/gi, contact.phone_number || contact.phone || '');
    }
    return result;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Reports & Statistics Methods
  currentPage: 1,
  totalPages: 1,
  currentFilters: null,

  showReportsStatus(message, type) {
    this.showNotification(this.elements.reportsStatus, message, type);
  },

  async loadReports() {
    try {
      await this.loadStatistics();
      await this.loadRecentMessages();
    } catch (error) {
      console.error('Error loading reports:', error);
      this.showReportsStatus('Error loading reports', 'error');
    }
  },

  async loadStatistics() {
    try {
      const response = await ipcRenderer.invoke('reports:get-statistics');
      if (response.success) {
        const stats = response.statistics;
        this.elements.statTotal.textContent = stats.total_messages || 0;
        this.elements.statSent.textContent = stats.sent_messages || 0;
        this.elements.statFailed.textContent = stats.failed_messages || 0;
        this.elements.statRate.textContent = `${stats.success_rate || 0}%`;
      } else {
        console.error('Error loading statistics:', response.error);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  },

  async loadRecentMessages(filters = null, page = 1) {
    try {
      let response;
      
      const paginatedFilters = {
        ...(filters || {}),
        page: page,
        limit: 20
      };
      
      response = await ipcRenderer.invoke('reports:get-messages-with-filters', { filters: paginatedFilters });

      if (response.success) {
        this.renderMessagesTable(response.messages);
        if (response.pagination) {
          this.updatePagination(response.pagination);
        }
      } else {
        this.showReportsStatus('Error loading messages: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      this.showReportsStatus('Error loading messages', 'error');
    }
  },

  renderMessagesTable(messages) {
    if (!messages || messages.length === 0) {
      this.elements.messagesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No messages found</td>
        </tr>
      `;
      return;
    }

    this.elements.messagesTableBody.innerHTML = messages.map(msg => {
      const date = new Date(msg.created_at).toLocaleString();
      const contactName = msg.contact_name || 'Unknown';
      const phone = msg.phone_number || '';
      const content = msg.content ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content) : '';
      const status = msg.status || 'UNKNOWN';
      const statusClass = status.toLowerCase();

      return `
        <tr>
          <td>${this.escapeHtml(date)}</td>
          <td>${this.escapeHtml(contactName)}</td>
          <td>${this.escapeHtml(phone)}</td>
          <td class="message-preview">${this.escapeHtml(content)}</td>
          <td><span class="status-badge ${statusClass}">${status}</span></td>
        </tr>
      `;
    }).join('');
  },

  updatePagination(pagination) {
    this.currentPage = pagination.page;
    this.totalPages = pagination.totalPages;
    
    if (pagination.total === 0) {
      this.elements.paginationControls.style.display = 'none';
      return;
    }
    
    this.elements.paginationControls.style.display = 'flex';
    
    const start = ((pagination.page - 1) * pagination.limit) + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    this.elements.paginationInfoText.textContent = `Showing ${start}-${end} of ${pagination.total} messages`;
    
    this.elements.btnFirstPage.disabled = pagination.page === 1;
    this.elements.btnPrevPage.disabled = pagination.page === 1;
    this.elements.btnNextPage.disabled = pagination.page === pagination.totalPages;
    this.elements.btnLastPage.disabled = pagination.page === pagination.totalPages;
    
    this.renderPageNumbers(pagination);
  },

  renderPageNumbers(pagination) {
    const maxPages = 5;
    const pages = [];
    let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    this.elements.paginationPages.innerHTML = pages.map(page => 
      `<span class="page-number ${page === pagination.page ? 'active' : ''}" onclick="UI.goToPage(${page})">${page}</span>`
    ).join('');
  },

  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.loadRecentMessages(this.currentFilters, page);
  },

  async applyReportFilters() {
    const filters = {
      status: this.elements.filterStatus.value || null,
      searchTerm: this.elements.filterSearch.value.trim() || null,
      startDate: this.elements.filterStartDate.value || null,
      endDate: this.elements.filterEndDate.value || null
    };

    this.currentFilters = filters;
    await this.loadRecentMessages(filters, 1);
  },

  clearReportFilters() {
    this.elements.filterStatus.value = '';
    this.elements.filterSearch.value = '';
    this.elements.filterStartDate.value = '';
    this.elements.filterEndDate.value = '';
    this.currentFilters = null;
    this.loadRecentMessages(null, 1);
  },

  async exportReportCsv() {
    try {
      this.showReportsStatus('Exporting to CSV...', 'info');
      const response = await ipcRenderer.invoke('reports:export-csv');
      
      if (response.success) {
        this.showReportsStatus(`✅ Exported ${response.count} messages to CSV successfully!`, 'success');
      } else {
        this.showReportsStatus('Export failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.showReportsStatus('Error exporting CSV', 'error');
    }
  },

  async exportReportJson() {
    try {
      this.showReportsStatus('Exporting to JSON...', 'info');
      const response = await ipcRenderer.invoke('reports:export-json');
      
      if (response.success) {
        this.showReportsStatus(`✅ Exported ${response.count} messages to JSON successfully!`, 'success');
      } else {
        this.showReportsStatus('Export failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      this.showReportsStatus('Error exporting JSON', 'error');
    }
  },

  // Data Management Methods
  async loadDataStatistics() {
    try {
      const sizeResponse = await ipcRenderer.invoke('data:get-database-size');
      if (sizeResponse.success) {
        this.elements.dbSize.textContent = `${sizeResponse.sizeInMB} MB`;
      }

      const countsResponse = await ipcRenderer.invoke('data:get-statistics-count');
      if (countsResponse.success) {
        this.elements.dataContactsCount.textContent = countsResponse.counts.contacts;
        this.elements.dataMessagesCount.textContent = countsResponse.counts.messages;
        this.elements.dataTemplatesCount.textContent = countsResponse.counts.templates;
      }
    } catch (error) {
      console.error('Error loading data statistics:', error);
    }
  },

  async optimizeDatabase() {
    if (!confirm('Optimize database?\n\nThis will reclaim unused space and improve performance.\n\nThis may take a few moments.')) {
      return;
    }

    try {
      this.showSettingsStatus('Optimizing database...', 'info');
      
      const response = await ipcRenderer.invoke('data:vacuum-database');
      
      if (response.success) {
        this.showSettingsStatus('✅ Database optimized successfully!', 'success');
        await this.loadDataStatistics();
      } else {
        this.showSettingsStatus('Error optimizing database: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error optimizing database:', error);
      this.showSettingsStatus('Error optimizing database', 'error');
    }
  },

  async deleteAllData() {
    const confirmation1 = confirm(
      '⚠️ DELETE ALL DATA?\n\n' +
      'This will permanently delete:\n' +
      '• All contacts\n' +
      '• All message history\n' +
      '• All templates\n' +
      '• WhatsApp session\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmation1) {
      return;
    }

    const confirmation2 = confirm(
      '⚠️ FINAL WARNING!\n\n' +
      'This is your last chance to cancel.\n\n' +
      'Type YES in your mind and click OK to proceed with deletion.\n\n' +
      'Click Cancel to abort.'
    );

    if (!confirmation2) {
      this.showSettingsStatus('Data deletion cancelled', 'info');
      return;
    }

    try {
      this.showSettingsStatus('Deleting all data...', 'info');
      
      const response = await ipcRenderer.invoke('data:delete-all');
      
      if (response.success) {
        this.showSettingsStatus('✅ All data deleted successfully! The app will reload...', 'success');
        
        await this.loadDataStatistics();
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        this.showSettingsStatus('Error deleting data: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting all data:', error);
      this.showSettingsStatus('Error deleting all data', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialized successfully');
  UI.init();
});
