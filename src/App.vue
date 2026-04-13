<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import * as PokeApiWrapper from 'pokeapi-js-wrapper'
import allowedPokemonIds from './assets/allowedPokemonIds.json'

const stats = [
  { key: 'hp', label: 'HP', api: 'hp' },
  { key: 'atk', label: '攻擊', api: 'attack' },
  { key: 'spa', label: '特攻', api: 'special-attack' },
  { key: 'def', label: '防禦', api: 'defense' },
  { key: 'spd', label: '特防', api: 'special-defense' },
  { key: 'spe', label: '速度', api: 'speed' }
]

const pokedex = new PokeApiWrapper.Pokedex({ cache: true, timeout: 20_000 })

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
  const chineseName = speciesData.names.find((entry) => entry.language.name === 'zh-Hant')?.name
    ?? speciesData.names.find((entry) => entry.language.name === 'zh-Hans')?.name
    ?? speciesData.names.find((entry) => entry.language.name === 'ja-Hrkt')?.name
    ?? pokemonData.name

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
    nameEn: pokemonData.name,
    nameZh: chineseName,
    types: pokemonData.types
      .sort((a, b) => a.slot - b.slot)
      .map((item) => item.type.name),
    moves: pokemonData.moves.slice(0, 12).map((moveItem) => moveItem.move.name),
    baseStats
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
    loadingError.value = `資料載入失敗：${error?.message ?? '未知錯誤'}`
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
    return pokemon.nameZh.includes(keyword)
      || pokemon.nameEn.includes(keyword)
      || String(pokemon.id).includes(keyword)
  })
})

const filteredEnemyPool = computed(() => {
  const keyword = enemySearch.value.trim().toLowerCase()
  if (!keyword) {
    return pokemonPool.value
  }
  return pokemonPool.value.filter((pokemon) => {
    return pokemon.nameZh.includes(keyword)
      || pokemon.nameEn.includes(keyword)
      || String(pokemon.id).includes(keyword)
  })
})

function addToTeam(side, pokemon) {
  const member = {
    uid: `${pokemon.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: pokemon.id,
    nameZh: pokemon.nameZh,
    nameEn: pokemon.nameEn,
    types: pokemon.types,
    moves: pokemon.moves,
    stats: toStatBlock(pokemon.baseStats)
  }

  if (side === 'ally') {
    allyTeam.value = [...allyTeam.value, member]
    return
  }
  enemyTeam.value = [...enemyTeam.value, member]
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

onMounted(() => {
  fetchAllowedPokemonPool()
})
</script>

<template>
  <main class="battle-page">
    <header class="page-header">
      <h1 class="title">寶可夢對戰速查面板</h1>
      <p class="subtitle">左邊我方、右邊敵方，可先用中文搜尋並加入隊伍，種族值先保留位置、努力值可直接輸入。</p>
    </header>

    <section class="columns">
      <article class="team-panel">
        <h2 class="panel-title">我方</h2>
        <input
          v-model="allySearch"
          class="search-input"
          type="text"
          placeholder="輸入中文/英文/編號搜尋（例如：皮卡丘、pikachu、25）"
        />

        <p v-if="isLoadingPool" class="status-text">正在從 API 載入允許名單...</p>
        <p v-if="loadingError" class="status-text error">{{ loadingError }}</p>

        <div class="search-results">
          <button
            v-for="pokemon in filteredAllyPool"
            :key="`ally-${pokemon.id}`"
            class="result-item"
            type="button"
            @click="addToTeam('ally', pokemon)"
          >
            #{{ pokemon.id }} {{ pokemon.nameZh }}
          </button>
        </div>

        <div class="team-list">
          <section v-for="member in allyTeam" :key="member.uid" class="member-card">
            <h3 class="member-name">{{ member.nameZh }}</h3>
            <p class="meta-text">EN：{{ member.nameEn }}</p>
            <p class="meta-text">屬性：{{ member.types.join(' / ') }}</p>
            <p class="meta-text">招式：{{ member.moves.join('、') }}</p>
            <div class="stats-grid">
              <div v-for="stat in stats" :key="`${member.uid}-${stat.key}`" class="stat-row">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="base-value">種族值：{{ member.stats[stat.key].base }}</span>
                <label class="ev-input-wrap">
                  努力值
                  <input
                    class="ev-input"
                    type="number"
                    min="0"
                    :value="member.stats[stat.key].ev"
                    @input="updateEv('ally', member.uid, stat.key, Number($event.target.value))"
                  />
                </label>
                <span class="total-value">總值：{{ getTotalStat(member, stat.key) }}</span>
              </div>
            </div>
          </section>
        </div>
      </article>

      <article class="team-panel">
        <h2 class="panel-title">敵方</h2>
        <input
          v-model="enemySearch"
          class="search-input"
          type="text"
          placeholder="輸入中文/英文/編號搜尋（例如：烈咬陸鯊、garchomp、445）"
        />

        <p v-if="isLoadingPool" class="status-text">正在從 API 載入允許名單...</p>
        <p v-if="loadingError" class="status-text error">{{ loadingError }}</p>

        <div class="search-results">
          <button
            v-for="pokemon in filteredEnemyPool"
            :key="`enemy-${pokemon.id}`"
            class="result-item"
            type="button"
            @click="addToTeam('enemy', pokemon)"
          >
            #{{ pokemon.id }} {{ pokemon.nameZh }}
          </button>
        </div>

        <div class="team-list">
          <section v-for="member in enemyTeam" :key="member.uid" class="member-card">
            <h3 class="member-name">{{ member.nameZh }}</h3>
            <p class="meta-text">EN：{{ member.nameEn }}</p>
            <p class="meta-text">屬性：{{ member.types.join(' / ') }}</p>
            <p class="meta-text">招式：{{ member.moves.join('、') }}</p>
            <div class="stats-grid">
              <div v-for="stat in stats" :key="`${member.uid}-${stat.key}`" class="stat-row">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="base-value">種族值：{{ member.stats[stat.key].base }}</span>
                <label class="ev-input-wrap">
                  努力值
                  <input
                    class="ev-input"
                    type="number"
                    min="0"
                    :value="member.stats[stat.key].ev"
                    @input="updateEv('enemy', member.uid, stat.key, Number($event.target.value))"
                  />
                </label>
                <span class="total-value">總值：{{ getTotalStat(member, stat.key) }}</span>
              </div>
            </div>
          </section>
        </div>
      </article>
    </section>
  </main>
</template>
