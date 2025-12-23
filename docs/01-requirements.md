# System Requirements — User Stories

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

## Stage Closure

This document defines the complete system scope.  
All future development must derive from these user stories.  
The requirements stage is considered closed once this document is approved.
