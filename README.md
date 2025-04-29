# AutoShed : Smart Presentation Scheduling System


  
  ![AutoShed Logo](https://via.placeholder.com/ scheduling from chaos to clarity*
  
  [![Status](https://img.shields.io/badgebadgeQuick Overview

AutoShed is a comprehensive smart presentation scheduling system designed specifically for higher educational institutions. The system revolutionizes traditional manual scheduling processes by introducing a logical, automated approach to coordinating academic presentations.

> 💡 **Consider adding an animated GIF here showing the scheduling process in action**[2][6]

## 📋 Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Core Features](#core-features)
- [Technical Architecture](#technical-architecture)
- [Project Impact](#project-impact)
- [Development Approach](#development-approach)
- [Future Recommendations](#future-recommendations)
- [Team Members](#team-members)

## 🔍 The Problem

Academic institutions frequently struggle with:

- 📅 Inefficient manual scheduling processes
- 🗣️ Communication gaps between stakeholders
- 🏢 Underutilization of available resources
- ⏱️ Time-consuming administrative tasks
- ⚠️ Scheduling conflicts and overlaps

> 💡 **Consider adding an animated GIF here demonstrating the confusion of manual scheduling**[2][6]

## 💡 Our Solution

AutoShed transforms presentation scheduling through an intelligent, automated system that matches availability, prevents conflicts, and keeps all stakeholders informed.

> 💡 **Consider adding an animated GIF or SVG here showing the AutoShed interface in action**[3]

## ✨ Core Features

### Role-Based Access Control

| Role | Responsibilities |
|------|-----------------|
| **Administrators** | Manage system users and time slots |
| **Lecturers** | Submit availability and manage assigned presentations |
| **Examiners** | Submit availability and manage assigned presentations |
| **LICs** | Schedule presentations and handle reschedule requests |

### Availability Matching Logic

- 🧠 Automated matching of lecturer and examiner availability
- 🛡️ Conflict prevention through intelligent scheduling algorithms
- 📊 Optimal resource allocation

> 💡 **Consider adding an animated diagram showing how the matching algorithm works**[2]

### Multi-Channel Notifications

- 📧 Email notifications with calendar invites
- 📱 WhatsApp integration for immediate updates
- ⚡ Real-time communication for schedule changes

## 🔧 Technical Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │      │   Backend   │      │  Database   │
│   React.js  │◄────►│   Node.js   │◄────►│    MySQL    │
└─────────────┘      └─────────────┘      └─────────────┘
                            ▲
                            │
                     ┌──────┴──────┐
                     │ Integrations│
                     │ Email & WA  │
                     └─────────────┘
```

- **Frontend**: React.js with responsive UI design
- **Backend**: Node.js for robust server-side processing
- **Database**: MySQL for data persistence
- **Integrations**: Email API and WhatsApp Business API

## 📈 Project Impact

Implementation testing has demonstrated:

- ⏱️ Reduction in scheduling time from days to hours
- 🚫 Elimination of double-bookings and conflicts
- 🔄 Streamlined communication between all stakeholders
- 📈 Improved resource utilization
- 😊 Enhanced user satisfaction through automated notifications

> 💡 **Consider adding an animated chart showing the improvements in time savings**[2]

## 🔄 Development Approach

The system is being built in an agile framework with two sprints:

### Sprint 1 Focus
- 🔐 User authentication and dashboard interfaces
- 📝 Core availability submission functionality
- 🔔 Initial notification system setup
- ⏲️ Time slot management

### Sprint 2 Focus
- ✅ Schedule confirmation workflows
- 🔔 Advanced notification features
- 📊 Reporting and analytics
- 🔄 Conflict resolution mechanisms

## 🔮 Future Recommendations

While initial results are promising, comprehensive user acceptance testing with actual stakeholders is recommended before full deployment to ensure the system meets all user needs and expectations.

AutoShed represents a significant advancement in academic scheduling technology, offering solutions to longstanding challenges in higher education administration while enhancing stakeholder satisfaction through improved scheduling processes and communication mechanisms.

## 👥 Team Members


  
    
      
      
      Ellepola E. W. P. W. M. R. S. K.
      
      IT22300164
    
    
      
      
      Bandaranayeke E.M.T.T.
      
      IT22590930
    
    
      
      
      Aththanayake A.M.P.M.B
      
      IT22608536
    
  


## 📋 Member Contributions

### Ellepola E. W. P. W. M. R. S. K. (IT22300164)
- 👨‍💻 Lecturer authentication and dashboard UI
- 👁️ View scheduled presentations for lecturers
- 📝 Availability submission form for lecturers
- 🔄 Update/delete availability functionality
- 📅 Scheduling interface (collaborative)
- 📧 Email notification system with calendar invites
- 📊 Schedule report generation

> 💡 **Consider adding a GIF demo of the lecturer interface**[6]

### Bandaranayeke E.M.T.T. (IT22590930)
- 👨‍💻 Examiner authentication and dashboard UI
- 👁️ View scheduled presentations for examiners
- 📝 Availability submission form for examiners
- 🔄 Update/delete availability functionality
- 👨‍🏫 LIC dashboard and authentication
- 📱 WhatsApp notification integration
- 📊 Schedule report generation

> 💡 **Consider adding a GIF demo of the examiner interface**[6]

### Aththanayake A.M.P.M.B (IT22608536)
- 👨‍💻 Admin authentication and dashboard UI
- 👥 User management (CRUD operations)
- ⏱️ Time slot management interface
- 📊 Report generation and analytics
- 📈 Chart implementation

> 💡 **Consider adding a GIF demo of the admin interface**[6]

---


  Made with ❤️ by Team 3Y2S_WE_IT_199 - 2025
