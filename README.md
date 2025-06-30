# Bureaucratic Mountains and Valleys of Death

A satirical **Next.js + TypeScript** board game that parodies the challenges of military procurement through the lens of Chutes and Ladders.

🎮 **[Play Now](http://localhost:3000)** (when running locally)

## 🎮 Game Overview

Navigate your defense contractor or program manager through the treacherous terrain of military procurement, climbing bureaucratic mountains of success and avoiding valleys of death that can set your project back years.

### Game Features
- **Modern Tech Stack**: Next.js 14, TypeScript, React
- **Crisp 2D Graphics**: SVG board with gradients and smooth animations
- **Framer Motion**: Silky smooth player piece animations
- **2-4 player support** with turn-based gameplay
- **10x10 board** with realistic elevation zones
- **Satirical Special Squares**: Real defense acquisition pain points
- **Type-Safe Code**: Full TypeScript coverage
- **Game State Persistence**: Never lose your progress
- **Mobile-responsive design** with touch support
- **PWA support** for offline play

## 🚀 Quick Start

### Deploy to Vercel

1. Fork or clone this repository
2. Connect to Vercel
3. Deploy with zero configuration

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000

# Build for production  
npm run build

# Run type checking
npm run type-check
```

## 🎯 How to Play

1. Select 2-4 players to begin
2. Roll the dice to move forward
3. Land on a **Bureaucratic Mountain** to climb up:
   - Sole Source Justification (1→38)
   - Congressional Earmark (4→14)  
   - Pentagon Champion (28→84)
   - Finally got your ATO (71→91)
   - Presidential Priority (80→100)
4. Avoid the **Valleys of Death** that send you tumbling:
   - Protest Filed (16→6)
   - The CR Hit (47→26)
   - Test Failure (49→11)
   - Incumbent stole your Tech (62→19)
   - DCAA Audit (98→78)
5. First to reach square 100 achieves deployment!

## 🏔️ Board Zones

- **Squares 1-20**: Concept/R&D Valley (starting zone)
- **Squares 21-40**: First Bureaucratic Mountain
- **Squares 41-60**: Funding Valley of Death
- **Squares 61-80**: Second Bureaucratic Mountain (highest peak)
- **Squares 81-100**: Deployment Plateau (goal zone)

## 🛠️ Technical Stack

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe code throughout  
- **React + SVG** - Crisp, scalable 2D board graphics
- **Framer Motion** - Smooth player piece animations
- **CSS3** - Military-industrial themed styling
- **LocalStorage** - Game state persistence
- **PWA-ready** with offline support

## 📁 Project Structure

```
mountains/
├── pages/           # Next.js pages (index.tsx, _app.tsx)
├── components/      # React components (SVGBoard, GameControls)
├── hooks/           # Custom React hooks (useGameLogic)  
├── types/           # TypeScript type definitions
├── constants/       # Game configuration and constants
├── styles/          # CSS styling (globals.css)
├── public/          # Static assets (manifest.json)
├── tsconfig.json    # TypeScript configuration
├── next.config.js   # Next.js configuration
└── package.json     # Dependencies and scripts
```

## 🎨 Design Philosophy

The game satirizes real defense acquisition challenges through visual metaphors:
- **SVG Mountains**: Clean geometric peaks representing bureaucratic victories
- **Curved Valleys**: Smooth chutes showing the inevitable fall from grace
- **Elevation Zones**: Color-coded terrain from valley floors to deployment plateaus
- **Military-industrial aesthetic**: Dark color scheme with bureaucratic undertones
- **Authentic Names**: Real defense acquisition pain points as game mechanics

## 📜 License

MIT License - Feel free to modify and deploy your own version of bureaucratic chaos!

## 🤝 Contributing

Found a new bureaucratic obstacle? Submit a PR with your suggested mountain or valley!

---

*Remember: In defense acquisition, sometimes the only way up is through a congressional hearing.*