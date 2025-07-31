# Eco-Point Application

## Overview
An ecological points system application that allows users to track food waste reduction and earn points. Originally built with Firebase authentication and data storage, now migrated to work in the Replit environment.

## Project Architecture
- **Frontend**: React with TypeScript, using Wouter for routing
- **Backend**: Express.js server with in-memory storage (can be configured for database)
- **Authentication**: Custom mock authentication system for development
- **Styling**: Tailwind CSS with shadcn/ui components

## Key Features
- User authentication (login/register)
- Point tracking system for eco-friendly actions
- Receipt scanning functionality (OCR)
- Activity history tracking
- Ranking system based on points earned

## Recent Changes
- 2025-01-31: Migrated from Bolt to Replit
- 2025-01-31: Installed Firebase dependencies for compatibility
- 2025-01-31: Set up project structure following Replit fullstack patterns
- 2025-01-31: Fixed OCR functionality using Google Vision API
- 2025-01-31: Added server-side OCR processing with multer
- 2025-01-31: Added proper error handling for Vision API setup
- 2025-01-31: Added profile viewing and editing functionality with image upload
- 2025-01-31: Improved navigation UI by removing background fills for active states

## Current Status
- Migration completed
- OCR requires Google Vision API to be enabled in Google Cloud Console
- All dependencies installed and configured
- Ready for full functionality once Vision API is enabled

## User Preferences
- Application is primarily in Japanese
- Eco-friendly focus with point-based gamification
- Modern UI with green theme
- Clean navigation design without background fills for active states

## Technical Notes
- Uses development mock authentication in client-side storage
- Firebase config present but can run without Firebase in dev mode
- OCR service for receipt scanning capabilities