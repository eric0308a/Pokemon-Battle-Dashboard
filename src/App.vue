<script setup>
import { computed, shallowRef } from 'vue'

const stats = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: '攻擊' },
  { key: 'spa', label: '特攻' },
  { key: 'def', label: '防禦' },
  { key: 'spd', label: '特防' },
  { key: 'spe', label: '速度' }
]

const pokemonPool = [
  { id: '001', nameZh: '妙蛙種子' },
  { id: '004', nameZh: '小火龍' },
  { id: '007', nameZh: '傑尼龜' },
  { id: '025', nameZh: '皮卡丘' },
  { id: '133', nameZh: '伊布' },
  { id: '143', nameZh: '卡比獸' },
  { id: '149', nameZh: '快龍' },
  { id: '196', nameZh: '太陽伊布' },
  { id: '248', nameZh: '班基拉斯' },
  { id: '445', nameZh: '烈咬陸鯊' },
  { id: '448', nameZh: '路卡利歐' },
  { id: '700', nameZh: '仙子伊布' }
]

const allySearch = shallowRef('')
const enemySearch = shallowRef('')
const allyTeam = shallowRef([])
const enemyTeam = shallowRef([])

function createStatBlock() {
  return {
    hp: { base: 0, ev: 0 },
    atk: { base: 0, ev: 0 },
    spa: { base: 0, ev: 0 },
    def: { base: 0, ev: 0 },
    spd: { base: 0, ev: 0 },
    spe: { base: 0, ev: 0 }
  }
}

const filteredAllyPool = computed(() => {
  const keyword = allySearch.value.trim()
  if (!keyword) {
    return pokemonPool
  }
  return pokemonPool.filter((pokemon) => pokemon.nameZh.includes(keyword))
})

const filteredEnemyPool = computed(() => {
  const keyword = enemySearch.value.trim()
  if (!keyword) {
    return pokemonPool
  }
  return pokemonPool.filter((pokemon) => pokemon.nameZh.includes(keyword))
})

function addToTeam(side, pokemon) {
  const member = {
    uid: `${pokemon.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: pokemon.id,
    nameZh: pokemon.nameZh,
    stats: createStatBlock()
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
          placeholder="輸入中文名稱搜尋（例如：皮卡丘）"
        />

        <div class="search-results">
          <button
            v-for="pokemon in filteredAllyPool"
            :key="`ally-${pokemon.id}`"
            class="result-item"
            type="button"
            @click="addToTeam('ally', pokemon)"
          >
            加入 {{ pokemon.nameZh }}
          </button>
        </div>

        <div class="team-list">
          <section v-for="member in allyTeam" :key="member.uid" class="member-card">
            <h3 class="member-name">{{ member.nameZh }}</h3>
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
          placeholder="輸入中文名稱搜尋（例如：烈咬陸鯊）"
        />

        <div class="search-results">
          <button
            v-for="pokemon in filteredEnemyPool"
            :key="`enemy-${pokemon.id}`"
            class="result-item"
            type="button"
            @click="addToTeam('enemy', pokemon)"
          >
            加入 {{ pokemon.nameZh }}
          </button>
        </div>

        <div class="team-list">
          <section v-for="member in enemyTeam" :key="member.uid" class="member-card">
            <h3 class="member-name">{{ member.nameZh }}</h3>
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
