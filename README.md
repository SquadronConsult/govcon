# Bureaucratic Mountains and Valleys of Death

A satirical defense acquisition board game that parodies the challenges of military procurement through the lens of Chutes and Ladders.

## 🎮 Game Overview

Navigate your defense contractor or program manager through the treacherous terrain of military procurement, climbing bureaucratic mountains of success and avoiding valleys of death that can set your project back years.

### Game Features
- 2-4 player support
- 10x10 board with elevation zones
- Strategic mountains (ladders) and devastating valleys (chutes)
- Local game state persistence
- Mobile-responsive design
- PWA support for offline play

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
```

## 🎯 How to Play

1. Select 2-4 players to begin
2. Roll the dice to move forward
3. Land on a **Bureaucratic Mountain** to climb up:
   - Congressional Champion (15→35)
   - Pentagon Endorsement (28→52)
   - Industry Partnership (43→67)
   - Successful Test (72→91)
4. Avoid the **Valleys of Death** that send you tumbling:
   - Budget Cut (87→24)
   - Requirements Change (78→45)
   - Competing Priority (65→18)
   - Failed Milestone Review (56→12)
   - Compliance Issue (32→8)
5. First to reach square 100 achieves deployment!

## 🏔️ Board Zones

- **Squares 1-20**: Concept/R&D Valley (starting zone)
- **Squares 21-40**: First Bureaucratic Mountain
- **Squares 41-60**: Funding Valley of Death
- **Squares 61-80**: Second Bureaucratic Mountain (highest peak)
- **Squares 81-100**: Deployment Plateau (goal zone)

## 🛠️ Technical Details

- Pure HTML/CSS/JavaScript (no frameworks)
- CSS 3D transforms for elevation effects
- Smooth animations for piece movement
- LocalStorage for game persistence
- PWA-ready with offline support

## 📁 Project Structure

```
mountains/
├── index.html      # Game interface
├── styles.css      # Visual design
├── script.js       # Game logic
├── manifest.json   # PWA configuration
├── vercel.json     # Deployment config
└── package.json    # Project metadata
```

## 🎨 Design Philosophy

The game satirizes real defense acquisition challenges through visual metaphors:
- Mountains made of stacked paperwork and filing cabinets
- Valleys littered with abandoned prototypes
- Military-industrial aesthetic with bureaucratic undertones

## 📜 License

MIT License - Feel free to modify and deploy your own version of bureaucratic chaos!

## 🤝 Contributing

Found a new bureaucratic obstacle? Submit a PR with your suggested mountain or valley!

---

*Remember: In defense acquisition, sometimes the only way up is through a congressional hearing.*