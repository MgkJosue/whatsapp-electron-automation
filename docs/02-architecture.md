# System Architecture — WhatsApp Desktop Automation Tool

## Overview
This document defines the complete architecture for the WhatsApp Desktop Automation Tool.  
It reflects the system requirements and user stories, ensuring a clear separation of responsibilities and structured communication between layers.

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
- Displays visual feedback: success, error messages, sending progress.  
- **Does not** interact with WhatsApp directly or access local storage.  
- Communicates only with Main Process via IPC.

### 2. Main Process
- Orchestrates the application flow.  
- Receives events from UI, validates inputs, controls sequential sending, delays, pauses, and stops.  
- Delegates tasks to WhatsApp Service and Persistence Layer.  
- Sends results and feedback back to UI.  

### 3. WhatsApp Service
- Encapsulates all `whatsapp-web.js` logic.  
- Handles QR authentication, session management, sending text and multimedia messages.  
- Emits events and results to Main Process.  
- **Does not** communicate directly with UI or access local storage.  

### 4. Persistence Layer
- Stores and loads session data, configuration, and message history.  
- Provides an abstract interface (methods) for Main Process to read/write data.  
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

---

## Communication Between Layers

The system uses **controlled communication channels**:

Renderer (UI) <---- IPC ----> Main Process <----> WhatsApp Service
|
v
Persistence Layer

**Communication Rules:**

- UI → Main: user actions (send message, select file, pause, configure delay)  
- Main → UI: visual feedback, success/error messages, sending status  
- Main → WhatsApp Service: commands to send messages, authenticate, manage session  
- WhatsApp Service → Main: results, errors, events  
- Main → Persistence: save/load session, configuration, history  
- Persistence → Main: return stored data  

> No layer bypasses these channels to communicate directly with another layer.

---

## Project Folder Structure

src/
├─ main/
│ ├─ main.js # Main Process entry point
│ ├─ ipc/
│ │ └─ messageHandlers.js # Event handlers for IPC
│ ├─ services/
│ │ └─ whatsapp.service.js # Encapsulates whatsapp-web.js interactions
│ └─ persistence/
│ └─ storage.js # Abstract data access (JSON/SQLite/LowDB)
├─ renderer/
│ ├─ index.html # UI markup
│ ├─ ui.js # UI logic
│ └─ styles.css # UI styling
└─ shared/
└─ constants.js # Global constants


- Each folder reflects a **layer in the architecture**  
- Facilitates maintainability, testing, and scalability  

---

## Conceptual Diagram
User <--> Renderer (UI) <--> Main Process <--> WhatsApp Service
|
v
Persistence Layer

**Flow Example (Send Message):**

1. User types message and phone number in UI  
2. Renderer sends event to Main Process via IPC  
3. Main Process validates input and enforces sequential sending & delay  
4. Main Process calls WhatsApp Service to send message  
5. WhatsApp Service sends the message and returns result to Main Process  
6. Main Process updates UI with success/error  
7. Main Process stores message history and session in Persistence Layer  

---

## Stage Closure

- This architecture document **fully covers all user stories and system requirements**.  
- All future development must follow this design to maintain consistency.  
- The system is now **ready to proceed to setup, diagrams, and implementation**.

---