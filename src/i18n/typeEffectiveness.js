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
