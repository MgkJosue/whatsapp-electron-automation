# System Requirements — User Stories (Updated)

## Project
WhatsApp Desktop Automation Tool

## Platform
Desktop Application (Windows)

## Target Users
Non-technical users

## Execution Mode
Local

---

## System Objective

As a non-technical user,  
I want to use a desktop application to send messages and files through WhatsApp,  
so that I can communicate in a simple and controlled way without relying on technical configurations or cloud services.

---

## System Scope

### Included Features
- Authentication via WhatsApp QR code.
- Session persistence between application restarts.
- Contact management (create, edit, delete).
- Import/export contacts from Excel or CSV files.
- Sending text messages.
- Sending multimedia files.
- Basic automation (sequential sending with delay).
- Simple graphical user interface.
- Local execution on Windows.

### Excluded Features
- Multi-user support.
- Cloud-based execution.
- CRM integrations.
- Artificial intelligence features.
- Uncontrolled bulk messaging.
- macOS or Linux support.

---

## User Stories (Base Backlog)

### US-01 — QR Authentication
As a user  
I want to log in to WhatsApp by scanning a QR code  
so that I can link my account without technical setup.

**Acceptance Criteria**
- The system displays a visible QR code.
- The QR code belongs to WhatsApp Web.
- The user can scan the QR code using their phone.

---

### US-02 — Session Persistence
As a user  
I want the application to remember my session  
so that I do not need to scan the QR code every time I open it.

**Acceptance Criteria**
- The session remains active after closing and reopening the application.
- The QR code is not requested if the session is valid.

---

### US-03 — Send Text Message
As a user  
I want to send a text message to a WhatsApp number  
so that I can communicate directly from the application.

**Acceptance Criteria**
- There is an input field for the phone number.
- There is a text input field for the message.
- There is a send button.
- The system shows a confirmation message.

---

### US-04 — Phone Number Validation
As a user  
I want the system to validate the phone number before sending the message  
so that I can avoid errors.

**Acceptance Criteria**
- The system detects invalid phone number formats.
- A clear error message is displayed.
- The message is not sent if the number is invalid.

---

### US-05 — Attach File
As a user  
I want to attach a file to my message  
so that I can send images or documents.

**Acceptance Criteria**
- The system allows file selection from the operating system.
- The selected file is displayed before sending.
- The file is sent together with the message.

---

### US-06 — Sequential Sending
As a user  
I want messages to be sent sequentially  
so that I can avoid WhatsApp restrictions.

**Acceptance Criteria**
- Messages are sent one by one.
- Messages are not sent in parallel.

---

### US-07 — Delay Configuration
As a user  
I want to configure a delay between messages  
so that I can control the sending speed.

**Acceptance Criteria**
- There is an input field to define delay in seconds.
- The system respects the configured delay.

---

### US-08 — Pause or Stop Sending
As a user  
I want to pause or stop the sending process  
so that I have full control over the system.

**Acceptance Criteria**
- There is a pause button.
- There is a stop button.
- The system reacts immediately to the action.

---

### US-09 — No Console Usage
As a non-technical user  
I want to use all features through the graphical interface  
so that I do not need to use the console.

**Acceptance Criteria**
- No command-line interaction is required.
- All actions are available through the UI.

---

### US-10 — Visual Feedback
As a user  
I want to receive visual feedback from the system  
so that I understand what is happening.

**Acceptance Criteria**
- Success messages are displayed.
- Error messages are displayed.
- Messages are clear and visible.

---

### US-11 — Configuration Persistence
As a user  
I want the application to save my configuration  
so that I do not need to configure it every time I open it.

**Acceptance Criteria**
- Configuration is saved locally.
- Configuration is restored when the application restarts.

---

### US-12 — Manage Contacts
As a user  
I want to manage my contacts (create, edit, delete, and view)  
so that I can organize my contact list and send messages more easily.

**Acceptance Criteria**
- There is a "Contacts" section in the interface.
- I can create a new contact with name and phone number.
- I can edit an existing contact's name or phone number.
- I can delete a contact from the list.
- I can view all my contacts in a list.
- The list shows contact name and phone number.
- The list has a search/filter function.
- Phone numbers are validated when creating or editing contacts.
- The system prevents duplicate phone numbers.
- When sending a message, I can select a contact from a dropdown list.
- The phone number field is automatically filled when selecting a contact.
- Past messages remain in history even if I delete the contact.
- All contact operations show clear success or error messages.

---

### US-13 — Import Contacts from File
As a user  
I want to import multiple contacts from an Excel or CSV file  
so that I can quickly add many contacts without typing them one by one.

**Acceptance Criteria**
- There is an "Import Contacts" button in the interface.
- The system accepts Excel (.xlsx, .xls) and CSV (.csv) files.
- The file must have exactly two columns: "Name" and "Phone Number".
- The first row can be headers (Name, Phone Number) and is skipped automatically.
- The system validates each phone number before importing.
- The system shows a preview of contacts before final import.
- The preview displays:
  - Total contacts in file
  - Valid contacts to be imported
  - Invalid contacts with error reasons
- I can confirm or cancel the import after seeing the preview.
- After import, the system shows:
  - Number of contacts successfully imported
  - Number of duplicates skipped
  - Number of invalid contacts rejected
- The system allows me to download a report of invalid contacts.
- All imported contacts appear in the contacts list.

**File Format Example (CSV):**
```
Name,Phone Number
John Doe,+1234567890
Jane Smith,+0987654321
```

**File Format Example (Excel):**
```
| Name       | Phone Number   |
|------------|----------------|
| John Doe   | +1234567890    |
| Jane Smith | +0987654321    |
```

---

### US-14 — Export Contacts to File
As a user  
I want to export my contacts list to an Excel or CSV file  
so that I can back up my contacts or use them in other applications.

**Acceptance Criteria**
- There is an "Export Contacts" button in the interface.
- I can choose between Excel (.xlsx) or CSV (.csv) format.
- The exported file contains two columns: "Name" and "Phone Number".
- The exported file includes all saved contacts.
- The system shows a success message with the file location.
- The exported file can be re-imported using US-13.

---

## Stage Closure

This document defines the complete system scope including contact management features.  
All future development must derive from these user stories.  
The requirements stage is considered closed once this document is approved.

---
