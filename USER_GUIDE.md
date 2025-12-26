# 📱 WhatsApp Automation Tool - User Guide

## 🎯 What is this application?

**WhatsApp Automation Tool** is a desktop application that allows you to:
- ✅ Send bulk messages to multiple contacts
- ✅ Manage message templates
- ✅ Import/export contacts from CSV
- ✅ View reports and statistics of sent messages
- ✅ Attach multimedia files (images, videos, documents)

---

## 💻 System Requirements

- **Operating System:** Windows 10 or higher (64-bit)
- **RAM:** Minimum 4 GB (recommended 8 GB)
- **Disk Space:** 500 MB free
- **Internet:** Stable connection required
- **WhatsApp:** Active WhatsApp account on your mobile phone

---

## 📥 Installation

### Step 1: Download
Download the file `WhatsApp Automation Tool Setup 1.0.0.exe`

### Step 2: Install
1. Double-click the installer
2. If Windows SmartScreen appears, click "More info" → "Run anyway"
3. Follow the installation wizard
4. Choose installation folder (or leave default)
5. Check "Create desktop shortcut"
6. Click "Install"

### Step 3: First Launch
1. Open the application from desktop
2. You will see a QR code on screen
3. Open WhatsApp on your phone
4. Go to **Settings** → **Linked devices** → **Link a device**
5. Scan the QR code
6. Done! The application will connect automatically

---

## 🚀 How to Use

### 📱 Messaging Tab

**Send Bulk Messages:**
1. Go to "Messaging" tab
2. (Optional) Select a template from the dropdown
3. Write your message or edit the template
4. (Optional) Attach a multimedia file
5. Click "Send to All Contacts"

**Features:**
- ✅ Configurable delay between messages (prevents blocks)
- ✅ Message queue with pause/resume control
- ✅ Dynamic variables: `{name}` and `{phone}`

### 📝 Templates Tab

**Create a Template:**
1. Go to "Templates" tab
2. Click "+ New Template"
3. Enter:
   - Template name
   - Category (optional)
   - Message content
   - Attachment (optional)
4. Click "Save"

**Use a Template:**
- Click the "✓ Use" button on any template
- The message will be automatically copied to the Messaging tab

**Available Variables:**
- `{name}` - Replaced with contact's name
- `{phone}` - Replaced with contact's number

### 📇 Contacts Tab

**Add Contact Manually:**
1. Go to "Contacts" tab
2. Click "+ Add Contact"
3. Enter name and number (format: +521234567890)
4. Click "Save"

**Import Contacts from CSV:**
1. Click "📥 Import CSV"
2. Follow format instructions
3. Select your CSV file
4. Contacts will be imported automatically

**Required CSV Format:**
```csv
name,phone
John Doe,+521234567890
Jane Smith,+529876543210
```

**Export Contacts:**
- Click "📤 Export CSV"
- Save the file to your computer

**Delete Contacts:**
- Individual: Click "🗑️ Delete" on each contact
- Multiple: Select several and click "🗑️ Delete Selected"
- All: Click "🗑️ Delete All" (be careful!)

### 📊 Reports Tab

**View Statistics:**
- Total messages sent
- Successful messages
- Failed messages
- Success rate

**Filter Messages:**
1. Select status (Sent/Failed/Pending)
2. Search by phone or text
3. Filter by date range
4. Click "Apply Filters"

**Export Reports:**
- CSV: For Excel/Google Sheets
- JSON: For technical analysis

**Pagination:**
- Navigate between pages with navigation buttons
- Shows 20 messages per page

### ⚙️ Settings Tab

**Delay Between Messages:**
- Configure wait time between each message (1-60 seconds)
- Recommended: 5-10 seconds to avoid WhatsApp blocks

**Data Management:**
- View database size
- Optimize database (recommended monthly)
- Delete all data (irreversible!)

---

## 🎨 Interface Features

### Change Language
- Click the **EN/ES** button in the top right corner
- Toggle between English and Spanish

### Change Theme
- Click the **🌙/☀️** button in the top right corner
- Toggle between light and dark theme

---

## ⚠️ Important Warnings

### WhatsApp Limits
- **Don't send spam:** WhatsApp can block your account
- **Respect the delay:** Minimum 5 seconds between messages
- **Daily maximum:** No more than 200-300 messages per day
- **Appropriate content:** Don't send prohibited content

### Best Practices
1. ✅ Use 5-10 second delays
2. ✅ Send personalized messages (use variables)
3. ✅ Verify numbers before sending
4. ✅ Test with few contacts first
5. ✅ Keep your WhatsApp active on phone

### What NOT to Do
1. ❌ Send messages without consent
2. ❌ Use delays less than 3 seconds
3. ❌ Send more than 500 messages per day
4. ❌ Share illegal content or spam
5. ❌ Use multiple devices simultaneously

---

## 🐛 Troubleshooting

### Application won't connect
1. Verify your internet connection
2. Make sure WhatsApp Web works in your browser
3. Close and reopen the application
4. Scan the QR code again

### Messages won't send
1. Verify the number has WhatsApp active
2. Use international format: +[country code][number]
3. Check the configured delay
4. Verify your WhatsApp is not blocked

### Error importing CSV
1. Verify file format (name,phone)
2. Make sure numbers include country code
3. Use UTF-8 encoding
4. Check there are no empty lines

### Application is slow
1. Optimize database (Settings Tab)
2. Delete old messages if there are many
3. Close other heavy applications
4. Restart the application

### QR code doesn't appear
1. Wait 10-15 seconds
2. Verify your internet connection
3. Close and reopen the application
4. Check that WhatsApp Web works in your browser

---

## 📂 Data Location

All your data is saved locally at:
```
C:\Users\[YourUser]\AppData\Roaming\whatsapp-electron-automation\
```

Includes:
- SQLite database with contacts, messages and templates
- WhatsApp session (to avoid scanning QR every time)
- Application configuration

---

## 🔒 Privacy and Security

- ✅ **All data is local** - Nothing is sent to external servers
- ✅ **No tracking** - We don't collect usage information
- ✅ **Open source** - You can review the source code
- ✅ **Secure session** - Uses the same protocol as WhatsApp Web

---

## 🆘 Support

### Common Issues
Check the "Troubleshooting" section above

### Error Logs
If you encounter an error, logs are at:
```
C:\Users\[YourUser]\AppData\Roaming\whatsapp-electron-automation\logs\
```

### Contact
For technical support or bug reports:
- Email: [your-email@example.com]
- GitHub: [your-repository]

---

## 📋 Changelog

### Version 1.0.0 (MVP)
- ✅ Bulk message sending
- ✅ Contact management
- ✅ Message templates
- ✅ Reports and statistics
- ✅ Import/export CSV
- ✅ Multilanguage support (EN/ES)
- ✅ Light/dark theme
- ✅ Attach multimedia files

---

## 📄 License

MIT License - Free use for personal and commercial purposes

---

## 🎉 Enjoy the Application!

If you have suggestions or find bugs, don't hesitate to contact us.

**Thank you for using WhatsApp Automation Tool!** 💬✨