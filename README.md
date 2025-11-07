# LinkedIn Automation Extension

A Chrome extension that automates LinkedIn profile scraping and feed engagement, with a Node.js backend for data persistence.

## Overview

This extension provides two main features:
- **Profile Scraper** - Extracts profile data (name, bio, location, followers, connections, about)
- **Feed Automator** - Automates likes and comments on LinkedIn feed posts

## Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on `http://localhost:3000`

### 2. Chrome Extension
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder

## Usage

### Profile Scraping
1. Ensure backend server is running
2. Log into LinkedIn
3. Click extension icon
4. Paste LinkedIn profile URLs (one per line)
5. Click "Start Scraping"

### Feed Automation
1. Log into LinkedIn
2. Click extension icon
3. Set like count (0-50) and comment count (0-20)
4. Click "Start Engagement"

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profiles` | Create/update profile |
| `GET` | `/api/profiles` | Retrieve all profiles |
| `DELETE` | `/api/profiles/:id` | Delete specific profile |
| `DELETE` | `/api/profiles/all` | Delete all profiles |

## Technology Stack

- **Frontend**: Chrome Extension (Manifest V3), HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Sequelize ORM
- **APIs**: Chrome Extension APIs (tabs, scripting, notifications)

## Project Structure

```
├── manifest.json          # Extension configuration
├── popup.html/css/js      # Extension UI
├── background.js          # Service worker
├── contentScript.js       # Profile scraper
├── feedEngagement.js      # Feed automation
└── backend/
    ├── app.js             # Express server
    ├── models/            # Database models
    └── routes/            # API routes
```

## Notes

- Requires active LinkedIn session
- Educational purposes only
- Implements rate limiting and delays to respect platform policies

---

**Built for Banao Interview Task**
