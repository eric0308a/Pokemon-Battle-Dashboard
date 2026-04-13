import pokemonNameTranslationsJson from './pokemonNameTranslations.json'
import moveTranslationsJson from './moveTranslations.json'

const DEFAULT_LOCALE = 'en-US'

const supportedLocales = {
	'zh-TW': ['zh-tw', 'zh-hant', 'zh-hk', 'zh-mo', 'zh'],
	'en-US': ['en-us', 'en']
}

const localeMessages = {
	'zh-TW': {
		title: '寶可夢對戰速查面板',
		subtitle: '左邊我方、右邊敵方，可搜尋允許名單並加入隊伍。名稱、屬性、種族值與招式皆來自 PokeAPI。',
		allyPanel: '我方',
		enemyPanel: '敵方',
		searchPlaceholderAlly: '輸入中文/英文/編號搜尋（例如：皮卡丘、pikachu、25）',
		searchPlaceholderEnemy: '輸入中文/英文/編號搜尋（例如：烈咬陸鯊、garchomp、445）',
		loadingPool: '正在從 API 載入允許名單...',
		loadingFailed: '資料載入失敗',
		addPrefix: '加入',
		enNameLabel: '英文',
		natureLabel: '性格',
		natureEffectLabel: '性格效果',
		natureNeutralHint: '無增減',
		typeLabel: '屬性',
		moveLabel: '招式',
		moveOptionsLabel: '可選招式',
		moveSelectLabel: '已選招式',
		moveSlotLabel: '招式',
		removeMemberLabel: '刪除',
		baseStatLabel: '種族值',
		evLabel: '努力值',
		totalLabel: '總值'
	},
	'en-US': {
		title: 'Pokemon Battle Quick Dashboard',
		subtitle: 'Ally on the left and enemy on the right. Search from the allowed list and add members. Names, types, base stats, and moves come from PokeAPI.',
		allyPanel: 'Ally',
		enemyPanel: 'Enemy',
		searchPlaceholderAlly: 'Search by Chinese/English/ID (e.g. Pikachu, 25)',
		searchPlaceholderEnemy: 'Search by Chinese/English/ID (e.g. Garchomp, 445)',
		loadingPool: 'Loading allowed Pokemon list from API...',
		loadingFailed: 'Failed to load data',
		addPrefix: 'Add',
		enNameLabel: 'English',
		natureLabel: 'Nature',
		natureEffectLabel: 'Nature Effect',
		natureNeutralHint: 'No stat change',
		typeLabel: 'Type',
		moveLabel: 'Moves',
		moveOptionsLabel: 'Available Moves',
		moveSelectLabel: 'Selected Moves',
		moveSlotLabel: 'Move',
		removeMemberLabel: 'Remove',
		baseStatLabel: 'Base',
		evLabel: 'EV',
		totalLabel: 'Total'
	}
}

const statLabels = {
	hp: { 'zh-TW': 'HP', 'en-US': 'HP' },
	atk: { 'zh-TW': '攻擊', 'en-US': 'Attack' },
	spa: { 'zh-TW': '特攻', 'en-US': 'Sp. Atk' },
	def: { 'zh-TW': '防禦', 'en-US': 'Defense' },
	spd: { 'zh-TW': '特防', 'en-US': 'Sp. Def' },
	spe: { 'zh-TW': '速度', 'en-US': 'Speed' }
}

const typeLabels = {
	normal: { 'zh-TW': '一般', 'en-US': 'Normal' },
	fire: { 'zh-TW': '火', 'en-US': 'Fire' },
	water: { 'zh-TW': '水', 'en-US': 'Water' },
	electric: { 'zh-TW': '電', 'en-US': 'Electric' },
	grass: { 'zh-TW': '草', 'en-US': 'Grass' },
	ice: { 'zh-TW': '冰', 'en-US': 'Ice' },
	fighting: { 'zh-TW': '格鬥', 'en-US': 'Fighting' },
	poison: { 'zh-TW': '毒', 'en-US': 'Poison' },
	ground: { 'zh-TW': '地面', 'en-US': 'Ground' },
	flying: { 'zh-TW': '飛行', 'en-US': 'Flying' },
	psychic: { 'zh-TW': '超能力', 'en-US': 'Psychic' },
	bug: { 'zh-TW': '蟲', 'en-US': 'Bug' },
	rock: { 'zh-TW': '岩石', 'en-US': 'Rock' },
	ghost: { 'zh-TW': '幽靈', 'en-US': 'Ghost' },
	dragon: { 'zh-TW': '龍', 'en-US': 'Dragon' },
	dark: { 'zh-TW': '惡', 'en-US': 'Dark' },
	steel: { 'zh-TW': '鋼', 'en-US': 'Steel' },
	fairy: { 'zh-TW': '妖精', 'en-US': 'Fairy' }
}

const pokemonNameTranslations = new Map(
	Object.entries(pokemonNameTranslationsJson)
)

const moveTranslations = new Map(
	Object.entries(moveTranslationsJson)
)

function normalizeLocale(inputLocale) {
	const locale = String(inputLocale ?? '').toLowerCase()
	const matchedLocale = Object.keys(supportedLocales).find((code) => {
		return supportedLocales[code].some((pattern) => locale.startsWith(pattern))
	})
	return matchedLocale ?? DEFAULT_LOCALE
}

export function detectBrowserLocale() {
	if (typeof navigator === 'undefined') {
		return DEFAULT_LOCALE
	}

	if (Array.isArray(navigator.languages)) {
		for (const language of navigator.languages) {
			const normalized = normalizeLocale(language)
			if (normalized) {
				return normalized
			}
		}
	}
	return normalizeLocale(navigator.language)
}

export function getMessage(locale, key) {
	const resolvedLocale = normalizeLocale(locale)
	return localeMessages[resolvedLocale][key] ?? localeMessages[DEFAULT_LOCALE][key] ?? key
}

export function getStatLabel(locale, statKey) {
	const resolvedLocale = normalizeLocale(locale)
	return statLabels[statKey]?.[resolvedLocale] ?? statKey
}

export function getTypeLabel(locale, typeName) {
	const resolvedLocale = normalizeLocale(locale)
	const key = String(typeName ?? '').toLowerCase()
	return typeLabels[key]?.[resolvedLocale] ?? key
}

export function pickLocalizedName(names, locale, fallback) {
	const resolvedLocale = normalizeLocale(locale)
	const languageCode = resolvedLocale === 'zh-TW' ? 'zh-Hant' : 'en'
	return names.find((entry) => entry.language.name === languageCode)?.name
		?? names.find((entry) => entry.language.name === 'zh-Hans')?.name
		?? names.find((entry) => entry.language.name === 'en')?.name
		?? fallback
}

export function getDisplayPokemonName(locale, pokemon) {
	const resolvedLocale = normalizeLocale(locale)
	const key = String(pokemon.id ?? '')
	const translatedName = pokemonNameTranslations.get(key)

	if (translatedName) {
		if (resolvedLocale === 'zh-TW') {
			return translatedName.nameZh || translatedName.nameEn || pokemon.nameZh || pokemon.nameEn
		}
		return translatedName.nameEn || translatedName.nameZh || pokemon.nameEn || pokemon.nameZh
	}

	if (resolvedLocale === 'zh-TW') {
		return pokemon.nameZh || pokemon.nameEn
	}
	return pokemon.nameEn || pokemon.nameZh
}

export function registerPokemonNameTranslation(id, names) {
	const key = String(id)
	const existing = pokemonNameTranslations.get(key) ?? {}
	pokemonNameTranslations.set(key, {
		nameZh: names?.nameZh ?? existing.nameZh ?? '',
		nameEn: names?.nameEn ?? existing.nameEn ?? ''
	})
}

export function getPokemonLocalizedNames(id, fallbackNames = {}) {
	const key = String(id)
	const translatedName = pokemonNameTranslations.get(key) ?? {}

	return {
		nameZh: translatedName.nameZh || fallbackNames.nameZh || fallbackNames.nameEn || '',
		nameEn: translatedName.nameEn || fallbackNames.nameEn || fallbackNames.nameZh || ''
	}
}

export function getDisplayMoveName(locale, move) {
	const resolvedLocale = normalizeLocale(locale)
	if (resolvedLocale === 'zh-TW') {
		return move.nameZh || move.nameEn
	}
	return move.nameEn || move.nameZh
}

export function getMoveLocalizedNames(moveKey, fallbackNames = {}) {
	const key = String(moveKey ?? '').toLowerCase()
	const translated = moveTranslations.get(key) ?? {}

	return {
		nameZh: translated.nameZh || fallbackNames.nameZh || fallbackNames.nameEn || moveKey,
		nameEn: translated.nameEn || fallbackNames.nameEn || fallbackNames.nameZh || moveKey
	}
}

export function resolveLocale(locale) {
	return normalizeLocale(locale)
}
