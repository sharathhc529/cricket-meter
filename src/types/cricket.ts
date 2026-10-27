export type PlayerRole =
  | 'pure_batsman'
  | 'batting_allrounder'
  | 'bowling_allrounder'
  | 'pure_bowler'
  | 'wicketkeeper_batsman';

export type BattingHand = 'Right-hand bat' | 'Left-hand bat';

export type BowlingStyle =
  | 'Right-arm fast'
  | 'Left-arm fast'
  | 'Right-arm fast-medium'
  | 'Left-arm fast-medium'
  | 'Right-arm off-break'
  | 'Right-arm leg-break'
  | 'Left-arm orthodox'
  | 'Left-arm unorthodox'
  | 'Does not bowl';

export interface FieldSectors {
  thirdMan: number;      // 0-100 (Fine gully, third man)
  point: number;         // 0-100 (Backward point, cover point)
  cover: number;         // 0-100 (Cover, extra cover)
  longOff: number;       // 0-100 (Mid-off, long-off)
  longOn: number;        // 0-100 (Mid-on, long-on)
  midWicket: number;     // 0-100 (Mid-wicket, cow corner)
  squareLeg: number;     // 0-100 (Square leg, backward square)
  fineLeg: number;       // 0-100 (Fine leg, hook/pull)
}

export interface PlayerParameters {
  // 🏏 Batting Strength (5 params)
  battingPower: number;               // Raw hitting power & bat speed (0-100)
  boundaryHitting: number;            // Frequency & ability to clear the rope (0-100)
  battingTiming: number;              // Placement, stroke elegance & timing (0-100)
  pacePlayingAbility: number;         // Ability against 140+ express pace & bouncers (0-100)
  spinPlayingAbility: number;         // Footwork, sweeps & strike against spin (0-100)

  // 🎯 Bowling Strength (5 params)
  bowlingPaceSpin: number;            // Weapon strength: express pace or spin turn/drift (0-100)
  bowlingAccuracy: number;            // Line, length & dot ball capability (0-100)
  wicketTakingAbility: number;        // Breakthrough instinct & strike capability (0-100)
  extrasControlUnderPressure: number; // Extras control when under pressure (100 = 0 extras, 0 = high extras)
  deathOversExecution: number;        // Yorker precision, variations & death economy (0-100)

  // 🧤 Fielding & Athleticism (4 params)
  catchingReliability: number;        // Outfield, slip & high-pressure catching (0-100)
  groundFielding: number;             // Anticipation, diving stops & boundary saves (0-100)
  throwingAccuracyPower: number;      // Flat bullet arm & direct-hit accuracy (0-100)
  runningBetweenWickets: number;      // Sprint speed & quick conversion of 1s to 2s (0-100)

  // 🧠 Mental Resilience & Temperament (4 params)
  confidenceLevel: number;            // Self-belief, body language & form bounce-back (0-100)
  pressureHandlingClutch: number;     // Clutch finishing & crisis management (0-100)
  matchAwarenessIQ: number;           // Game situation reading & tactical smarts (0-100)
  staminaEndurance: number;           // Long spells/innings in harsh heat (0-100)

  // ⚖️ Reliability & Team Impact (2 params)
  consistencyRating: number;          // Match-to-match consistency vs volatility (0-100)
  captaincyLeadership: number;        // Field setting, mentoring & leadership energy (0-100)
}

export interface CricketerProfile {
  id: string;
  name: string;
  country: string;
  role: PlayerRole;
  battingHand: BattingHand;
  bowlingStyle: BowlingStyle;
  jerseyNumber?: number;
  avatarUrl?: string;
  bio?: string;
  group?: string;
  isArchived?: boolean;
  tags?: string[];
  parameters: PlayerParameters;
  fieldSectors: FieldSectors;
}

export interface CalculatedStrengthMetrics {
  overallRating: number;              // 0-100
  tierName: string;                   // 'World-Class Elite' | 'Match Winner' | 'Key Performer' | 'Solid Pro' | 'Developing'
  tierColor: string;
  archetype: string;                  // e.g. "Clutch Chase Master", "Death Yorker Assassin"
  
  // Category sub-ratings (0-100)
  battingScore: number;
  bowlingScore: number;
  fieldingScore: number;
  athleticismScore: number;
  mentalClutchScore: number;

  // Pressure & Extras analysis
  extrasPressureRiskLabel: 'Negligible (Ice Cold)' | 'Low (Controlled)' | 'Moderate (Vulnerable)' | 'High (Leaks Extras)';
  extrasPressureRiskScore: number; // 0-100 where higher means safe/disciplined
  extrasAnalysisText: string;

  // Field Side Analysis
  offSidePercentage: number;
  legSidePercentage: number;
  fieldStrengthSide: 'Off-Side Dominant' | 'Leg-Side Dominant' | '360° Balanced';
  strongestSector: { key: keyof FieldSectors; name: string; value: number };
  weakestSector: { key: keyof FieldSectors; name: string; value: number };

  // Strengths & Weaknesses
  topStrengths: { paramKey: keyof PlayerParameters; title: string; value: number; icon: string }[];
  areasToImprove: { paramKey: keyof PlayerParameters; title: string; value: number; tip: string }[];

  // Match Simulation Indices
  chaseMasterIndex: number;          // 0-100
  powerplayDominance: number;        // 0-100
  deathOversImpact: number;          // 0-100
  clutchFactor: number;              // 0-100
}

export interface ParameterMetadata {
  key: keyof PlayerParameters;
  label: string;
  category: 'batting' | 'bowling' | 'fielding' | 'mental' | 'reliability';
  description: string;
  iconName: string;
}
