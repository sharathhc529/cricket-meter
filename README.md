# 🏏 CricMeter — Advanced Cricketer Strength & Metrics Engine

> An interactive, 20-parameter cricketer capability evaluation engine with dynamic Skill Radar charts, 8-zone Batting Wagon Wheels, Pressure & Extras Discipline meters, and full JSON database sync.

[![React](https://img.shields.io/badge/React-19.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 Overview

**CricMeter** calculates a cricketer's complete strength profile across 20 granular dimensions spanning batting power, bowling weapons, fielding athleticism, match temperament, clutch pressure handling, and field sector dominance.

Whether assessing international superstars or scouting grassroots talent, CricMeter renders a holistic capability rating, automated archetype classification, and visual charts.

---

## 🚀 Key Features

### 1. 🏏 20-Parameter Granular Assessment
Evaluates cricketers across five core pillars:

- **🏏 Batting Strength (5 parameters)**:
  - `Power of Batsman`: Raw hitting force, bat speed & lofted power
  - `Hitting Boundaries`: Frequency & ability to consistently find/clear the rope
  - `Timing & Placement`: Sweet-spot ball striking, gap-finding precision & shot elegance
  - `Pace & Bouncer Mastery`: Dominance against 140+ km/h express pace, bouncers & seam
  - `Spin & Turning Ball Play`: Footwork against spin, sweeps, reading drift & googly

- **🎯 Bowling Strength (5 parameters)**:
  - `Power of Bowling Strength`: Weapon potency (raw pace/bounce or sharp spin turn/drift)
  - `Bowling Accuracy & Control`: Line, length execution & dot-ball pressure squeeze
  - `Wicket-Taking Instinct`: Breakthrough specialist knack to break big partnerships
  - `Extras Control Under Pressure`: Discipline when under pressure (controlling wides & no-balls)
  - `Death Overs Mastery`: Toe-crushing yorker execution, wide yorkers & slower deception

- **🧤 Fielding & Athleticism (4 parameters)**:
  - `Catching Strength & Safe Hands`: Slip catching, boundary high-balls & reflex catches
  - `Ground Fielding & Agility`: Anticipation, diving stops, slides & boundary saves
  - `Throwing Bullet Arm`: Flat bullet arm from the deep & pinpoint direct-hit accuracy
  - `On-Field Good Runner`: Speed between 22 yards, acceleration, and converting 1s to 2s

- **🧠 Mental Resilience & Clutch (4 parameters)**:
  - `Confidence Level`: Self-belief, commanding body language & form bounce-back
  - `Clutch / Pressure Handling`: Nerve in tight chases, super overs & tournament knockouts
  - `Cricket IQ & Game Awareness`: Field reading, bowling changes, pacing innings & match math
  - `Stamina & Athletic Fitness`: Endurance over long spells and innings in scorching conditions

- **⚖️ Reliability & Team Value (2 parameters)**:
  - `Match-to-Match Consistency`: High performance floor vs volatile boom-or-bust swings
  - `Leadership & Tactical Instinct`: Tactical field placements, mentoring & lifting morale

---

### 2. 🛡️ Pressure Extras Meter ("Does He Give Extras with Pressure?")
Directly calculates the cricketer's probability of bowling extras (wides and front-foot no-balls) under high-pressure scenarios:
- **Negligible (Ice Cold)**: High nerve control; never gifts freebies in death overs.
- **Low (Controlled)**: Consistent discipline with rare lapses under fierce batting onslaughts.
- **Moderate (Vulnerable)**: Prone to slipping wide lines or overstepping when target equations tighten.
- **High (Leaks Extras)**: Significant vulnerability to losing line/length under relentless pressure.

---

### 3. 🏟️ Batting Wagon Wheel & Field Sector Strengths
Answers: *"Which side of the field is his strength in batting?"*
- **8-Quadrant Cricket Oval**:
  - `Covers & Extra Cover` (Off)
  - `Point & Backward Point` (Off)
  - `Third Man & Gully` (Off)
  - `Long-Off & Mid-Off` (Off)
  - `Long-On & Mid-On` (Leg)
  - `Mid-Wicket & Cow Corner` (Leg)
  - `Square Leg & Pull Zone` (Leg)
  - `Fine Leg & Behind Square` (Leg)
- **Automatic Dominance Verdict**: Calculates exact Off-Side vs. Leg-Side percentage and identifies primary power scoring zones vs targeting holes.

---

### 4. 🕸️ 6-Dimensional Skill Radar Chart
Custom, responsive SVG Spider / Radar Chart that plots:
1. Batting Power & Strike
2. Bowling Potency & Control
3. Fielding & Reflexes
4. Running Between Wickets
5. Clutch / Pressure Nerve
6. Game IQ & Discipline

---

### 5. ⚔️ Head-to-Head Cricketer Comparison
Compare any two cricketers side-by-side:
- Overlaid dual radar polygons (Primary in Emerald vs Challenger in Amber)
- Category-by-category scorecard comparison
- Automatic victory tally (e.g. *Kohli wins 12 categories, Bumrah wins 8*)

---

### 6. 💾 JSON Database Sync & Offline Storage
- **Export Database**: One-click download of the complete roster to formatted `.json`.
- **Import JSON**: Upload files or paste JSON to merge or restore player rosters.
- **LocalStorage Sync**: Edits, custom cricketers, and parameter tuning persist automatically.
- **Preloaded Roster**: Includes tuned profiles for Virat Kohli, Rohit Sharma, Jasprit Bumrah, Ben Stokes, MS Dhoni, Rashid Khan, and AB de Villiers.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS v4 (Cricket Stadium Dark UI)
- **Icons**: Lucide React
- **Build Tool**: Vite 8.3
- **Visualizations**: Responsive Custom SVG Canvas (Radar chart & Cricket Ground Wagon Wheel)

---

## 💻 Local Setup & Development

```bash
# Clone the repository
git clone https://github.com/sharathhc529/cricket-meter.git
cd cricket-meter

# Install dependencies
npm install

# Run the local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

MIT © [Sharath](https://github.com/sharathhc529)
