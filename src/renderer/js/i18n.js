const translations = {
  en: {
    // Header
    appTitle: 'WhatsApp Automation Tool',
    statusInitializing: 'Initializing...',
    statusConnected: 'Connected to WhatsApp',
    statusDisconnected: 'Disconnected',
    
    // Navigation
    navMessaging: 'Messaging',
    navTemplates: 'Templates',
    navContacts: 'Contacts',
    navReports: 'Reports',
    navSettings: 'Settings',
    
    // Authentication
    authTitle: 'WhatsApp Authentication',
    authScanQR: 'Scan this QR code with your WhatsApp mobile app:',
    authConnected: 'Connected as:',
    authLogout: 'Logout',
    
    // Messaging Tab
    msgTitle: 'Send Messages',
    msgQueueStatus: 'Queue Status',
    msgQueueEmpty: 'Queue is empty',
    msgProcessing: 'Processing',
    msgPaused: 'Paused',
    msgInQueue: 'messages in queue',
    msgPauseQueue: 'Pause Queue',
    msgResumeQueue: 'Resume Queue',
    msgStopQueue: 'Stop Queue',
    msgUseTemplate: 'Use Template',
    msgSelectTemplate: '-- Select a template --',
    msgMessageLabel: 'Message',
    msgMessagePlaceholder: 'Type your message here...',
    msgAttachFile: 'Attach File (Optional)',
    msgSendToAll: 'Send to All Contacts',
    msgSendToSelected: 'Send to Selected',
    
    // Templates Tab
    tmpTitle: 'Message Templates',
    tmpNewTemplate: 'New Template',
    tmpSearch: 'Search templates...',
    tmpEmpty: 'No templates yet. Create your first template!',
    tmpUse: 'Use',
    tmpEdit: 'Edit',
    tmpDelete: 'Delete',
    tmpHasFile: 'Has attached file',
    tmpModalNew: 'New Template',
    tmpModalEdit: 'Edit Template',
    tmpName: 'Template Name',
    tmpNamePlaceholder: 'e.g., Welcome Message',
    tmpCategory: 'Category (Optional)',
    tmpCategoryPlaceholder: 'e.g., Sales, Support, Marketing',
    tmpContent: 'Message Content',
    tmpContentPlaceholder: 'Type your template message here...\n\nYou can use variables:\n{nombre} - Contact name\n{telefono} - Contact phone number',
    tmpAttachFile: 'Attach File (Optional)',
    tmpAttachHint: 'Images, videos, documents, audio supported',
    tmpVariablesHint: 'Use {nombre} and {telefono} as placeholders that will be replaced automatically',
    tmpCancel: 'Cancel',
    tmpSave: 'Save Template',
    tmpDeleteConfirm: 'Are you sure you want to delete',
    
    // Contacts Tab
    cntTitle: 'Contact Management',
    cntAddContact: 'Add Contact',
    cntImportCSV: 'Import CSV',
    cntExportCSV: 'Export CSV',
    cntDeleteSelected: 'Delete Selected',
    cntDeleteAll: 'Delete All',
    cntSearch: 'Search contacts...',
    cntSelectAll: 'Select All',
    cntEmpty: 'No contacts yet. Add your first contact!',
    cntModalAdd: 'Add New Contact',
    cntModalEdit: 'Edit Contact',
    cntName: 'Name',
    cntNamePlaceholder: 'Contact name',
    cntPhone: 'Phone Number',
    cntPhonePlaceholder: '+1234567890',
    cntPhoneHint: 'Include country code (e.g., +1 for USA)',
    
    // Reports Tab
    rptTitle: 'Reports & Statistics',
    rptTotalMessages: 'Total Messages',
    rptSentSuccessfully: 'Sent Successfully',
    rptFailed: 'Failed',
    rptSuccessRate: 'Success Rate',
    rptFilterMessages: 'Filter Messages',
    rptAllStatus: 'All Status',
    rptStatusSent: 'Sent',
    rptStatusFailed: 'Failed',
    rptStatusPending: 'Pending',
    rptStatusSending: 'Sending',
    rptSearchPlaceholder: 'Search by phone or message...',
    rptApplyFilters: 'Apply Filters',
    rptClearFilters: 'Clear',
    rptExportCSV: 'Export CSV',
    rptExportJSON: 'Export JSON',
    rptRefresh: 'Refresh',
    rptMessageHistory: 'Message History',
    rptDate: 'Date',
    rptContact: 'Contact',
    rptPhone: 'Phone',
    rptMessage: 'Message',
    rptStatus: 'Status',
    rptEmpty: 'No messages yet. Start sending messages to see history!',
    rptShowing: 'Showing',
    rptOf: 'of',
    rptMessages: 'messages',
    rptFirst: 'First',
    rptPrevious: 'Previous',
    rptNext: 'Next',
    rptLast: 'Last',
    
    // Settings Tab
    setTitle: 'Settings',
    setQueueConfig: 'Message Queue Configuration',
    setDelay: 'Delay between messages (seconds):',
    setDelayHint: 'This delay applies between each message when sending to multiple contacts',
    setSave: 'Save',
    setDataManagement: 'Data Management',
    setDatabaseSize: 'Database Size:',
    setContacts: 'Contacts:',
    setMessages: 'Messages:',
    setTemplates: 'Templates:',
    setOptimizeDB: 'Optimize Database',
    setDeleteAllData: 'Delete All Data',
    setWarning: 'Warning:',
    setWarningText: 'Deleting all data will permanently remove:',
    setWarningContacts: 'All contacts',
    setWarningMessages: 'All message history',
    setWarningTemplates: 'All templates',
    setWarningSession: 'WhatsApp session (will need to re-authenticate)',
    setWarningUndo: 'This action cannot be undone.',
    
    // Theme & Language
    themeLight: 'Light',
    themeDark: 'Dark',
    langEnglish: 'English',
    langSpanish: 'Español',
    
    // Common
    btnCancel: 'Cancel',
    btnSave: 'Save',
    btnDelete: 'Delete',
    btnEdit: 'Edit',
    btnClose: 'Close',
    btnYes: 'Yes',
    btnNo: 'No',
    btnOk: 'OK',
    
    // Notifications
    notifSuccess: 'Success',
    notifError: 'Error',
    notifWarning: 'Warning',
    notifInfo: 'Information',
  },
  
  es: {
    // Header
    appTitle: 'Herramienta de Automatización de WhatsApp',
    statusInitializing: 'Inicializando...',
    statusConnected: 'Conectado a WhatsApp',
    statusDisconnected: 'Desconectado',
    
    // Navigation
    navMessaging: 'Mensajería',
    navTemplates: 'Plantillas',
    navContacts: 'Contactos',
    navReports: 'Reportes',
    navSettings: 'Configuración',
    
    // Authentication
    authTitle: 'Autenticación de WhatsApp',
    authScanQR: 'Escanea este código QR con tu aplicación móvil de WhatsApp:',
    authConnected: 'Conectado como:',
    authLogout: 'Cerrar Sesión',
    
    // Messaging Tab
    msgTitle: 'Enviar Mensajes',
    msgQueueStatus: 'Estado de la Cola',
    msgQueueEmpty: 'La cola está vacía',
    msgProcessing: 'Procesando',
    msgPaused: 'Pausado',
    msgInQueue: 'mensajes en cola',
    msgPauseQueue: 'Pausar Cola',
    msgResumeQueue: 'Reanudar Cola',
    msgStopQueue: 'Detener Cola',
    msgUseTemplate: 'Usar Plantilla',
    msgSelectTemplate: '-- Selecciona una plantilla --',
    msgMessageLabel: 'Mensaje',
    msgMessagePlaceholder: 'Escribe tu mensaje aquí...',
    msgAttachFile: 'Adjuntar Archivo (Opcional)',
    msgSendToAll: 'Enviar a Todos los Contactos',
    msgSendToSelected: 'Enviar a Seleccionados',
    
    // Templates Tab
    tmpTitle: 'Plantillas de Mensajes',
    tmpNewTemplate: 'Nueva Plantilla',
    tmpSearch: 'Buscar plantillas...',
    tmpEmpty: '¡No hay plantillas aún. Crea tu primera plantilla!',
    tmpUse: 'Usar',
    tmpEdit: 'Editar',
    tmpDelete: 'Eliminar',
    tmpHasFile: 'Tiene archivo adjunto',
    tmpModalNew: 'Nueva Plantilla',
    tmpModalEdit: 'Editar Plantilla',
    tmpName: 'Nombre de la Plantilla',
    tmpNamePlaceholder: 'ej., Mensaje de Bienvenida',
    tmpCategory: 'Categoría (Opcional)',
    tmpCategoryPlaceholder: 'ej., Ventas, Soporte, Marketing',
    tmpContent: 'Contenido del Mensaje',
    tmpContentPlaceholder: 'Escribe tu mensaje de plantilla aquí...\n\nPuedes usar variables:\n{nombre} - Nombre del contacto\n{telefono} - Número de teléfono del contacto',
    tmpAttachFile: 'Adjuntar Archivo (Opcional)',
    tmpAttachHint: 'Imágenes, videos, documentos, audio soportados',
    tmpVariablesHint: 'Usa {nombre} y {telefono} como marcadores que se reemplazarán automáticamente',
    tmpCancel: 'Cancelar',
    tmpSave: 'Guardar Plantilla',
    tmpDeleteConfirm: '¿Estás seguro de que quieres eliminar',
    
    // Contacts Tab
    cntTitle: 'Gestión de Contactos',
    cntAddContact: 'Agregar Contacto',
    cntImportCSV: 'Importar CSV',
    cntExportCSV: 'Exportar CSV',
    cntDeleteSelected: 'Eliminar Seleccionados',
    cntDeleteAll: 'Eliminar Todos',
    cntSearch: 'Buscar contactos...',
    cntSelectAll: 'Seleccionar Todos',
    cntEmpty: '¡No hay contactos aún. Agrega tu primer contacto!',
    cntModalAdd: 'Agregar Nuevo Contacto',
    cntModalEdit: 'Editar Contacto',
    cntName: 'Nombre',
    cntNamePlaceholder: 'Nombre del contacto',
    cntPhone: 'Número de Teléfono',
    cntPhonePlaceholder: '+1234567890',
    cntPhoneHint: 'Incluye código de país (ej., +1 para USA)',
    
    // Reports Tab
    rptTitle: 'Reportes y Estadísticas',
    rptTotalMessages: 'Mensajes Totales',
    rptSentSuccessfully: 'Enviados Exitosamente',
    rptFailed: 'Fallidos',
    rptSuccessRate: 'Tasa de Éxito',
    rptFilterMessages: 'Filtrar Mensajes',
    rptAllStatus: 'Todos los Estados',
    rptStatusSent: 'Enviado',
    rptStatusFailed: 'Fallido',
    rptStatusPending: 'Pendiente',
    rptStatusSending: 'Enviando',
    rptSearchPlaceholder: 'Buscar por teléfono o mensaje...',
    rptApplyFilters: 'Aplicar Filtros',
    rptClearFilters: 'Limpiar',
    rptExportCSV: 'Exportar CSV',
    rptExportJSON: 'Exportar JSON',
    rptRefresh: 'Actualizar',
    rptMessageHistory: 'Historial de Mensajes',
    rptDate: 'Fecha',
    rptContact: 'Contacto',
    rptPhone: 'Teléfono',
    rptMessage: 'Mensaje',
    rptStatus: 'Estado',
    rptEmpty: '¡No hay mensajes aún. Comienza a enviar mensajes para ver el historial!',
    rptShowing: 'Mostrando',
    rptOf: 'de',
    rptMessages: 'mensajes',
    rptFirst: 'Primero',
    rptPrevious: 'Anterior',
    rptNext: 'Siguiente',
    rptLast: 'Último',
    
    // Settings Tab
    setTitle: 'Configuración',
    setQueueConfig: 'Configuración de Cola de Mensajes',
    setDelay: 'Retraso entre mensajes (segundos):',
    setDelayHint: 'Este retraso se aplica entre cada mensaje al enviar a múltiples contactos',
    setSave: 'Guardar',
    setDataManagement: 'Gestión de Datos',
    setDatabaseSize: 'Tamaño de Base de Datos:',
    setContacts: 'Contactos:',
    setMessages: 'Mensajes:',
    setTemplates: 'Plantillas:',
    setOptimizeDB: 'Optimizar Base de Datos',
    setDeleteAllData: 'Eliminar Todos los Datos',
    setWarning: 'Advertencia:',
    setWarningText: 'Eliminar todos los datos removerá permanentemente:',
    setWarningContacts: 'Todos los contactos',
    setWarningMessages: 'Todo el historial de mensajes',
    setWarningTemplates: 'Todas las plantillas',
    setWarningSession: 'Sesión de WhatsApp (necesitarás re-autenticarte)',
    setWarningUndo: 'Esta acción no se puede deshacer.',
    
    // Theme & Language
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    langEnglish: 'English',
    langSpanish: 'Español',
    
    // Common
    btnCancel: 'Cancelar',
    btnSave: 'Guardar',
    btnDelete: 'Eliminar',
    btnEdit: 'Editar',
    btnClose: 'Cerrar',
    btnYes: 'Sí',
    btnNo: 'No',
    btnOk: 'OK',
    
    // Notifications
    notifSuccess: 'Éxito',
    notifError: 'Error',
    notifWarning: 'Advertencia',
    notifInfo: 'Información',
  }
};

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'en';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      this.updateUI();
    }
  }

  t(key) {
    return translations[this.currentLang][key] || key;
  }

  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.placeholder) {
          element.placeholder = translation;
        }
      } else {
        element.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}

const i18n = new I18n();
window.i18n = i18n;
