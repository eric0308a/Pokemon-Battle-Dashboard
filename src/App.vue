<script setup>
import { computed, onMounted, shallowRef } from 'vue'
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

const stats = [
  { key: 'hp', api: 'hp' },
  { key: 'atk', api: 'attack' },
  { key: 'spa', api: 'special-attack' },
  { key: 'def', api: 'defense' },
  { key: 'spd', api: 'special-defense' },
  { key: 'spe', api: 'speed' }
]

const pokedex = new PokeApiWrapper.Pokedex({ cache: true, timeout: 20_000 })
const moveTranslationCache = new Map()

const locale = shallowRef(detectBrowserLocale())
const allySearch = shallowRef('')
const enemySearch = shallowRef('')
const allyTeam = shallowRef([])
const enemyTeam = shallowRef([])
const pokemonPool = shallowRef([])
const isLoadingPool = shallowRef(true)
const loadingError = shallowRef('')

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
    nameEn: localizedNames.nameEn,
    nameZh: localizedNames.nameZh,
    types: pokemonData.types
      .sort((a, b) => a.slot - b.slot)
      .map((item) => item.type.name),
    moves: Array.from(new Set(pokemonData.moves.map((moveItem) => moveItem.move.name))),
    baseStats
  }
}

async function resolveMoveTranslation(moveName) {
  const cached = moveTranslationCache.get(moveName)
  if (cached) {
    return cached
  }

  const fallbackMove = getMoveLocalizedNames(moveName, {
    nameEn: moveName,
    nameZh: moveName
  })

  if (fallbackMove.nameZh !== moveName || fallbackMove.nameEn !== moveName) {
    moveTranslationCache.set(moveName, fallbackMove)
    return fallbackMove
  }

  try {
    const moveData = await pokedex.getMoveByName(moveName)
    const translated = {
      nameEn: pickLocalizedName(moveData.names, 'en-US', moveName),
      nameZh: pickLocalizedName(moveData.names, 'zh-TW', moveName)
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
    types: pokemon.types,
    availableMoves: translatedMoves,
    selectedMoves: Array.from({ length: 4 }, (_, index) => {
      return translatedMoves[index]?.nameEn ?? translatedMoves[0]?.nameEn ?? ''
    }),
    stats: toStatBlock(pokemon.baseStats)
  }

  if (side === 'ally') {
    allyTeam.value = [...allyTeam.value, member]
    return
  }
  enemyTeam.value = [...enemyTeam.value, member]
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
  target.stats[statKey].ev = Number.isFinite(value) ? Math.max(0, value) : 0
  if (side === 'ally') {
    allyTeam.value = [...team]
    return
  }
  enemyTeam.value = [...team]
}

function getTotalStat(member, statKey) {
  const stat = member.stats[statKey]
  return stat.base + stat.ev
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

onMounted(() => {
  locale.value = resolveLocale(detectBrowserLocale())
  document.documentElement.lang = locale.value
  fetchAllowedPokemonPool()
})
</script>

<template>
  <main class="battle-page">
    <header class="page-header">
      <h1 class="title">{{ t('title') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>
    </header>

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
            <h3 class="member-name">{{ displayPokemonName(member) }}</h3>
            <p class="meta-text">{{ t('enNameLabel') }}: {{ member.nameEn }}</p>
            <p class="meta-text">{{ t('typeLabel') }}: {{ member.types.map(displayType).join(' / ') }}</p>
            <p class="meta-text">{{ t('moveOptionsLabel') }}: {{ member.availableMoves.map(displayMove).join(moveJoiner()) }}</p>
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
                </label>
              </div>
            </div>
            <div class="stats-grid">
              <div v-for="stat in stats" :key="`${member.uid}-${stat.key}`" class="stat-row">
                <span class="stat-label">{{ statLabel(stat.key) }}</span>
                <span class="base-value">{{ t('baseStatLabel') }}: {{ member.stats[stat.key].base }}</span>
                <label class="ev-input-wrap">
                  {{ t('evLabel') }}
                  <input
                    class="ev-input"
                    type="number"
                    min="0"
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
            <h3 class="member-name">{{ displayPokemonName(member) }}</h3>
            <p class="meta-text">{{ t('enNameLabel') }}: {{ member.nameEn }}</p>
            <p class="meta-text">{{ t('typeLabel') }}: {{ member.types.map(displayType).join(' / ') }}</p>
            <p class="meta-text">{{ t('moveOptionsLabel') }}: {{ member.availableMoves.map(displayMove).join(moveJoiner()) }}</p>
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
                </label>
              </div>
            </div>
            <div class="stats-grid">
              <div v-for="stat in stats" :key="`${member.uid}-${stat.key}`" class="stat-row">
                <span class="stat-label">{{ statLabel(stat.key) }}</span>
                <span class="base-value">{{ t('baseStatLabel') }}: {{ member.stats[stat.key].base }}</span>
                <label class="ev-input-wrap">
                  {{ t('evLabel') }}
                  <input
                    class="ev-input"
                    type="number"
                    min="0"
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
  </main>
</template>
