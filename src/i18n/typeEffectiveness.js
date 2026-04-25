const typeKeys = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy'
]

const attackChart = {
  normal: { x2: [], x05: ['rock', 'steel'], x0: ['ghost'] },
  fire: { x2: ['grass', 'ice', 'bug', 'steel'], x05: ['fire', 'water', 'rock', 'dragon'], x0: [] },
  water: { x2: ['fire', 'ground', 'rock'], x05: ['water', 'grass', 'dragon'], x0: [] },
  grass: { x2: ['water', 'ground', 'rock'], x05: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], x0: [] },
  electric: { x2: ['water', 'flying'], x05: ['grass', 'electric', 'dragon'], x0: ['ground'] },
  ice: { x2: ['grass', 'ground', 'flying', 'dragon'], x05: ['fire', 'water', 'ice', 'steel'], x0: [] },
  fighting: { x2: ['normal', 'ice', 'rock', 'dark', 'steel'], x05: ['poison', 'flying', 'psychic', 'bug', 'fairy'], x0: ['ghost'] },
  poison: { x2: ['grass', 'fairy'], x05: ['poison', 'ground', 'rock', 'ghost'], x0: ['steel'] },
  ground: { x2: ['fire', 'electric', 'poison', 'rock', 'steel'], x05: ['grass', 'bug'], x0: ['flying'] },
  flying: { x2: ['grass', 'fighting', 'bug'], x05: ['electric', 'rock', 'steel'], x0: [] },
  psychic: { x2: ['fighting', 'poison'], x05: ['psychic', 'steel'], x0: ['dark'] },
  bug: { x2: ['grass', 'psychic', 'dark'], x05: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], x0: [] },
  rock: { x2: ['fire', 'ice', 'flying', 'bug'], x05: ['fighting', 'ground', 'steel'], x0: [] },
  ghost: { x2: ['psychic', 'ghost'], x05: ['dark'], x0: ['normal'] },
  dragon: { x2: ['dragon'], x05: ['steel'], x0: ['fairy'] },
  dark: { x2: ['psychic', 'ghost'], x05: ['fighting', 'dark', 'fairy'], x0: [] },
  steel: { x2: ['ice', 'rock', 'fairy'], x05: ['fire', 'water', 'electric', 'steel'], x0: [] },
  fairy: { x2: ['fighting', 'dragon', 'dark'], x05: ['fire', 'poison', 'steel'], x0: [] }
}

const typeColorMap = {
  normal: '#f4f1ea',
  fire: '#d94b2b',
  water: '#3f8dde',
  electric: '#f2c94c',
  grass: '#7cc96c',
  ice: '#73d2f3',
  fighting: '#f08a24',
  poison: '#9b59b6',
  ground: '#8b5a2b',
  flying: '#8ec5ff',
  psychic: '#e83e8c',
  bug: '#4e8c32',
  rock: '#c6a46a',
  ghost: '#5b3a9e',
  dragon: '#3957d8',
  dark: '#111111',
  steel: '#bfc7d3',
  fairy: '#ea8ccf'
}

function normalizeColorKey(typeKey) {
  return normalizeTypeKey(typeKey)
}

function hexToRgba(hex, alpha) {
  const normalizedHex = String(hex ?? '').replace('#', '')
  if (normalizedHex.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`
  }

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16)
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16)
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function getTypeColor(typeKey) {
  const key = normalizeColorKey(typeKey)
  return typeColorMap[key] ?? '#c5d2e3'
}

export function getTypeTheme(typeKeys = []) {
  const normalizedKeys = typeKeys
    .map(normalizeColorKey)
    .filter(Boolean)

  const primaryKey = normalizedKeys[0] ?? 'normal'
  const secondaryKey = normalizedKeys[1] ?? primaryKey
  const primaryColor = getTypeColor(primaryKey)
  const secondaryColor = getTypeColor(secondaryKey)
  const tertiaryColor = getTypeColor(normalizedKeys[2] ?? secondaryKey)

  return {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    primarySoft: hexToRgba(primaryColor, 0.18),
    secondarySoft: hexToRgba(secondaryColor, 0.18),
    tertiarySoft: hexToRgba(tertiaryColor, 0.12),
    borderColor: hexToRgba(primaryColor, 0.42),
    textColor: primaryKey === 'normal' ? '#314257' : '#142137',
    gradient: normalizedKeys.length > 1
      ? `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.24)} 0 49.5%, ${hexToRgba(secondaryColor, 0.24)} 49.5% 100%)`
      : `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.22)} 0 100%)`
  }
}

function normalizeTypeKey(typeKey) {
  return String(typeKey ?? '').toLowerCase()
}

function calculateEffectivenessMultiplier(attackTypeKey, defenderTypeKeys) {
  const attackKey = normalizeTypeKey(attackTypeKey)
  const defenderKeys = defenderTypeKeys.map(normalizeTypeKey)
  const chart = attackChart[attackKey]

  if (!chart) {
    return 1
  }

  let multiplier = 1
  for (const defenderKey of defenderKeys) {
    if (chart.x0.includes(defenderKey)) {
      return 0
    }
    if (chart.x2.includes(defenderKey)) {
      multiplier *= 2
    } else if (chart.x05.includes(defenderKey)) {
      multiplier *= 0.5
    }
  }
  return multiplier
}

export function getAttackRelations(attackTypeKey) {
  const chart = attackChart[normalizeTypeKey(attackTypeKey)] ?? { x2: [], x05: [], x0: [] }
  return {
    strongAgainst: chart.x2,
    weakAgainst: chart.x05,
    noEffectAgainst: chart.x0
  }
}

export function getDefenseRelations(defenderTypeKeys) {
  const buckets = {
    4: [],
    2: [],
    0.5: [],
    0.25: [],
    0: []
  }

  for (const attackTypeKey of typeKeys) {
    const multiplier = calculateEffectivenessMultiplier(attackTypeKey, defenderTypeKeys)
    if (multiplier === 4) {
      buckets[4].push(attackTypeKey)
      continue
    }
    if (multiplier === 2) {
      buckets[2].push(attackTypeKey)
      continue
    }
    if (multiplier === 0.5) {
      buckets[0.5].push(attackTypeKey)
      continue
    }
    if (multiplier === 0.25) {
      buckets[0.25].push(attackTypeKey)
      continue
    }
    if (multiplier === 0) {
      buckets[0].push(attackTypeKey)
    }
  }

  return buckets
}

export function getEffectivenessMultiplier(attackTypeKey, defenderTypeKeys) {
  return calculateEffectivenessMultiplier(attackTypeKey, defenderTypeKeys)
}
