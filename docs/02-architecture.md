# System Architecture — WhatsApp Desktop Automation Tool (Updated)

## Overview
This document defines the complete architecture for the WhatsApp Desktop Automation Tool.  
It reflects the updated system requirements and user stories, ensuring a clear separation of responsibilities and structured communication between layers.

**Target Platform:** Windows Desktop  
**Target Users:** Non-technical users  
**Execution Mode:** Local  

---

## Architecture Pattern

The architecture is based on:

- **Layered Architecture (N-tier)**: clear separation of responsibilities between layers.  
- **Electron Main/Renderer pattern**: Renderer handles UI, Main Process orchestrates logic.  
- **Service Layer pattern**: WhatsApp Service encapsulates all WhatsApp interactions.  
- **Repository pattern**: Persistence Layer abstracts local storage (JSON/SQLite/LowDB).  

**In summary:**  
> Layered Architecture with Service and Repository Patterns, adapted to Electron Main/Renderer.

---

## Layers and Responsibilities

### 1. Renderer / UI
- Handles user inputs: phone number, message text, file selection, buttons for send/pause/stop.
- Handles contact management UI: create, edit, delete, view contacts list.
- Handles file import/export UI: select files, preview data, confirm operations.
- Displays visual feedback: success, error messages, sending progress.  
- **Does not** interact with WhatsApp directly or access local storage.  
- Communicates only with Main Process via IPC.

### 2. Main Process
- Orchestrates the application flow.  
- Receives events from UI, validates inputs, controls sequential sending, delays, pauses, and stops.
- Manages contact operations: CRUD operations, validation, duplicate prevention.
- Processes file imports: parses Excel/CSV files, validates data, handles preview and confirmation.
- Processes file exports: generates Excel/CSV files with contact data.
- Delegates tasks to WhatsApp Service and Persistence Layer.  
- Sends results and feedback back to UI.  

### 3. WhatsApp Service
- Encapsulates all `whatsapp-web.js` logic.  
- Handles QR authentication, session management, sending text and multimedia messages.  
- Emits events and results to Main Process.  
- **Does not** communicate directly with UI or access local storage.  

### 4. Persistence Layer
- Stores and loads session data, configuration, contact data, and message history.
- Provides an abstract interface (methods) for Main Process to read/write data.
- Manages contact database operations: create, read, update, delete.
- **Does not** interact with UI or WhatsApp directly.  

---

## Mapping User Stories to Layers

| User Story | Primary Layer | Secondary Layer |
|------------|---------------|----------------|
| US-01 QR Authentication | WhatsApp Service | Main, UI, Persistence |
| US-02 Session Persistence | Persistence | Main, UI |
| US-03 Send Text Message | WhatsApp Service | Main, UI, Persistence |
| US-04 Phone Number Validation | Main | UI |
| US-05 Attach File | Main / UI | WhatsApp Service |
| US-06 Sequential Sending | Main | WhatsApp Service |
| US-07 Delay Configuration | Main | UI |
| US-08 Pause/Stop Sending | Main | UI, WhatsApp Service |
| US-09 No Console Usage | UI | - |
| US-10 Visual Feedback | UI | Main |
| US-11 Configuration Persistence | Persistence | Main, UI |
| US-12 Manage Contacts | Persistence | Main, UI |
| US-13 Import Contacts | Main | UI, Persistence |
| US-14 Export Contacts | Main | UI, Persistence |

---

## Communication Between Layers

The system uses **controlled communication channels**:

```
Renderer (UI) <---- IPC ----> Main Process <----> WhatsApp Service
                                   |
                                   v
                            Persistence Layer
```

**Communication Rules:**

- UI → Main: user actions (send message, select file, pause, configure delay, manage contacts, import/export)  
- Main → UI: visual feedback, success/error messages, sending status, contact lists, import/export results  
- Main → WhatsApp Service: commands to send messages, authenticate, manage session  
- WhatsApp Service → Main: results, errors, events  
- Main → Persistence: save/load session, configuration, contacts, history  
- Persistence → Main: return stored data  

> No layer bypasses these channels to communicate directly with another layer.

---

## Project Folder Structure

```
src/
├── main/
│   ├── main.js                      # Main Process entry point
│   ├── ipc/
│   │   ├── messageHandlers.js       # Message sending event handlers
│   │   └── contactHandlers.js       # Contact management event handlers (NEW)
│   ├── services/
│   │   ├── whatsapp.service.js      # Encapsulates whatsapp-web.js interactions
│   │   ├── contact.service.js       # Contact business logic (NEW)
│   │   ├── import.service.js        # File import logic (Excel/CSV) (NEW)
│   │   └── export.service.js        # File export logic (Excel/CSV) (NEW)
│   ├── validators/
│   │   └── phoneValidator.js        # Phone number validation logic (NEW)
│   └── persistence/
│       ├── storage.js               # Abstract data access (JSON/SQLite/LowDB)
│       └── repositories/
│           ├── contactRepository.js # Contact CRUD operations (NEW)
│           ├── messageRepository.js # Message CRUD operations (NEW)
│           └── configRepository.js  # Configuration operations (NEW)
├── renderer/
│   ├── index.html                   # UI markup
│   ├── pages/
│   │   ├── messages.html            # Message sending UI
│   │   └── contacts.html            # Contact management UI (NEW)
│   ├── js/
│   │   ├── ui.js                    # Main UI logic
│   │   ├── messageUI.js             # Message UI logic
│   │   └── contactUI.js             # Contact UI logic (NEW)
│   └── styles/
│       ├── main.css                 # Main styles
│       └── contacts.css             # Contact styles (NEW)
└── shared/
    ├── constants.js                 # Global constants
    └── types.js                     # Type definitions (NEW)
```

- Each folder reflects a **layer in the architecture**  
- New services handle contact management and file operations
- New repositories provide data access abstraction
- Facilitates maintainability, testing, and scalability  

---

## New Components Detail

### Contact Service (`contact.service.js`)
**Responsibilities:**
- Validate contact data (name and phone number)
- Check for duplicate phone numbers
- Orchestrate contact CRUD operations
- Handle contact search and filtering

### Import Service (`import.service.js`)
**Responsibilities:**
- Parse Excel (.xlsx, .xls) files using libraries like `xlsx`
- Parse CSV files using libraries like `csv-parser` or `papaparse`
- Validate imported contact data
- Generate preview data for UI confirmation
- Generate error reports for invalid contacts
- Batch insert valid contacts into database

### Export Service (`export.service.js`)
**Responsibilities:**
- Retrieve all contacts from database
- Format data for Excel/CSV export
- Generate Excel files using libraries like `xlsx`
- Generate CSV files
- Return file path to UI

### Contact Repository (`contactRepository.js`)
**Responsibilities:**
- Create contact record
- Read contact(s) from database
- Update contact record
- Delete contact record
- Search/filter contacts
- Check for duplicate phone numbers

### Phone Validator (`phoneValidator.js`)
**Responsibilities:**
- Validate phone number format
- Format phone numbers consistently
- Extract country code
- Check phone number length

---

## Conceptual Diagram

```
User <--> Renderer (UI) <--> Main Process <----> WhatsApp Service
                                   |
                                   |---> Contact Service
                                   |---> Import Service
                                   |---> Export Service
                                   |
                                   v
                            Persistence Layer
                                   |
                                   |---> Contact Repository
                                   |---> Message Repository
                                   |---> Config Repository
```

---

## Flow Examples

### Flow 1: Send Message (Original)

1. User types message and phone number in UI  
2. Renderer sends event to Main Process via IPC  
3. Main Process validates input and enforces sequential sending & delay  
4. Main Process calls WhatsApp Service to send message  
5. WhatsApp Service sends the message and returns result to Main Process  
6. Main Process updates UI with success/error  
7. Main Process stores message history in Persistence Layer via Message Repository

### Flow 2: Create Contact (New)

1. User fills contact form (name + phone) in UI
2. Renderer sends "create-contact" event to Main Process via IPC
3. Main Process calls Phone Validator to validate phone number
4. Main Process calls Contact Service to create contact
5. Contact Service checks for duplicates via Contact Repository
6. Contact Service saves contact via Contact Repository
7. Persistence Layer stores contact in database
8. Main Process sends success/error feedback to UI
9. UI updates contact list

### Flow 3: Import Contacts (New)

1. User selects Excel/CSV file in UI
2. Renderer sends "import-contacts" event with file path to Main Process
3. Main Process calls Import Service to parse file
4. Import Service validates each contact (name + phone)
5. Import Service generates preview (valid, invalid, duplicates)
6. Main Process sends preview data to UI
7. User confirms import in UI
8. Renderer sends "confirm-import" event to Main Process
9. Main Process calls Import Service to batch insert valid contacts
10. Import Service uses Contact Repository to insert contacts
11. Persistence Layer stores contacts in database
12. Main Process sends import results to UI (success count, errors, duplicates)
13. UI displays results and updates contact list

### Flow 4: Export Contacts (New)

1. User clicks "Export" button and selects format (Excel/CSV)
2. Renderer sends "export-contacts" event to Main Process
3. Main Process calls Export Service
4. Export Service retrieves all contacts via Contact Repository
5. Export Service formats data and generates file
6. Export Service saves file to user's selected location
7. Main Process sends file path to UI
8. UI displays success message with file location

### Flow 5: Select Contact for Message (New)

1. User is in message sending screen
2. UI displays contact dropdown populated from local contact list
3. User types in search box to filter contacts
4. User selects a contact from dropdown
5. UI auto-fills phone number field with selected contact's number
6. User continues with normal message sending flow (Flow 1)

---

## Technology Stack Updates

### Additional Libraries Needed

**For File Processing:**
- `xlsx` or `exceljs`: Read and write Excel files
- `csv-parser` or `papaparse`: Parse CSV files
- `json2csv`: Generate CSV from JSON data

**For Validation:**
- `libphonenumber-js`: Advanced phone number validation (optional)
- Custom regex-based validator for basic validation

**For Database (if using SQLite):**
- `better-sqlite3` or `sqlite3`: SQLite database access
- Alternatively, `lowdb` for JSON-based storage

---

## Database Schema Reference

The following entities are persisted:

1. **users**: Single user of the application
2. **sessions**: WhatsApp session data
3. **configurations**: Application settings
4. **contacts**: Saved contacts (NEW)
5. **messages**: Message history with references to contacts

See separate database diagram document for detailed schema.

---

## Stage Closure

- This architecture document **fully covers all updated user stories** (US-01 through US-14).
- Contact management features are fully integrated into the layered architecture.
- File import/export operations follow the same architectural patterns.
- All future development must follow this design to maintain consistency.
- The system is now **ready to proceed to implementation**.

---