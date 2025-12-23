# WhatsApp Desktop Automation Tool

<div align="center">

![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A desktop application for Windows that enables automated WhatsApp messaging with contact management and file operations.**

[Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Installation](#installation) • [Usage](#usage)

</div>

---

## 📋 Overview

WhatsApp Desktop Automation Tool is a local-first desktop application designed for non-technical users who need to send messages and manage contacts through WhatsApp in a simple, controlled manner. Built with Electron, it provides a graphical interface for WhatsApp Web automation without requiring cloud services or technical configurations.

### 🎯 Key Highlights

- **Local Execution**: All data stays on your machine - no cloud dependencies
- **Session Persistence**: Login once via QR code, stay authenticated across restarts
- **Contact Management**: Full CRUD operations with import/export capabilities
- **Automated Sending**: Sequential message delivery with configurable delays
- **File Support**: Send multimedia files alongside text messages
- **User-Friendly**: Zero command-line interaction required

---

## ✨ Features

### Authentication & Session
- ✅ QR code authentication via WhatsApp Web
- ✅ Persistent session storage (no re-login required)
- ✅ Automatic session restoration on app restart

### Messaging
- ✅ Send text messages to any WhatsApp number
- ✅ Phone number validation (international format support)
- ✅ Attach and send multimedia files (images, documents, etc.)
- ✅ Sequential message sending (prevents WhatsApp restrictions)
- ✅ Configurable delay between messages
- ✅ Pause/Resume/Stop controls during sending
- ✅ Complete message history tracking

### Contact Management
- ✅ Create, Read, Update, Delete (CRUD) contacts
- ✅ Search and filter contact list
- ✅ Duplicate phone number prevention
- ✅ Quick contact selection for messaging
- ✅ Import contacts from Excel (.xlsx, .xls) or CSV files
- ✅ Export contacts to Excel or CSV format
- ✅ Bulk import with validation and error reporting

### User Experience
- ✅ Intuitive graphical interface (no console required)
- ✅ Real-time visual feedback (success/error messages)
- ✅ Configuration persistence across sessions
- ✅ Modern UI built with TailwindCSS

---

## 🛠️ Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Electron** | ^28.0.0 | Desktop application framework |
| **Node.js** | 18+ | Runtime environment |
| **whatsapp-web.js** | ^1.23.0 | WhatsApp Web API integration |
| **better-sqlite3** | ^9.2.0 | Local database (SQLite) |

### File Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| **exceljs** | ^4.4.0 | Excel file read/write operations |
| **papaparse** | ^5.4.1 | CSV parsing and generation |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **libphonenumber-js** | ^1.10.0 | International phone number validation |
| **uuid** | ^9.0.0 | Unique identifier generation |
| **qrcode-terminal** | ^0.12.0 | QR code display for authentication |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **TailwindCSS** | ^3.4.0 | Utility-first CSS framework |
| **PostCSS** | ^8.4.32 | CSS processing |
| **Autoprefixer** | ^10.4.16 | CSS vendor prefixing |

### Build & Distribution
| Technology | Version | Purpose |
|------------|---------|---------|
| **electron-builder** | ^24.9.0 | Application packaging for Windows |

---

## 🏗️ Architecture

The application follows a **Layered Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process (UI)                   │
│                   HTML + TailwindCSS + JS                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (Inter-Process Communication)
┌──────────────────────────▼──────────────────────────────────┐
│                      Main Process                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  IPC Handlers (messageHandlers, contactHandlers)       │ │
│  └────────────┬───────────────────────────┬───────────────┘ │
│               │                           │                  │
│  ┌────────────▼────────────┐  ┌──────────▼────────────────┐ │
│  │   Services Layer        │  │   Validators              │ │
│  │  • whatsapp.service     │  │  • phoneValidator         │ │
│  │  • contact.service      │  │                           │ │
│  │  • import.service       │  │                           │ │
│  │  • export.service       │  │                           │ │
│  └────────────┬────────────┘  └───────────────────────────┘ │
│               │                                              │
│  ┌────────────▼────────────────────────────────────────────┐ │
│  │              Persistence Layer                          │ │
│  │  Repositories:                                          │ │
│  │  • contactRepository  • messageRepository               │ │
│  │  • configRepository                                     │ │
│  └────────────┬────────────────────────────────────────────┘ │
└───────────────┼──────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│                    SQLite Database                           │
│  Tables: users, sessions, configurations, contacts, messages │
└──────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Renderer (UI Layer)**
- Handles all user interactions and visual feedback
- Communicates with Main Process exclusively via IPC
- No direct access to WhatsApp API or database

**Main Process**
- Orchestrates application flow and business logic
- Validates inputs and enforces business rules
- Manages sequential sending, delays, and controls
- Coordinates between services and persistence layer

**Services Layer**
- `whatsapp.service.js`: Encapsulates all WhatsApp Web interactions
- `contact.service.js`: Contact business logic and validation
- `import.service.js`: Excel/CSV parsing and validation
- `export.service.js`: File generation for exports

**Persistence Layer**
- Abstracts database operations through repository pattern
- Provides clean interface for CRUD operations
- Manages data integrity and relationships

---

## 📁 Project Structure

```
whatsapp-electron-automation/
├── src/
│   ├── main/
│   │   ├── main.js                      # Main process entry point
│   │   ├── ipc/
│   │   │   ├── messageHandlers.js       # Message IPC handlers
│   │   │   └── contactHandlers.js       # Contact IPC handlers
│   │   ├── services/
│   │   │   ├── whatsapp.service.js      # WhatsApp integration
│   │   │   ├── contact.service.js       # Contact business logic
│   │   │   ├── import.service.js        # Import operations
│   │   │   └── export.service.js        # Export operations
│   │   ├── validators/
│   │   │   └── phoneValidator.js        # Phone validation
│   │   └── persistence/
│   │       ├── storage.js               # Database abstraction
│   │       └── repositories/
│   │           ├── contactRepository.js
│   │           ├── messageRepository.js
│   │           └── configRepository.js
│   └── renderer/
│       ├── index.html                   # Main UI
│       ├── pages/
│       │   ├── messages.html            # Message sending UI
│       │   └── contacts.html            # Contact management UI
│       ├── js/
│       │   ├── ui.js                    # Main UI logic
│       │   ├── messageUI.js             # Message UI logic
│       │   └── contactUI.js             # Contact UI logic
│       └── styles/
│           ├── main.css                 # Main styles
│           └── contacts.css             # Contact styles
├── docs/
│   ├── 01-requirements.md               # User stories & requirements
│   ├── 02-architecture.md               # Architecture documentation
│   └── flows/
│       └── DbDiagram.sql                # Database schema
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 💾 Database Schema

The application uses SQLite with the following main entities:

- **users**: Application user information
- **sessions**: WhatsApp session persistence
- **configurations**: User preferences and settings
- **contacts**: Saved contacts with validation
- **messages**: Message history with status tracking

Key features:
- Foreign key constraints for data integrity
- Indexes for optimized queries
- Unique constraints to prevent duplicates
- Cascade deletion for related records

---

## 🚀 Installation

### Prerequisites
- Node.js 18 or higher
- Windows OS
- Active WhatsApp account

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/whatsapp-electron-automation.git
cd whatsapp-electron-automation
```

2. **Install dependencies**
```bash
npm install
```

3. **Run in development mode**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

---

## 📖 Usage

### First Time Setup
1. Launch the application
2. Scan the QR code with your WhatsApp mobile app
3. Your session will be saved for future use

### Sending Messages
1. Navigate to the Messages section
2. Enter recipient phone number (or select from contacts)
3. Type your message
4. Optionally attach a file
5. Click Send

### Managing Contacts
1. Go to Contacts section
2. Add new contacts manually or import from Excel/CSV
3. Edit or delete existing contacts
4. Export your contact list for backup

### Importing Contacts
1. Prepare an Excel or CSV file with two columns: "Name" and "Phone Number"
2. Click "Import Contacts"
3. Select your file
4. Review the preview (valid/invalid contacts)
5. Confirm import

---

## 🎨 User Stories Implemented

This project implements 14 comprehensive user stories covering:
- Authentication (US-01, US-02)
- Messaging (US-03, US-04, US-05, US-06, US-07, US-08)
- User Experience (US-09, US-10, US-11)
- Contact Management (US-12, US-13, US-14)

See `docs/01-requirements.md` for detailed acceptance criteria.

---

## 🔒 Privacy & Security

- **Local-First**: All data stored locally on your machine
- **No Cloud**: No external servers or cloud services
- **Session Security**: WhatsApp session data encrypted and stored locally
- **Data Control**: Full control over your contacts and message history

---

## 🛣️ Roadmap

- [ ] Multi-language support
- [ ] Message templates
- [ ] Scheduled message sending
- [ ] Group messaging support
- [ ] Advanced analytics dashboard

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) for WhatsApp Web API
- [Electron](https://www.electronjs.org/) for the desktop framework
- All open-source contributors

---

<div align="center">

**Built with ❤️ for automation enthusiasts**

⭐ Star this repo if you find it useful!

</div>
