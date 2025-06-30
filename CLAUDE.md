# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Bureaucratic Mountains and Valleys of Death" - A satirical web-based board game that parodies defense acquisition challenges through a Chutes and Ladders-style gameplay.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run type-check

# Run linting
npm run lint
```

## Architecture

### Technology Stack
- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe code throughout
- **React + SVG** - Crisp, scalable 2D board graphics
- **Framer Motion** - Smooth player piece animations
- **CSS3** - Military-industrial themed styling
- PWA support with offline capabilities
- Vercel-ready deployment

### File Structure
- `pages/` - Next.js pages (index.tsx, _app.tsx)
- `components/` - React components (SVGBoard, GameControls, etc.)
- `hooks/` - Custom React hooks (useGameLogic)
- `types/` - TypeScript type definitions
- `constants/` - Game configuration and constants
- `styles/` - CSS styling
- `public/` - Static assets (manifest.json, etc.)

### Key Game Mechanics
- 10x10 board (squares 1-100) with snake pattern movement
- Elevation zones: valleys (1-20, 41-60) and mountains (21-40, 61-80, 81-100)
- Mountains (ladders): Sole Source Justification, Congressional Earmark, Pentagon Champion, etc.
- Valleys (chutes): Protest Filed, The CR Hit, Test Failure, DCAA Audit, etc.
- 2-4 player support with turn-based gameplay
- LocalStorage for game state persistence
- **NEW:** Smooth Framer Motion animations for player movement

### Design Patterns
- **Modern React Architecture**: Custom hooks, TypeScript interfaces, component composition
- **SVG Graphics**: Crisp, scalable board with gradients and paths
- **Reactive State Management**: useGameLogic hook with game state persistence
- **Responsive Design**: Mobile-first with touch support
- **Smooth Animations**: Framer Motion for piece movement and special square transitions
- **Type Safety**: Full TypeScript coverage for maintainable code

## Development Guidelines

1. Maintain the satirical theme - all additions should reference real defense acquisition pain points
2. Keep it framework-free for maximum deployment compatibility
3. Test on mobile devices - touch controls are essential
4. Preserve game state in localStorage after every move
5. All special squares should have both visual indicators and text labels