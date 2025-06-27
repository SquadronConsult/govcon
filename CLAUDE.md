# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Bureaucratic Mountains and Valleys of Death" - A satirical web-based board game that parodies defense acquisition challenges through a Chutes and Ladders-style gameplay.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Start production server
npm start
```

## Architecture

### Technology Stack
- Pure HTML/CSS/JavaScript (no frameworks for maximum compatibility)
- Vercel-ready static deployment
- PWA support with offline capabilities

### File Structure
- `index.html` - Game UI with board grid, player controls, and game status
- `styles.css` - Military-industrial themed styling with 3D elevation effects
- `script.js` - Game logic including turn management, movement, and special squares
- `manifest.json` - PWA configuration for installable app
- `vercel.json` - Deployment configuration

### Key Game Mechanics
- 10x10 board (squares 1-100) with snake pattern movement
- Elevation zones: valleys (1-20, 41-60) and mountains (21-40, 61-80, 81-100)
- Mountains (ladders): 15→35, 28→52, 43→67, 72→91
- Valleys (chutes): 87→24, 78→45, 65→18, 56→12, 32→8
- 2-4 player support with turn-based gameplay
- LocalStorage for game state persistence

### Design Patterns
- Modular JavaScript with clear separation of concerns
- CSS 3D transforms for visual elevation effects
- Responsive design with mobile touch support
- Smooth animations for piece movement and special square transitions

## Development Guidelines

1. Maintain the satirical theme - all additions should reference real defense acquisition pain points
2. Keep it framework-free for maximum deployment compatibility
3. Test on mobile devices - touch controls are essential
4. Preserve game state in localStorage after every move
5. All special squares should have both visual indicators and text labels