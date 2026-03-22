# Mental Health Crisis Companion

A full-stack AI-powered mental health support system providing immediate, empathetic crisis intervention and professional resource connection.

## 🚀 Features

- **24/7 AI-Powered Support**: Empathetic conversations using Claude AI
- **Multi-layer Risk Detection**: Advanced NLP for crisis identification (Levels 0-3)
- **Emergency Response**: Automatic crisis protocol with geolocation facility mapping
- **Voice Support**: Speech-to-text and text-to-speech for accessibility
- **User Accounts**: Secure authentication with JWT, session history tracking
- **Anonymous Mode**: Complete privacy with no data storage
- **Resource Database**: National and local crisis resources

## 🏗️ Architecture

### Backend (Flask + PostgreSQL)
- RESTful API with JWT authentication
- PostgreSQL database with SQLAlchemy ORM
- Redis for caching and task queuing
- Celery for async tasks (email, notifications)
- Advanced NLP with spaCy and transformers
- Crisis detection engine with multi-layer analysis

### Frontend (React + Vite)
- Responsive SPA with component architecture
- Real-time chat interface
- Voice input/output via Web Speech API
- Interactive crisis map with OpenStreetMap
- Progressive Web App (PWA) support

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Anthropic API key

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/mental-health-crisis-companion.git
cd mental-health-crisis-companion