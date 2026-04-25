<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import * as PokeApiWrapper from 'pokeapi-js-wrapper'
import allowedPokemonIds from './assets/allowedPokemonIds.json'
import {
  detectBrowserLocale,
  getDisplayMoveName,
  getMoveLocalizedNames,
  getDisplayPokemonName,
  getMessage,
  getPokemonLocalizedNames,
  getStatLabel,
  getTypeLabel,
  pickLocalizedName,
  registerPokemonNameTranslation,
  resolveLocale
} from './i18n/translations'
import {
  getAttackRelations,
  getDefenseRelations,
  getEffectivenessMultiplier
} from './i18n/typeEffectiveness'

const stats = [
  { key: 'hp', api: 'hp' },
  { key: 'atk', api: 'attack' },
  { key: 'def', api: 'defense' },
  { key: 'spa', api: 'special-attack' },
  { key: 'spd', api: 'special-defense' },
  { key: 'spe', api: 'speed' }
]

const speedStageOptions = Array.from({ length: 13 }, (_, index) => {
  const value = index - 6
  return { value, label: value > 0 ? `+${value}` : `${value}` }
})

const speedAbilityOptions = [
  { value: 1, key: 'speedAbilityNone' },
  { value: 1.5, key: 'speedAbilityBoost15' },
  { value: 2, key: 'speedAbilityBoost20' }
]

const natureOptions = [
  // 增加 攻擊 (up: 'atk')
  { key: 'serious', nameZh: '認真', nameEn: 'Serious', up: 'atk', down: 'atk' },
  { key: 'lonely', nameZh: '怕寂寞', nameEn: 'Lonely', up: 'atk', down: 'def' },
  { key: 'adamant', nameZh: '固執', nameEn: 'Adamant', up: 'atk', down: 'spa' },
  { key: 'naughty', nameZh: '頑皮', nameEn: 'Naughty', up: 'atk', down: 'spd' },
  { key: 'brave', nameZh: '勇敢', nameEn: 'Brave', up: 'atk', down: 'spe' },

  // 增加 防禦 (up: 'def')
  { key: 'bold', nameZh: '大膽', nameEn: 'Bold', up: 'def', down: 'atk' },
  { key: 'bashful', nameZh: '害羞', nameEn: 'Bashful', up: 'def', down: 'def' },
  { key: 'impish', nameZh: '淘氣', nameEn: 'Impish', up: 'def', down: 'spa' },
  { key: 'lax', nameZh: '樂天', nameEn: 'Lax', up: 'def', down: 'spd' },
  { key: 'relaxed', nameZh: '悠閒', nameEn: 'Relaxed', up: 'def', down: 'spe' },

  // 增加 特攻 (up: 'spa')
  { key: 'modest', nameZh: '內斂', nameEn: 'Modest', up: 'spa', down: 'atk' },
  { key: 'mild', nameZh: '慢吞吞', nameEn: 'Mild', up: 'spa', down: 'def' },
  { key: 'hardy', nameZh: '勤奮', nameEn: 'Hardy', up: 'spa', down: 'spa' },
  { key: 'rash', nameZh: '馬虎', nameEn: 'Rash', up: 'spa', down: 'spd' },
  { key: 'quiet', nameZh: '冷靜', nameEn: 'Quiet', up: 'spa', down: 'spe' },

  // 增加 特防 (up: 'spd')
  { key: 'calm', nameZh: '溫和', nameEn: 'Calm', up: 'spd', down: 'atk' },
  { key: 'gentle', nameZh: '溫順', nameEn: 'Gentle', up: 'spd', down: 'def' },
  { key: 'careful', nameZh: '慎重', nameEn: 'Careful', up: 'spd', down: 'spa' },
  { key: 'quirky', nameZh: '浮躁', nameEn: 'Quirky', up: 'spd', down: 'spd' },
  { key: 'sassy', nameZh: '自大', nameEn: 'Sassy', up: 'spd', down: 'spe' },

  // 增加 速度 (up: 'spe')
  { key: 'timid', nameZh: '膽小', nameEn: 'Timid', up: 'spe', down: 'atk' },
  { key: 'hasty', nameZh: '急躁', nameEn: 'Hasty', up: 'spe', down: 'def' },
  { key: 'jolly', nameZh: '爽朗', nameEn: 'Jolly', up: 'spe', down: 'spa' },
  { key: 'naive', nameZh: '天真', nameEn: 'Naive', up: 'spe', down: 'spd' },
  { key: 'serious2', nameZh: '坦率', nameEn: 'Quirky', up: 'spe', down: 'spe' } 
];

const pokedex = new PokeApiWrapper.Pokedex({ cache: true, timeout: 20_000 })
const moveTranslationCache = new Map()
const pokemonFormCache = new Map()

const locale = shallowRef(detectBrowserLocale())
const currentWeather = shallowRef('none')
const isDetailMenuOpen = shallowRef(false)
const allySearch = shallowRef('')
const enemySearch = shallowRef('')
const allyTeam = shallowRef([])
const enemyTeam = shallowRef([])
const pokemonPool = shallowRef([])
const isLoadingPool = shallowRef(true)
const loadingError = shallowRef('')

const viewSettings = reactive({
  compactMode: true,
  showWeatherPanel: true,
  showEnglishName: false,
  showNatureHint: true,
  showDefenseSummary: true,
  showMoveCatalog: false,
  showMoveHints: true,
  showStatsPanel: true,
  showAnalysisPanel: true
})

const speedFieldSettings = reactive({
  allyTailwind: false,
  enemyTailwind: false,
  trickRoom: false
})

function chunkArray(list, size) {
  const chunks = []
  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size))
  }
  return chunks
}

function toStatBlock(baseStats) {
  const block = {
    hp: { base: 0, ev: 0 },
    atk: { base: 0, ev: 0 },
    spa: { base: 0, ev: 0 },
    def: { base: 0, ev: 0 },
    spd: { base: 0, ev: 0 },
    spe: { base: 0, ev: 0 }
  }

  stats.forEach((item) => {
    block[item.key].base = baseStats[item.key] ?? 0
  })
  return block
}

function getMegaFormLabel(megaSlug) {
  if (megaSlug.endsWith('-mega-x')) {
    return 'X'
  }
  if (megaSlug.endsWith('-mega-y')) {
    return 'Y'
  }
  return 'Mega'
}

function extractMegaOptions(speciesData) {
  const megaSlugs = speciesData.varieties
    .map((item) => item.pokemon?.name ?? '')
    .filter((name) => name.includes('-mega'))

  return megaSlugs
    .sort((a, b) => {
      const rank = (slug) => {
        if (slug.endsWith('-mega-y')) return 0
        if (slug.endsWith('-mega-x')) return 1
        return 2
      }
      return rank(a) - rank(b)
    })
    .map((slug) => ({
      slug,
      formLabel: getMegaFormLabel(slug)
    }))
}

function chooseDefaultMegaSlug(megaOptions) {
  const preferredY = megaOptions.find((item) => item.slug.endsWith('-mega-y'))
  return preferredY?.slug ?? megaOptions[0]?.slug ?? ''
}

function normalizePokemon(pokemonData, speciesData) {
  const apiChineseName = pickLocalizedName(speciesData.names, 'zh-TW', pokemonData.name)
  const apiEnglishName = pickLocalizedName(speciesData.names, 'en-US', pokemonData.name)
  const localizedNames = getPokemonLocalizedNames(pokemonData.id, {
    nameZh: apiChineseName,
    nameEn: apiEnglishName
  })

  registerPokemonNameTranslation(pokemonData.id, {
    nameZh: localizedNames.nameZh,
    nameEn: localizedNames.nameEn
  })

  const baseStats = pokemonData.stats.reduce((accumulator, item) => {
    const statName = item.stat.name
    const target = stats.find((definition) => definition.api === statName)
    if (!target) {
      return accumulator
    }
    accumulator[target.key] = item.base_stat
    return accumulator
  }, {})

  return {
    id: pokemonData.id,
    slug: pokemonData.name,
    nameEn: localizedNames.nameEn,
    nameZh: localizedNames.nameZh,
    megaOptions: extractMegaOptions(speciesData),
    types: pokemonData.types
      .sort((a, b) => a.slot - b.slot)
      .map((item) => item.type.name),
    moves: Array.from(new Set(pokemonData.moves.map((moveItem) => moveItem.move.name))),
    baseStats
  }
}

async function fetchPokemonFormData(slug) {
  const cached = pokemonFormCache.get(slug)
  if (cached) {
    return cached
  }

  const pokemonData = await pokedex.getPokemonByName(slug)
  const speciesData = await pokedex.getPokemonSpeciesByName(pokemonData.species.name)
  const normalized = normalizePokemon(pokemonData, speciesData)
  pokemonFormCache.set(slug, normalized)
  return normalized
}

async function resolveMoveTranslation(moveName) {
  const cached = moveTranslationCache.get(moveName)
  if (cached) {
    return cached
  }

  const fallbackMove = getMoveLocalizedNames(moveName, {
    nameEn: moveName,
    nameZh: moveName,
    typeKey: ''
  })

  if (fallbackMove.typeKey) {
    moveTranslationCache.set(moveName, fallbackMove)
    return fallbackMove
  }

  try {
    const moveData = await pokedex.getMoveByName(moveName)
    const translated = {
      nameEn: pickLocalizedName(moveData.names, 'en-US', moveName),
      nameZh: pickLocalizedName(moveData.names, 'zh-TW', moveName),
      typeKey: moveData.type?.name ?? ''
    }
    moveTranslationCache.set(moveName, translated)
    return translated
  } catch (_error) {
    moveTranslationCache.set(moveName, fallbackMove)
    return fallbackMove
  }
}

async function fetchAllowedPokemonPool() {
  isLoadingPool.value = true
  loadingError.value = ''

  try {
    const chunks = chunkArray(allowedPokemonIds, 12)
    const allEntries = []

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (id) => {
          const pokemonData = await pokedex.getPokemonByName(id)
          const speciesData = await pokedex.getPokemonSpeciesByName(id)
          return normalizePokemon(pokemonData, speciesData)
        })
      )
      allEntries.push(...chunkResults)
    }

    pokemonPool.value = allEntries.sort((a, b) => a.id - b.id)
  } catch (error) {
    loadingError.value = error?.message ?? 'Unknown error'
  } finally {
    isLoadingPool.value = false
  }
}

const filteredAllyPool = computed(() => {
  const keyword = allySearch.value.trim().toLowerCase()
  if (!keyword) {
    return pokemonPool.value
  }
  return pokemonPool.value.filter((pokemon) => {
    const names = getPokemonLocalizedNames(pokemon.id, {
      nameZh: pokemon.nameZh,
      nameEn: pokemon.nameEn
    })
    return names.nameZh.toLowerCase().includes(keyword)
      || names.nameEn.toLowerCase().includes(keyword)
      || String(pokemon.id).includes(keyword)
  })
})

const filteredEnemyPool = computed(() => {
  const keyword = enemySearch.value.trim().toLowerCase()
  if (!keyword) {
    return pokemonPool.value
  }
  return pokemonPool.value.filter((pokemon) => {
    const names = getPokemonLocalizedNames(pokemon.id, {
      nameZh: pokemon.nameZh,
      nameEn: pokemon.nameEn
    })
    return names.nameZh.toLowerCase().includes(keyword)
      || names.nameEn.toLowerCase().includes(keyword)
      || String(pokemon.id).includes(keyword)
  })
})

async function addToTeam(side, pokemon) {
  const translatedMoves = await Promise.all(
    pokemon.moves.map((moveName) => resolveMoveTranslation(moveName))
  )

  const member = {
    uid: `${pokemon.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: pokemon.id,
    nameZh: pokemon.nameZh,
    nameEn: pokemon.nameEn,
    baseSlug: pokemon.slug,
    megaOptions: pokemon.megaOptions ?? [],
    isMega: false,
    megaSlug: '',
    megaFormLabel: '',
    megaError: '',
    types: pokemon.types,
    baseForm: {
      types: [...pokemon.types],
      baseStats: { ...pokemon.baseStats }
    },
    availableMoves: translatedMoves,
    selectedMoves: Array.from({ length: 4 }, (_, index) => {
      return translatedMoves[index]?.nameEn ?? translatedMoves[0]?.nameEn ?? ''
    }),
    natureKey: 'serious',
    speedStage: 0,
    speedAbilityMultiplier: 1,
    speedParalyzed: false,
    stats: toStatBlock(pokemon.baseStats)
  }

  if (side === 'ally') {
    allyTeam.value = [...allyTeam.value, member]
    return
  }
  enemyTeam.value = [...enemyTeam.value, member]
}

function applyBaseStatsToMember(member, baseStats) {
  stats.forEach((item) => {
    member.stats[item.key].base = baseStats[item.key] ?? 0
  })
}

async function applyMegaState(member, isMegaEnabled) {
  if (!isMegaEnabled) {
    member.isMega = false
    member.megaSlug = ''
    member.megaFormLabel = ''
    member.megaError = ''
    member.types = [...member.baseForm.types]
    applyBaseStatsToMember(member, member.baseForm.baseStats)
    return
  }

  if (member.megaOptions.length === 0) {
    member.megaError = t('megaNotAvailable')
    return
  }

  const targetSlug = member.megaSlug || chooseDefaultMegaSlug(member.megaOptions)

  try {
    const megaFormData = await fetchPokemonFormData(targetSlug)
    member.isMega = true
    member.megaSlug = targetSlug
    member.megaFormLabel = getMegaFormLabel(targetSlug)
    member.megaError = ''
    member.types = [...megaFormData.types]
    applyBaseStatsToMember(member, megaFormData.baseStats)
  } catch (_error) {
    member.isMega = false
    member.megaSlug = ''
    member.megaFormLabel = ''
    member.megaError = t('megaLoadFailed')
    member.types = [...member.baseForm.types]
    applyBaseStatsToMember(member, member.baseForm.baseStats)
  }
}

async function toggleMega(side, memberUid, checked) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }

  let hadExistingMega = false
  if (checked) {
    const existingMega = team.find((member) => member.uid !== memberUid && member.isMega)
    if (existingMega) {
      hadExistingMega = true
      await applyMegaState(existingMega, false)
    }
  }

  await applyMegaState(target, checked)
  if (checked && hadExistingMega) {
    target.megaError = t('megaOneLimitHint')
  }

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

async function changeMegaForm(side, memberUid, megaSlug) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }

  target.megaSlug = megaSlug
  await applyMegaState(target, true)

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function updateNature(side, memberUid, natureKey) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }
  target.natureKey = natureKey

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function removeFromTeam(side, memberUid) {
  if (side === 'ally') {
    allyTeam.value = allyTeam.value.filter((member) => member.uid !== memberUid)
    return
  }
  enemyTeam.value = enemyTeam.value.filter((member) => member.uid !== memberUid)
}

function updateSelectedMove(side, memberUid, slotIndex, value) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }

  const nextSelectedMoves = [...target.selectedMoves]
  nextSelectedMoves[slotIndex] = value
  target.selectedMoves = nextSelectedMoves

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function updateEv(side, memberUid, statKey, value) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }
  const normalized = Number.isFinite(value)
    ? Math.min(32, Math.max(0, Math.trunc(value)))
    : 0
  target.stats[statKey].ev = normalized
  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function updateSpeedStage(side, memberUid, value) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }

  const stage = Number.parseInt(value, 10)
  target.speedStage = Number.isNaN(stage) ? 0 : Math.min(6, Math.max(-6, stage))

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function updateSpeedAbilityMultiplier(side, memberUid, value) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }

  const multiplier = Number.parseFloat(value)
  target.speedAbilityMultiplier = Number.isNaN(multiplier) ? 1 : multiplier

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function updateSpeedParalyzed(side, memberUid, checked) {
  const team = side === 'ally' ? allyTeam.value : enemyTeam.value
  const target = team.find((member) => member.uid === memberUid)
  if (!target) {
    return
  }

  target.speedParalyzed = checked

  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function getNatureModifier(natureKey, statKey) {
  if (statKey === 'hp') {
    return 1
  }

  const nature = natureOptions.find((item) => item.key === natureKey)
  if (!nature || nature.up === nature.down) {
    return 1
  }
  if (nature.up === statKey) {
    return 1.1
  }
  if (nature.down === statKey) {
    return 0.9
  }
  return 1
}

function getBaseFormulaValue(baseStat) {
  return Math.floor((baseStat * 2 + 31) / 2)
}

function getTotalStat(member, statKey) {
  const stat = member.stats[statKey]
  const baseValue = getBaseFormulaValue(stat.base)

  if (statKey === 'hp') {
    return baseValue + 60 + stat.ev
  }

  const natureModifier = getNatureModifier(member.natureKey, statKey)
  return Math.floor((baseValue + 5 + stat.ev) * natureModifier)
}

function t(key) {
  return getMessage(locale.value, key)
}

function displayPokemonName(pokemon) {
  return getDisplayPokemonName(locale.value, {
    id: pokemon.id,
    nameZh: pokemon.nameZh,
    nameEn: pokemon.nameEn
  })
}

function displayBattleMemberName(member) {
  const baseName = displayPokemonName(member)
  if (!member.isMega) {
    return baseName
  }

  const megaSuffix = member.megaFormLabel && member.megaFormLabel !== 'Mega'
    ? `${t('megaTag')}-${member.megaFormLabel}`
    : t('megaTag')
  return `${baseName} (${megaSuffix})`
}

function displayType(typeName) {
  return getTypeLabel(locale.value, typeName)
}

function displayMove(move) {
  return getDisplayMoveName(locale.value, move)
}

function moveJoiner() {
  return locale.value === 'zh-TW' ? '、' : ', '
}

function statLabel(statKey) {
  return getStatLabel(locale.value, statKey)
}

function displayNatureName(nature) {
  return locale.value === 'zh-TW' ? nature.nameZh : nature.nameEn
}

function getNatureHintText(natureKey) {
  const nature = natureOptions.find((item) => item.key === natureKey)
  if (!nature || nature.up === nature.down) {
    return t('natureNeutralHint')
  }

  return `${statLabel(nature.up)} x1.1 / ${statLabel(nature.down)} x0.9`
}

function getSelectedMove(member, moveName) {
  return member.availableMoves.find((move) => move.nameEn === moveName) ?? null
}

function formatTypeList(typeKeys) {
  const labels = typeKeys.map((typeKey) => displayType(typeKey))
  return labels.length > 0 ? labels.join('、') : t('typeNoneLabel')
}

function formatDefenseSummary(typeKeys) {
  const buckets = getDefenseRelations(typeKeys)
  const parts = [
    `${t('typeDoubleWeakLabel')}：${formatTypeList(buckets[4])}`,
    `${t('typeWeaknessLabel')}：${formatTypeList(buckets[2])}`,
    `${t('typeResistanceLabel')}：${formatTypeList(buckets[0.5])}`,
    `${t('typeDoubleResistLabel')}：${formatTypeList(buckets[0.25])}`,
    `${t('typeImmunityLabel')}：${formatTypeList(buckets[0])}`
  ]
  return parts.join('；')
}

function formatAttackSummary(typeKey) {
  if (!typeKey) {
    return t('typeNoneLabel')
  }

  const relations = getAttackRelations(typeKey)
  const parts = [
    `${t('typeStrongLabel')}：${formatTypeList(relations.strongAgainst)}`,
    `${t('typeWeakLabel')}：${formatTypeList(relations.weakAgainst)}`,
    `${t('typeNoEffectLabel')}：${formatTypeList(relations.noEffectAgainst)}`
  ]
  return parts.join('；')
}

function moveTypeLabel(move) {
  return move?.typeKey ? displayType(move.typeKey) : t('typeNoneLabel')
}

function weatherLabel(weatherKey) {
  return t(`weather${weatherKey.charAt(0).toUpperCase()}${weatherKey.slice(1)}`)
}

function speedStageMultiplier(stage) {
  if (stage > 0) {
    return (2 + stage) / 2
  }
  if (stage < 0) {
    return 2 / (2 - stage)
  }
  return 1
}

function getBattleSpeed(member, side) {
  const rawStage = Number.isFinite(member.speedStage) ? member.speedStage : 0
  const stage = Math.min(6, Math.max(-6, rawStage))
  const stageMultiplier = speedStageMultiplier(stage)
  const abilityMultiplier = Number.isFinite(member.speedAbilityMultiplier)
    ? member.speedAbilityMultiplier
    : 1
  const tailwindEnabled = side === 'ally'
    ? speedFieldSettings.allyTailwind
    : speedFieldSettings.enemyTailwind

  let finalSpeed = Math.floor(getTotalStat(member, 'spe') * stageMultiplier)
  finalSpeed = Math.floor(finalSpeed * abilityMultiplier)

  if (tailwindEnabled) {
    finalSpeed = Math.floor(finalSpeed * 2)
  }

  if (member.speedParalyzed) {
    finalSpeed = Math.floor(finalSpeed * 0.5)
  }

  return Math.max(1, finalSpeed)
}

function getWeatherNotes(member) {
  const notes = []
  if (currentWeather.value === 'sun') {
    notes.push(t('weatherSunRule'))
    if (member.types.includes('water')) {
      notes.push(t('weatherSunWaterHint'))
    }
  }

  if (currentWeather.value === 'rain') {
    notes.push(t('weatherRainRule'))
    if (member.types.includes('fire')) {
      notes.push(t('weatherRainFireHint'))
    }
  }

  if (currentWeather.value === 'sand' && member.types.includes('rock')) {
    notes.push(t('weatherSandRockHint'))
  }

  if (currentWeather.value === 'snow' && member.types.includes('ice')) {
    notes.push(t('weatherSnowIceHint'))
  }

  return notes
}

const allyWeaknessReport = computed(() => {
  if (allyTeam.value.length === 0) {
    return []
  }

  const weaknessMap = new Map()

  allyTeam.value.forEach((member) => {
    const relations = getDefenseRelations(member.types)
    const weakTypes = [...relations[2], ...relations[4]]

    weakTypes.forEach((typeKey) => {
      const existing = weaknessMap.get(typeKey) ?? []
      existing.push(displayPokemonName(member))
      weaknessMap.set(typeKey, existing)
    })
  })

  return Array.from(weaknessMap.entries())
    .filter(([, members]) => members.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
})

const topWeaknessType = computed(() => {
  return allyWeaknessReport.value[0]?.[0] ?? ''
})

const defensiveRecommendations = computed(() => {
  if (!topWeaknessType.value) {
    return []
  }

  const selectedIds = new Set(allyTeam.value.map((member) => member.id))
  return pokemonPool.value
    .filter((pokemon) => {
      if (selectedIds.has(pokemon.id)) {
        return false
      }
      const multiplier = getEffectivenessMultiplier(topWeaknessType.value, pokemon.types)
      return multiplier <= 0.5
    })
    .slice(0, 12)
})

const speedLineRows = computed(() => {
  const rows = [
    ...allyTeam.value.map((member) => ({
      uid: member.uid,
      side: 'ally',
      displayName: displayBattleMemberName(member),
      speed: getBattleSpeed(member, 'ally'),
      tieRoll: Math.random()
    })),
    ...enemyTeam.value.map((member) => ({
      uid: member.uid,
      side: 'enemy',
      displayName: displayBattleMemberName(member),
      speed: getBattleSpeed(member, 'enemy'),
      tieRoll: Math.random()
    }))
  ]

  const speedCountMap = rows.reduce((map, item) => {
    map.set(item.speed, (map.get(item.speed) ?? 0) + 1)
    return map
  }, new Map())

  const sortedRows = [...rows].sort((a, b) => {
    if (a.speed === b.speed) {
      return b.tieRoll - a.tieRoll
    }

    if (speedFieldSettings.trickRoom) {
      return a.speed - b.speed
    }

    return b.speed - a.speed
  })

  return sortedRows.map((item, index) => ({
    ...item,
    isTie: (speedCountMap.get(item.speed) ?? 0) > 1,
    rank: index + 1
  }))
})

function sideLabel(side) {
  return side === 'ally' ? t('allyPanel') : t('enemyPanel')
}

onMounted(() => {
  locale.value = resolveLocale(detectBrowserLocale())
  document.documentElement.lang = locale.value
  fetchAllowedPokemonPool()
})
</script>

<template>
  <main class="battle-page" :class="{ 'compact-mode': viewSettings.compactMode }">
    <header class="page-header">
      <h1 class="title">{{ t('title') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>
    </header>

    <section class="detail-menu">
      <button
        class="detail-menu-btn"
        type="button"
        :aria-expanded="isDetailMenuOpen"
        @click="isDetailMenuOpen = !isDetailMenuOpen"
      >
        <span>{{ t('detailMenuTitle') }}</span>
        <span class="detail-menu-state">{{ isDetailMenuOpen ? t('detailMenuHide') : t('detailMenuShow') }}</span>
      </button>

      <div v-if="isDetailMenuOpen" class="detail-grid">
        <label class="detail-item">
          <input v-model="viewSettings.compactMode" type="checkbox" />
          <span>{{ t('settingCompactMode') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showWeatherPanel" type="checkbox" />
          <span>{{ t('settingWeatherPanel') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showEnglishName" type="checkbox" />
          <span>{{ t('settingEnglishName') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showNatureHint" type="checkbox" />
          <span>{{ t('settingNatureHint') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showDefenseSummary" type="checkbox" />
          <span>{{ t('settingDefenseSummary') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showMoveCatalog" type="checkbox" />
          <span>{{ t('settingMoveCatalog') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showMoveHints" type="checkbox" />
          <span>{{ t('settingMoveHints') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showStatsPanel" type="checkbox" />
          <span>{{ t('settingStatsPanel') }}</span>
        </label>
        <label class="detail-item">
          <input v-model="viewSettings.showAnalysisPanel" type="checkbox" />
          <span>{{ t('settingAnalysisPanel') }}</span>
        </label>
      </div>
    </section>

    <section v-if="viewSettings.showWeatherPanel" class="weather-panel">
      <p class="weather-title">{{ t('weatherLabel') }}</p>
      <div class="weather-options">
        <label
          v-for="weather in ['none', 'sun', 'rain', 'sand', 'snow']"
          :key="`weather-${weather}`"
          class="weather-option"
        >
          <input
            v-model="currentWeather"
            type="radio"
            name="weather"
            :value="weather"
          />
          <span>{{ weatherLabel(weather) }}</span>
        </label>
      </div>
    </section>

    <section class="columns">
      <article class="team-panel">
        <h2 class="panel-title">{{ t('allyPanel') }}</h2>
        <input
          v-model="allySearch"
          class="search-input"
          type="text"
          :placeholder="t('searchPlaceholderAlly')"
        />

        <p v-if="isLoadingPool" class="status-text">{{ t('loadingPool') }}</p>
        <p v-if="loadingError" class="status-text error">{{ t('loadingFailed') }}: {{ loadingError }}</p>

        <div class="search-results">
          <button
            v-for="pokemon in filteredAllyPool"
            :key="`ally-${pokemon.id}`"
            class="result-item"
            type="button"
            @click="addToTeam('ally', pokemon)"
          >
            {{ t('addPrefix') }} #{{ pokemon.id }} {{ displayPokemonName(pokemon) }}
          </button>
        </div>

        <div class="team-list">
          <section v-for="member in allyTeam" :key="member.uid" class="member-card">
            <div class="member-head">
              <h3 class="member-name">{{ displayBattleMemberName(member) }}</h3>
              <button
                class="remove-btn"
                type="button"
                @click="removeFromTeam('ally', member.uid)"
              >
                {{ t('removeMemberLabel') }}
              </button>
            </div>
            <p v-if="viewSettings.showEnglishName" class="meta-text">{{ t('enNameLabel') }}: {{ member.nameEn }}</p>
            <div v-if="member.megaOptions.length > 0" class="mega-controls">
              <label class="speed-check">
                <input
                  type="checkbox"
                  :checked="member.isMega"
                  @change="toggleMega('ally', member.uid, $event.target.checked)"
                />
                <span>{{ t('megaToggleLabel') }}</span>
              </label>

              <label v-if="member.isMega && member.megaOptions.length > 1" class="move-select-item mega-form-select">
                {{ t('megaFormLabel') }}
                <select
                  class="move-select"
                  :value="member.megaSlug || member.megaOptions[0].slug"
                  @change="changeMegaForm('ally', member.uid, $event.target.value)"
                >
                  <option
                    v-for="option in member.megaOptions"
                    :key="`${member.uid}-ally-mega-${option.slug}`"
                    :value="option.slug"
                  >
                    {{ option.formLabel }}
                  </option>
                </select>
              </label>

              <p v-if="member.megaError" class="meta-text mega-note">{{ member.megaError }}</p>
            </div>
            <label class="move-select-item nature-select-item">
              {{ t('natureLabel') }}
              <select
                class="move-select"
                :value="member.natureKey"
                @change="updateNature('ally', member.uid, $event.target.value)"
              >
                <option
                  v-for="nature in natureOptions"
                  :key="`${member.uid}-ally-nature-${nature.key}`"
                  :value="nature.key"
                >
                  {{ displayNatureName(nature) }}
                </option>
              </select>
            </label>
            <p v-if="viewSettings.showNatureHint" class="meta-text nature-hint">{{ t('natureEffectLabel') }}: {{ getNatureHintText(member.natureKey) }}</p>
            <div class="speed-modifiers">
              <label class="move-select-item">
                {{ t('speedStageLabel') }}
                <select
                  class="move-select"
                  :value="member.speedStage"
                  @change="updateSpeedStage('ally', member.uid, $event.target.value)"
                >
                  <option
                    v-for="item in speedStageOptions"
                    :key="`${member.uid}-ally-stage-${item.value}`"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
              </label>
              <label class="move-select-item">
                {{ t('speedAbilityLabel') }}
                <select
                  class="move-select"
                  :value="member.speedAbilityMultiplier"
                  @change="updateSpeedAbilityMultiplier('ally', member.uid, $event.target.value)"
                >
                  <option
                    v-for="item in speedAbilityOptions"
                    :key="`${member.uid}-ally-ability-${item.value}`"
                    :value="item.value"
                  >
                    {{ t(item.key) }}
                  </option>
                </select>
              </label>
              <label class="speed-check">
                <input
                  type="checkbox"
                  :checked="member.speedParalyzed"
                  @change="updateSpeedParalyzed('ally', member.uid, $event.target.checked)"
                />
                <span>{{ t('speedParalyzedLabel') }}</span>
              </label>
            </div>
            <p class="meta-text">{{ t('typeLabel') }}: {{ member.types.map(displayType).join(' / ') }}</p>
            <p v-if="viewSettings.showDefenseSummary" class="meta-text matchup-line">{{ t('typeDefenseLabel') }}: {{ formatDefenseSummary(member.types) }}</p>
            <p v-if="viewSettings.showWeatherPanel && currentWeather !== 'none'" class="meta-text weather-active">{{ t('weatherActiveLabel') }}: {{ weatherLabel(currentWeather) }}</p>
            <p
              v-for="note in viewSettings.showWeatherPanel ? getWeatherNotes(member) : []"
              :key="`${member.uid}-ally-weather-${note}`"
              class="meta-text weather-note"
            >
              {{ note }}
            </p>
            <p v-if="viewSettings.showMoveCatalog" class="meta-text">{{ t('moveOptionsLabel') }}: {{ member.availableMoves.map(displayMove).join(moveJoiner()) }}</p>
            <div class="move-select-area">
              <p class="meta-text">{{ t('moveSelectLabel') }}</p>
              <div class="move-select-grid">
                <label
                  v-for="(selectedMove, moveIndex) in member.selectedMoves"
                  :key="`${member.uid}-ally-move-${moveIndex}`"
                  class="move-select-item"
                >
                  {{ t('moveSlotLabel') }} {{ moveIndex + 1 }}
                  <select
                    class="move-select"
                    :value="selectedMove"
                    @change="updateSelectedMove('ally', member.uid, moveIndex, $event.target.value)"
                  >
                    <option
                      v-for="move in member.availableMoves"
                      :key="`${member.uid}-ally-opt-${move.nameEn}`"
                      :value="move.nameEn"
                    >
                      {{ displayMove(move) }}
                    </option>
                  </select>
                  <span v-if="viewSettings.showMoveHints" class="matchup-help">{{ t('typeLabel') }}: {{ moveTypeLabel(getSelectedMove(member, selectedMove)) }}</span>
                  <span v-if="viewSettings.showMoveHints" class="matchup-help">{{ t('typeAttackLabel') }}: {{ formatAttackSummary(getSelectedMove(member, selectedMove)?.typeKey ?? '') }}</span>
                </label>
              </div>
            </div>
            <div v-if="viewSettings.showStatsPanel" class="stats-grid">
              <div v-for="stat in stats" :key="`${member.uid}-${stat.key}`" class="stat-row">
                <span class="stat-label">{{ statLabel(stat.key) }}</span>
                <span class="base-value">{{ t('baseStatLabel') }}: {{ member.stats[stat.key].base }}</span>
                <label class="ev-input-wrap">
                  {{ t('evLabel') }}
                  <input
                    class="ev-input"
                    type="number"
                    min="0"
                    max="32"
                    :value="member.stats[stat.key].ev"
                    @input="updateEv('ally', member.uid, stat.key, Number($event.target.value))"
                  />
                </label>
                <span class="total-value">{{ t('totalLabel') }}: {{ getTotalStat(member, stat.key) }}</span>
              </div>
            </div>
          </section>
        </div>
      </article>

      <article class="team-panel">
        <h2 class="panel-title">{{ t('enemyPanel') }}</h2>
        <input
          v-model="enemySearch"
          class="search-input"
          type="text"
          :placeholder="t('searchPlaceholderEnemy')"
        />

        <p v-if="isLoadingPool" class="status-text">{{ t('loadingPool') }}</p>
        <p v-if="loadingError" class="status-text error">{{ t('loadingFailed') }}: {{ loadingError }}</p>

        <div class="search-results">
          <button
            v-for="pokemon in filteredEnemyPool"
            :key="`enemy-${pokemon.id}`"
            class="result-item"
            type="button"
            @click="addToTeam('enemy', pokemon)"
          >
            {{ t('addPrefix') }} #{{ pokemon.id }} {{ displayPokemonName(pokemon) }}
          </button>
        </div>

        <div class="team-list">
          <section v-for="member in enemyTeam" :key="member.uid" class="member-card">
            <div class="member-head">
              <h3 class="member-name">{{ displayBattleMemberName(member) }}</h3>
              <button
                class="remove-btn"
                type="button"
                @click="removeFromTeam('enemy', member.uid)"
              >
                {{ t('removeMemberLabel') }}
              </button>
            </div>
            <p v-if="viewSettings.showEnglishName" class="meta-text">{{ t('enNameLabel') }}: {{ member.nameEn }}</p>
            <div v-if="member.megaOptions.length > 0" class="mega-controls">
              <label class="speed-check">
                <input
                  type="checkbox"
                  :checked="member.isMega"
                  @change="toggleMega('enemy', member.uid, $event.target.checked)"
                />
                <span>{{ t('megaToggleLabel') }}</span>
              </label>

              <label v-if="member.isMega && member.megaOptions.length > 1" class="move-select-item mega-form-select">
                {{ t('megaFormLabel') }}
                <select
                  class="move-select"
                  :value="member.megaSlug || member.megaOptions[0].slug"
                  @change="changeMegaForm('enemy', member.uid, $event.target.value)"
                >
                  <option
                    v-for="option in member.megaOptions"
                    :key="`${member.uid}-enemy-mega-${option.slug}`"
                    :value="option.slug"
                  >
                    {{ option.formLabel }}
                  </option>
                </select>
              </label>

              <p v-if="member.megaError" class="meta-text mega-note">{{ member.megaError }}</p>
            </div>
            <label class="move-select-item nature-select-item">
              {{ t('natureLabel') }}
              <select
                class="move-select"
                :value="member.natureKey"
                @change="updateNature('enemy', member.uid, $event.target.value)"
              >
                <option
                  v-for="nature in natureOptions"
                  :key="`${member.uid}-enemy-nature-${nature.key}`"
                  :value="nature.key"
                >
                  {{ displayNatureName(nature) }}
                </option>
              </select>
            </label>
            <p v-if="viewSettings.showNatureHint" class="meta-text nature-hint">{{ t('natureEffectLabel') }}: {{ getNatureHintText(member.natureKey) }}</p>
            <div class="speed-modifiers">
              <label class="move-select-item">
                {{ t('speedStageLabel') }}
                <select
                  class="move-select"
                  :value="member.speedStage"
                  @change="updateSpeedStage('enemy', member.uid, $event.target.value)"
                >
                  <option
                    v-for="item in speedStageOptions"
                    :key="`${member.uid}-enemy-stage-${item.value}`"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
              </label>
              <label class="move-select-item">
                {{ t('speedAbilityLabel') }}
                <select
                  class="move-select"
                  :value="member.speedAbilityMultiplier"
                  @change="updateSpeedAbilityMultiplier('enemy', member.uid, $event.target.value)"
                >
                  <option
                    v-for="item in speedAbilityOptions"
                    :key="`${member.uid}-enemy-ability-${item.value}`"
                    :value="item.value"
                  >
                    {{ t(item.key) }}
                  </option>
                </select>
              </label>
              <label class="speed-check">
                <input
                  type="checkbox"
                  :checked="member.speedParalyzed"
                  @change="updateSpeedParalyzed('enemy', member.uid, $event.target.checked)"
                />
                <span>{{ t('speedParalyzedLabel') }}</span>
              </label>
            </div>
            <p class="meta-text">{{ t('typeLabel') }}: {{ member.types.map(displayType).join(' / ') }}</p>
            <p v-if="viewSettings.showDefenseSummary" class="meta-text matchup-line">{{ t('typeDefenseLabel') }}: {{ formatDefenseSummary(member.types) }}</p>
            <p v-if="viewSettings.showWeatherPanel && currentWeather !== 'none'" class="meta-text weather-active">{{ t('weatherActiveLabel') }}: {{ weatherLabel(currentWeather) }}</p>
            <p
              v-for="note in viewSettings.showWeatherPanel ? getWeatherNotes(member) : []"
              :key="`${member.uid}-enemy-weather-${note}`"
              class="meta-text weather-note"
            >
              {{ note }}
            </p>
            <p v-if="viewSettings.showMoveCatalog" class="meta-text">{{ t('moveOptionsLabel') }}: {{ member.availableMoves.map(displayMove).join(moveJoiner()) }}</p>
            <div class="move-select-area">
              <p class="meta-text">{{ t('moveSelectLabel') }}</p>
              <div class="move-select-grid">
                <label
                  v-for="(selectedMove, moveIndex) in member.selectedMoves"
                  :key="`${member.uid}-enemy-move-${moveIndex}`"
                  class="move-select-item"
                >
                  {{ t('moveSlotLabel') }} {{ moveIndex + 1 }}
                  <select
                    class="move-select"
                    :value="selectedMove"
                    @change="updateSelectedMove('enemy', member.uid, moveIndex, $event.target.value)"
                  >
                    <option
                      v-for="move in member.availableMoves"
                      :key="`${member.uid}-enemy-opt-${move.nameEn}`"
                      :value="move.nameEn"
                    >
                      {{ displayMove(move) }}
                    </option>
                  </select>
                  <span v-if="viewSettings.showMoveHints" class="matchup-help">{{ t('typeLabel') }}: {{ moveTypeLabel(getSelectedMove(member, selectedMove)) }}</span>
                  <span v-if="viewSettings.showMoveHints" class="matchup-help">{{ t('typeAttackLabel') }}: {{ formatAttackSummary(getSelectedMove(member, selectedMove)?.typeKey ?? '') }}</span>
                </label>
              </div>
            </div>
            <div v-if="viewSettings.showStatsPanel" class="stats-grid">
              <div v-for="stat in stats" :key="`${member.uid}-${stat.key}`" class="stat-row">
                <span class="stat-label">{{ statLabel(stat.key) }}</span>
                <span class="base-value">{{ t('baseStatLabel') }}: {{ member.stats[stat.key].base }}</span>
                <label class="ev-input-wrap">
                  {{ t('evLabel') }}
                  <input
                    class="ev-input"
                    type="number"
                    min="0"
                    max="32"
                    :value="member.stats[stat.key].ev"
                    @input="updateEv('enemy', member.uid, stat.key, Number($event.target.value))"
                  />
                </label>
                <span class="total-value">{{ t('totalLabel') }}: {{ getTotalStat(member, stat.key) }}</span>
              </div>
            </div>
          </section>
        </div>
      </article>
    </section>

    <section class="speedline-panel">
      <h2 class="panel-title">{{ t('speedLineTitle') }}</h2>
      <div class="speedline-controls">
        <label class="speed-check">
          <input v-model="speedFieldSettings.allyTailwind" type="checkbox" />
          <span>{{ t('speedTailwindAlly') }}</span>
        </label>
        <label class="speed-check">
          <input v-model="speedFieldSettings.enemyTailwind" type="checkbox" />
          <span>{{ t('speedTailwindEnemy') }}</span>
        </label>
        <label class="speed-check">
          <input v-model="speedFieldSettings.trickRoom" type="checkbox" />
          <span>{{ t('speedTrickRoom') }}</span>
        </label>
      </div>
      <p class="speedline-hint">{{ t('speedTieHint') }}</p>

      <p v-if="speedLineRows.length === 0" class="status-text">{{ t('speedLineNeedMembers') }}</p>

      <div v-else class="speedline-list">
        <div
          v-for="row in speedLineRows"
          :key="`speed-${row.uid}`"
          class="speedline-row"
          :class="{ 'speedline-first': row.rank === 1 }"
        >
          <span class="speedline-rank">#{{ row.rank }}</span>
          <span class="speedline-side" :class="`side-${row.side}`">{{ sideLabel(row.side) }}</span>
          <span class="speedline-name">{{ row.displayName }}</span>
          <span class="speedline-value">{{ t('speedLineValue') }} {{ row.speed }}</span>
          <span v-if="row.isTie" class="speedline-tie">{{ t('speedTieTag') }}</span>
        </div>
      </div>
    </section>

    <section v-if="viewSettings.showAnalysisPanel" class="analysis-panel">
      <h2 class="panel-title">{{ t('analysisTitle') }}</h2>

      <p v-if="allyTeam.length < 2" class="status-text">{{ t('analysisNeedMembers') }}</p>

      <template v-else>
        <p v-if="allyWeaknessReport.length === 0" class="analysis-success">
          {{ t('analysisNoBlindSpot') }}
        </p>

        <div
          v-for="[typeKey, members] in allyWeaknessReport"
          :key="`weak-${typeKey}`"
          class="analysis-danger"
        >
          {{ t('analysisBlindSpotPrefix') }} {{ members.join('、') }} {{ t('analysisBlindSpotSuffix') }}
          <strong>{{ displayType(typeKey) }}</strong>
        </div>

        <div v-if="topWeaknessType" class="recommendation-box">
          <p class="recommendation-title">
            {{ t('recommendationTitle') }} {{ displayType(topWeaknessType) }}
          </p>
          <div v-if="defensiveRecommendations.length > 0" class="recommendation-list">
            <span
              v-for="candidate in defensiveRecommendations"
              :key="`rec-${candidate.id}`"
              class="recommendation-tag"
            >
              #{{ candidate.id }} {{ displayPokemonName(candidate) }}
            </span>
          </div>
          <p v-else class="status-text">{{ t('recommendationEmpty') }}</p>
        </div>
      </template>
    </section>
  </main>
</template>
