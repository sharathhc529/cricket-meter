import {
  CricketerProfile,
  CalculatedStrengthMetrics,
  FieldSectors,
  ParameterMetadata,
  PlayerParameters,
  PlayerRole,
} from '../types/cricket';

export const PARAMETER_METADATA: ParameterMetadata[] = [
  // 🏏 Batting
  {
    key: 'battingPower',
    label: 'Power of Batsman',
    category: 'batting',
    description: 'Raw hitting force, bat speed, muscle power & distance on lofted shots',
    iconName: 'Zap',
  },
  {
    key: 'boundaryHitting',
    label: 'Hitting Boundaries',
    category: 'batting',
    description: 'Frequency of striking 4s and 6s effortlessly against all bowling lengths',
    iconName: 'Flame',
  },
  {
    key: 'battingTiming',
    label: 'Timing & Placement',
    category: 'batting',
    description: 'Sweet-spot ball striking, gap-finding precision & shot elegance',
    iconName: 'Target',
  },
  {
    key: 'pacePlayingAbility',
    label: 'Pace & Bouncer Mastery',
    category: 'batting',
    description: 'Handling 140+ km/h express thunderbolts, bouncers & seam movement',
    iconName: 'Gauge',
  },
  {
    key: 'spinPlayingAbility',
    label: 'Spin & Turning Ball Play',
    category: 'batting',
    description: 'Footwork against spinners, sweep shots, reading googly & flight',
    iconName: 'Compass',
  },

  // 🎯 Bowling
  {
    key: 'bowlingPaceSpin',
    label: 'Power of Bowling Strength',
    category: 'bowling',
    description: 'Weapon potency: raw speed/bounce or sharp spin turn, drift & dip',
    iconName: 'Rocket',
  },
  {
    key: 'bowlingAccuracy',
    label: 'Bowling Accuracy & Control',
    category: 'bowling',
    description: 'Consistent line and length execution, dot-ball pressure build-up',
    iconName: 'Crosshair',
  },
  {
    key: 'wicketTakingAbility',
    label: 'Wicket-Taking Instinct',
    category: 'bowling',
    description: 'Breakthrough specialist knack to dismiss top-order set batsmen',
    iconName: 'Trophy',
  },
  {
    key: 'extrasControlUnderPressure',
    label: 'Extras Under Pressure Control',
    category: 'bowling',
    description: 'Discipline in death/pressure overs (100 = 0 wides/no-balls, low = leaks extras)',
    iconName: 'ShieldAlert',
  },
  {
    key: 'deathOversExecution',
    label: 'Death Overs Mastery',
    category: 'bowling',
    description: 'Toe-crushing yorker precision, wide yorkers & deceptive slower balls',
    iconName: 'Activity',
  },

  // 🧤 Fielding & Athleticism
  {
    key: 'catchingReliability',
    label: 'Catching Strength & Safe Hands',
    category: 'fielding',
    description: 'Slips, boundary high-skiers, reflex close-in & match-winning catches',
    iconName: 'Sparkles',
  },
  {
    key: 'groundFielding',
    label: 'Ground Fielding & Agility',
    category: 'fielding',
    description: 'Anticipation, full-stretch diving stops, slides & saving crucial boundaries',
    iconName: 'Shield',
  },
  {
    key: 'throwingAccuracyPower',
    label: 'Throwing Bullet Arm',
    category: 'fielding',
    description: 'Flat, powerful arm from deep boundary and pinpoint direct-hit accuracy',
    iconName: 'Send',
  },
  {
    key: 'runningBetweenWickets',
    label: 'On-Field Good Runner',
    category: 'fielding',
    description: 'Speed between the 22 yards, explosive acceleration, turning & converting 1s to 2s',
    iconName: 'Footprints',
  },

  // 🧠 Mental Resilience
  {
    key: 'confidenceLevel',
    label: 'Confidence Level',
    category: 'mental',
    description: 'Unshakable self-belief, dominant body language & bouncing back from slumps',
    iconName: 'Smile',
  },
  {
    key: 'pressureHandlingClutch',
    label: 'Clutch / Pressure Handling',
    category: 'mental',
    description: 'Performance in nerve-wracking run chases, super overs & tournament knockouts',
    iconName: 'HeartHandshake',
  },
  {
    key: 'matchAwarenessIQ',
    label: 'Cricket IQ & Game Awareness',
    category: 'mental',
    description: 'Field reading, anticipating bowler tactics, pacing innings & situational math',
    iconName: 'Brain',
  },
  {
    key: 'staminaEndurance',
    label: 'Stamina & Athletic Fitness',
    category: 'mental',
    description: 'Sustained energy over 100 overs, long spells in scorching subcontinental sun',
    iconName: 'BatteryCharging',
  },

  // ⚖️ Reliability & Team Role
  {
    key: 'consistencyRating',
    label: 'Match-to-Match Consistency',
    category: 'reliability',
    description: 'High floor & reliable output every match vs boom-or-bust volatile swings',
    iconName: 'TrendingUp',
  },
  {
    key: 'captaincyLeadership',
    label: 'Leadership & Tactical Instinct',
    category: 'reliability',
    description: 'Tactical field placements, bowling changes & firing up team morale',
    iconName: 'Crown',
  },
];

export const FIELD_SECTOR_LABELS: Record<keyof FieldSectors, { name: string; side: 'off' | 'leg'; angle: number }> = {
  longOff: { name: 'Long-Off / Mid-Off', side: 'off', angle: 340 },
  cover: { name: 'Covers & Extra Cover', side: 'off', angle: 295 },
  point: { name: 'Point & Backward Point', side: 'off', angle: 250 },
  thirdMan: { name: 'Third Man / Gully', side: 'off', angle: 205 },
  fineLeg: { name: 'Fine Leg & Behind Square', side: 'leg', angle: 155 },
  squareLeg: { name: 'Square Leg & Pull Zone', side: 'leg', angle: 110 },
  midWicket: { name: 'Mid-Wicket & Cow Corner', side: 'leg', angle: 65 },
  longOn: { name: 'Long-On / Mid-On', side: 'leg', angle: 20 },
};

/**
 * Calculates strength metrics, ratings, charts data, and archetypes for a cricketer.
 */
export function calculateStrengthMetrics(player: CricketerProfile): CalculatedStrengthMetrics {
  const p = player.parameters;
  const f = player.fieldSectors;

  // 1. Category Sub-scores (0-100)
  const battingScore = Math.round(
    (p.battingPower * 0.25 +
      p.boundaryHitting * 0.25 +
      p.battingTiming * 0.2 +
      p.pacePlayingAbility * 0.15 +
      p.spinPlayingAbility * 0.15)
  );

  const bowlingScore = Math.round(
    (p.bowlingPaceSpin * 0.25 +
      p.bowlingAccuracy * 0.25 +
      p.wicketTakingAbility * 0.2 +
      p.extrasControlUnderPressure * 0.15 +
      p.deathOversExecution * 0.15)
  );

  const fieldingScore = Math.round(
    (p.catchingReliability * 0.35 +
      p.groundFielding * 0.35 +
      p.throwingAccuracyPower * 0.3)
  );

  const athleticismScore = Math.round(
    (p.runningBetweenWickets * 0.5 +
      p.groundFielding * 0.3 +
      p.staminaEndurance * 0.2)
  );

  const mentalClutchScore = Math.round(
    (p.pressureHandlingClutch * 0.35 +
      p.confidenceLevel * 0.25 +
      p.matchAwarenessIQ * 0.25 +
      p.consistencyRating * 0.15)
  );

  // 2. Role-based Overall Rating (OVR)
  let overallRating = 0;
  switch (player.role) {
    case 'pure_batsman':
      overallRating =
        battingScore * 0.55 +
        mentalClutchScore * 0.20 +
        fieldingScore * 0.13 +
        athleticismScore * 0.07 +
        bowlingScore * 0.05;
      break;

    case 'pure_bowler':
      overallRating =
        bowlingScore * 0.55 +
        mentalClutchScore * 0.20 +
        fieldingScore * 0.13 +
        athleticismScore * 0.07 +
        battingScore * 0.05;
      break;

    case 'batting_allrounder':
      overallRating =
        battingScore * 0.40 +
        bowlingScore * 0.28 +
        mentalClutchScore * 0.16 +
        fieldingScore * 0.10 +
        athleticismScore * 0.06;
      break;

    case 'bowling_allrounder':
      overallRating =
        bowlingScore * 0.40 +
        battingScore * 0.28 +
        mentalClutchScore * 0.16 +
        fieldingScore * 0.10 +
        athleticismScore * 0.06;
      break;

    case 'wicketkeeper_batsman':
      overallRating =
        battingScore * 0.48 +
        fieldingScore * 0.25 +
        mentalClutchScore * 0.17 +
        athleticismScore * 0.08 +
        bowlingScore * 0.02;
      break;
  }

  overallRating = Math.round(Math.min(99, Math.max(30, overallRating)));

  // 3. Tier Name & Tier Color
  let tierName = 'Developing Prospect';
  let tierColor = 'text-slate-400';
  if (overallRating >= 90) {
    tierName = 'World-Class Legend 🌟';
    tierColor = 'text-amber-400';
  } else if (overallRating >= 82) {
    tierName = 'International Match Winner 💎';
    tierColor = 'text-cyan-400';
  } else if (overallRating >= 74) {
    tierName = 'Premier League Star ⚡';
    tierColor = 'text-emerald-400';
  } else if (overallRating >= 65) {
    tierName = 'Solid County/Club Pillar 🛡️';
    tierColor = 'text-blue-400';
  }

  // 4. Extras Under Pressure Analysis (Answers user prompt directly!)
  // Extras risk is influenced by extrasControlUnderPressure and pressureHandlingClutch
  const extrasControlMetric = (p.extrasControlUnderPressure * 0.7 + p.pressureHandlingClutch * 0.3);
  let extrasPressureRiskLabel: CalculatedStrengthMetrics['extrasPressureRiskLabel'];
  let extrasAnalysisText = '';

  if (extrasControlMetric >= 85) {
    extrasPressureRiskLabel = 'Negligible (Ice Cold)';
    extrasAnalysisText = 'Rarely concedes extras under heat. Outstanding nerve; maintains tight discipline even in 20-run final overs.';
  } else if (extrasControlMetric >= 70) {
    extrasPressureRiskLabel = 'Low (Controlled)';
    extrasAnalysisText = 'Generally keeps discipline intact under pressure with occasional stray delivery under extreme batting onslaughts.';
  } else if (extrasControlMetric >= 50) {
    extrasPressureRiskLabel = 'Moderate (Vulnerable)';
    extrasAnalysisText = 'Prone to slipping wide balls or overstepping front-foot no-balls when target equation gets tense.';
  } else {
    extrasPressureRiskLabel = 'High (Leaks Extras)';
    extrasAnalysisText = 'High risk of conceding expensive extras (wides/free-hit no-balls) when batsmen mount relentless pressure.';
  }

  // 5. Field Side Strength Analysis (Wagon Wheel & Batting Field Sectors)
  const offSideSum = (f.cover || 0) + (f.point || 0) + (f.thirdMan || 0) + (f.longOff || 0);
  const legSideSum = (f.midWicket || 0) + (f.squareLeg || 0) + (f.fineLeg || 0) + (f.longOn || 0);
  const totalField = offSideSum + legSideSum || 1;
  const offSidePercentage = Math.round((offSideSum / totalField) * 100);
  const legSidePercentage = 100 - offSidePercentage;

  let fieldStrengthSide: CalculatedStrengthMetrics['fieldStrengthSide'] = '360° Balanced';
  if (offSidePercentage >= 58) {
    fieldStrengthSide = 'Off-Side Dominant';
  } else if (legSidePercentage >= 58) {
    fieldStrengthSide = 'Leg-Side Dominant';
  }

  // Determine strongest & weakest sector
  const sectorEntries = Object.entries(f) as [keyof FieldSectors, number][];
  sectorEntries.sort((a, b) => b[1] - a[1]);
  const strongestKey = sectorEntries[0][0];
  const weakestKey = sectorEntries[sectorEntries.length - 1][0];

  const strongestSector = {
    key: strongestKey,
    name: FIELD_SECTOR_LABELS[strongestKey]?.name || strongestKey,
    value: sectorEntries[0][1],
  };

  const weakestSector = {
    key: weakestKey,
    name: FIELD_SECTOR_LABELS[weakestKey]?.name || weakestKey,
    value: sectorEntries[sectorEntries.length - 1][1],
  };

  // 6. Dynamic Archetype Determination
  let archetype = 'Dynamic All-Round Cricketer';
  if (player.role === 'pure_batsman') {
    if (p.boundaryHitting >= 88 && p.battingPower >= 85) {
      archetype = 'Nuclear Power Hitter & Boundary Demolisher';
    } else if (p.pressureHandlingClutch >= 90 && p.runningBetweenWickets >= 88) {
      archetype = 'Chase Master & Crisis Anchor';
    } else if (p.battingTiming >= 90 && p.pacePlayingAbility >= 88) {
      archetype = 'Classical Masterclass Strokemaker';
    } else {
      archetype = 'Top-Order Run Machine';
    }
  } else if (player.role === 'pure_bowler') {
    if (p.deathOversExecution >= 90 && p.extrasControlUnderPressure >= 85) {
      archetype = 'Death Overs Yorker Assassin';
    } else if (p.bowlingPaceSpin >= 90 && p.wicketTakingAbility >= 88) {
      archetype = 'Express Strike Wicket-Taker';
    } else if (p.bowlingAccuracy >= 90) {
      archetype = 'Disciplined Metronome Pressure Squeezer';
    } else {
      archetype = 'Frontline Strike Bowler';
    }
  } else if (player.role === 'batting_allrounder' || player.role === 'bowling_allrounder') {
    if (p.pressureHandlingClutch >= 88 && (p.boundaryHitting >= 85 || p.deathOversExecution >= 85)) {
      archetype = 'Clutch Match-Winning All-Round Weapon';
    } else {
      archetype = 'Impact Dual-Threat All-Rounder';
    }
  } else if (player.role === 'wicketkeeper_batsman') {
    if (p.boundaryHitting >= 88 && p.pressureHandlingClutch >= 90) {
      archetype = 'Legendary Finisher & Tactical Keeper';
    } else {
      archetype = 'Wicketkeeper Specialist & Core Anchor';
    }
  }

  // 7. Top Strengths & Key Areas for Development
  const paramEntries = Object.entries(p) as [keyof PlayerParameters, number][];
  paramEntries.sort((a, b) => b[1] - a[1]);

  const topStrengths = paramEntries.slice(0, 3).map(([key, val]) => {
    const meta = PARAMETER_METADATA.find((m) => m.key === key);
    return {
      paramKey: key,
      title: meta?.label || key,
      value: val,
      icon: meta?.iconName || 'Zap',
    };
  });

  const areasToImprove = paramEntries
    .slice(-3)
    .reverse()
    .map(([key, val]) => {
      const meta = PARAMETER_METADATA.find((m) => m.key === key);
      let tip = 'Targeted drill practice recommended.';
      if (key === 'extrasControlUnderPressure') {
        tip = 'Practice target bowling with cones under simulated noisy death-over pressure drills.';
      } else if (key === 'boundaryHitting') {
        tip = 'Power-hitting mechanics, bat speed drills and clearing front leg against fuller lengths.';
      } else if (key === 'runningBetweenWickets') {
        tip = 'Shuttle sprints with pads and calling communication drills with partners.';
      } else if (key === 'spinPlayingAbility') {
        tip = 'Footwork range drills: sweep, reverse sweep, and stepping out to pitch of turn.';
      } else if (key === 'deathOversExecution') {
        tip = 'Blockhole target training and deceptive back-of-the-hand slower variations.';
      } else if (key === 'pressureHandlingClutch') {
        tip = 'Scenario-based simulation matches requiring 15 runs per over to build mental calm.';
      } else if (key === 'throwingAccuracyPower') {
        tip = 'Long-distance crow-hop throws and single stump target training.';
      }
      return {
        paramKey: key,
        title: meta?.label || key,
        value: val,
        tip,
      };
    });

  // 8. Match Simulation Indices
  const chaseMasterIndex = Math.round(
    p.pressureHandlingClutch * 0.4 +
      p.runningBetweenWickets * 0.25 +
      p.boundaryHitting * 0.2 +
      p.matchAwarenessIQ * 0.15
  );

  const powerplayDominance = Math.round(
    player.role.includes('bowler')
      ? p.bowlingPaceSpin * 0.4 + p.bowlingAccuracy * 0.35 + p.wicketTakingAbility * 0.25
      : p.battingTiming * 0.35 + p.boundaryHitting * 0.35 + p.pacePlayingAbility * 0.3
  );

  const deathOversImpact = Math.round(
    player.role.includes('bowler')
      ? p.deathOversExecution * 0.5 + p.extrasControlUnderPressure * 0.3 + p.bowlingAccuracy * 0.2
      : p.boundaryHitting * 0.45 + p.battingPower * 0.35 + p.pressureHandlingClutch * 0.2
  );

  const clutchFactor = Math.round(
    p.pressureHandlingClutch * 0.5 + p.confidenceLevel * 0.3 + p.consistencyRating * 0.2
  );

  return {
    overallRating,
    tierName,
    tierColor,
    archetype,
    battingScore,
    bowlingScore,
    fieldingScore,
    athleticismScore,
    mentalClutchScore,
    extrasPressureRiskLabel,
    extrasPressureRiskScore: Math.round(extrasControlMetric),
    extrasAnalysisText,
    offSidePercentage,
    legSidePercentage,
    fieldStrengthSide,
    strongestSector,
    weakestSector,
    topStrengths,
    areasToImprove,
    chaseMasterIndex,
    powerplayDominance,
    deathOversImpact,
    clutchFactor,
  };
}
