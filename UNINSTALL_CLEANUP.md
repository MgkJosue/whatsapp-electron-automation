# 🗑️ Uninstallation and Data Cleanup Guide

## 📍 Data Location

All application data is stored in:

```
C:\Users\[YOUR_USERNAME]\AppData\Roaming\whatsapp-electron-automation\
```

This folder contains:
- `whatsapp-automation.db` - SQLite database with all your data
- `.wwebjs_auth/` - WhatsApp Web session
- Other configuration files

---

## 🔧 Option 1: Delete Data from the Application (Recommended)

### Before uninstalling:

1. Open the application
2. Go to the **⚙️ Settings** tab
3. Scroll to the **Data Management** section
4. Click on **🗑️ Delete All Data**
5. Confirm deletion (2 times)
6. Wait for completion
7. Now you can uninstall the application

**Advantages:**
- ✅ Controlled cleanup
- ✅ Deletes only user data
- ✅ Maintains structure if you want to reinstall

---

## 🗂️ Option 2: Manually Delete the Folder

### After uninstalling:

1. Press `Win + R`
2. Type: `%APPDATA%`
3. Press Enter
4. Find the `whatsapp-electron-automation` folder
5. Right-click → **Delete**
6. Empty the Recycle Bin

**Advantages:**
- ✅ Complete removal
- ✅ Frees all space
- ✅ No traces left

---

## 🤖 Option 3: Automatic Cleanup Script

### Create cleanup script:

1. Create a `cleanup.bat` file with this content:

```batch
@echo off
echo ========================================
echo WhatsApp Electron Automation Cleanup
echo ========================================
echo.
echo This script will delete ALL application data.
echo.
pause

set "APP_DATA=%APPDATA%\whatsapp-electron-automation"

if exist "%APP_DATA%" (
    echo Deleting folder: %APP_DATA%
    rmdir /s /q "%APP_DATA%"
    echo.
    echo ✓ Data deleted successfully!
) else (
    echo × The folder does not exist or has already been deleted.
)

echo.
echo Press any key to close...
pause > nul
```

2. Run the `cleanup.bat` file as Administrator
3. Confirm deletion

---

## 📊 What Gets Deleted?

When deleting data, the following are removed:

- ✅ **All saved contacts**
- ✅ **All message history** sent
- ✅ **All created templates**
- ✅ **WhatsApp session** (you'll need to scan QR again)
- ✅ **Custom settings**
- ✅ **Statistics and reports**

---

## 💾 How Much Space Does It Use?

The database size depends on usage:

- **Light usage** (few messages): 1-5 MB
- **Moderate usage** (hundreds of messages): 5-20 MB
- **Heavy usage** (thousands of messages): 20-100 MB

**Note:** The application uses SQLite, which is very efficient. It shouldn't consume much memory.

---

## 🔄 Optimization Without Deleting

If you just want to free up space without deleting data:

1. Go to **Settings** → **Data Management**
2. Click on **🔧 Optimize Database**
3. This runs `VACUUM` on SQLite
4. Reclaims unused space
5. Improves performance

**Recommendation:** Optimize every 1-2 months if you use the app intensively.

---

## ⚠️ Important

- **Backup:** If you want to save your data, copy the `whatsapp-automation.db` file before deleting
- **Reinstallation:** If you reinstall the app, data persists unless you manually delete it
- **Multiple users:** If several users use the PC, each has their own folder in their profile

---

## 🆘 Common Issues

### "I can't find the folder"

1. Make sure to show hidden files:
   - File Explorer → View → ☑ Hidden items
2. The `AppData` folder is hidden by default

### "I can't delete the folder"

1. Completely close the application
2. Verify there are no Electron processes running:
   - Ctrl + Shift + Esc (Task Manager)
   - Search for "electron" and end the process
3. Try again

### "I want to recover my data"

- If you deleted the data, it **CANNOT be recovered**
- There is no automatic backup
- Consider exporting reports before deleting

---

## 📝 Developer Notes

The application is designed for:
- ✅ Secure local storage
- ✅ Does not send data to external servers
- ✅ Full control over your data
- ✅ Easy cleanup when needed

**Privacy:** All your data remains on your computer.