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
		typeDefenseLabel: '防守克制',
		typeAttackLabel: '攻擊克制',
		typeStrongLabel: '效果絕佳',
		typeWeakLabel: '效果不理想',
		typeNoEffectLabel: '無效',
		typeDoubleWeakLabel: '4 倍弱點',
		typeDoubleResistLabel: '4 倍抵抗',
		typeWeaknessLabel: '弱點',
		typeResistanceLabel: '抵抗',
		typeImmunityLabel: '免疫',
		typeNoneLabel: '無',
		typeLabel: '屬性',
		moveLabel: '招式',
		moveOptionsLabel: '可選招式',
		moveSelectLabel: '已選招式',
		moveSlotLabel: '招式',
		removeMemberLabel: '刪除',
		baseStatLabel: '種族值',
		evLabel: '努力值',
		totalLabel: '總值',
		weatherLabel: '環境天氣',
		weatherNone: '無天氣',
		weatherSun: '晴天',
		weatherRain: '雨天',
		weatherSand: '沙暴',
		weatherSnow: '降雪',
		weatherActiveLabel: '目前天氣',
		detailMenuTitle: '視覺化細節選單',
		detailMenuShow: '展開',
		detailMenuHide: '收合',
		settingCompactMode: '啟用簡潔模式（更緊湊）',
		settingWeatherPanel: '顯示天氣面板',
		settingEnglishName: '顯示英文名稱',
		settingNatureHint: '顯示性格效果提示',
		settingDefenseSummary: '顯示防守克制摘要',
		settingMoveCatalog: '顯示可選招式總表',
		settingMoveHints: '顯示招式克制提示',
		settingStatsPanel: '顯示數值調整區（EV/總值）',
		settingAnalysisPanel: '顯示全隊聯防分析',
		weatherSunRule: '晴天下，火系招式威力提升，水系招式威力下降。',
		weatherRainRule: '雨天下，水系招式威力提升，火系招式威力下降。',
		weatherSunWaterHint: '你是水屬性，晴天有助於降低水招傷害風險。',
		weatherRainFireHint: '你是火屬性，雨天有助於降低火招傷害風險。',
		weatherSandRockHint: '你是岩石屬性，沙暴可提供特防加成。',
		weatherSnowIceHint: '你是冰屬性，降雪可提供防禦加成。',
		speedLineTitle: '速度線（出手順序）',
		speedLineNeedMembers: '請先加入寶可夢，系統會依速度總值排序出手順序。',
		speedLineValue: '速度',
		speedStageLabel: '速度階級',
		speedAbilityLabel: '速度加速倍率',
		speedAbilityNone: '無加速（x1）',
		speedAbilityBoost15: '特性/道具加速（x1.5）',
		speedAbilityBoost20: '高速爆發（x2）',
		speedParalyzedLabel: '麻痺（速度減半）',
		speedTailwindAlly: '我方順風（x2）',
		speedTailwindEnemy: '敵方順風（x2）',
		speedTrickRoom: '戲法空間（速度倒序）',
		speedTieHint: '同速時將依對戰規則隨機決定先後（同速抽速）。',
		speedTieTag: '同速隨機',
		analysisTitle: '全隊聯防盲點分析',
		analysisNeedMembers: '至少加入 2 隻我方寶可夢後，才會顯示盲點分析。',
		analysisNoBlindSpot: '目前沒有發現 2 隻以上同時懼怕的明顯屬性盲點。',
		analysisBlindSpotPrefix: '盲點：',
		analysisBlindSpotSuffix: ' 同時懼怕 ',
		recommendationTitle: '建議補位（可抵抗）',
		recommendationEmpty: '目前沒有找到可抵抗此弱點的補位候選。'
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
		typeDefenseLabel: 'Defense Matchups',
		typeAttackLabel: 'Attack Matchups',
		typeStrongLabel: 'Super Effective',
		typeWeakLabel: 'Not Very Effective',
		typeNoEffectLabel: 'No Effect',
		typeDoubleWeakLabel: '4x Weakness',
		typeDoubleResistLabel: '4x Resistance',
		typeWeaknessLabel: 'Weakness',
		typeResistanceLabel: 'Resistance',
		typeImmunityLabel: 'Immunity',
		typeNoneLabel: 'None',
		typeLabel: 'Type',
		moveLabel: 'Moves',
		moveOptionsLabel: 'Available Moves',
		moveSelectLabel: 'Selected Moves',
		moveSlotLabel: 'Move',
		removeMemberLabel: 'Remove',
		baseStatLabel: 'Base',
		evLabel: 'EV',
		totalLabel: 'Total',
		weatherLabel: 'Battle Weather',
		weatherNone: 'No Weather',
		weatherSun: 'Sunny',
		weatherRain: 'Rain',
		weatherSand: 'Sandstorm',
		weatherSnow: 'Snow',
		weatherActiveLabel: 'Active Weather',
		detailMenuTitle: 'Visualization Detail Menu',
		detailMenuShow: 'Expand',
		detailMenuHide: 'Collapse',
		settingCompactMode: 'Enable compact mode',
		settingWeatherPanel: 'Show weather panel',
		settingEnglishName: 'Show English names',
		settingNatureHint: 'Show nature effect hints',
		settingDefenseSummary: 'Show defensive matchup summary',
		settingMoveCatalog: 'Show move catalog summary',
		settingMoveHints: 'Show move matchup hints',
		settingStatsPanel: 'Show stat tuning panel (EV/Total)',
		settingAnalysisPanel: 'Show team defensive analysis',
		weatherSunRule: 'Under sun, Fire moves are stronger and Water moves are weaker.',
		weatherRainRule: 'Under rain, Water moves are stronger and Fire moves are weaker.',
		weatherSunWaterHint: 'As a Water type, sun helps reduce incoming Water move pressure.',
		weatherRainFireHint: 'As a Fire type, rain helps reduce incoming Fire move pressure.',
		weatherSandRockHint: 'As a Rock type, sandstorm grants a Special Defense boost.',
		weatherSnowIceHint: 'As an Ice type, snow grants a Defense boost.',
		speedLineTitle: 'Speed Line (Turn Order)',
		speedLineNeedMembers: 'Add Pokemon first. Turn order will be sorted by total Speed.',
		speedLineValue: 'Speed',
		speedStageLabel: 'Speed Stage',
		speedAbilityLabel: 'Speed Multiplier',
		speedAbilityNone: 'No boost (x1)',
		speedAbilityBoost15: 'Ability/Item boost (x1.5)',
		speedAbilityBoost20: 'Burst boost (x2)',
		speedParalyzedLabel: 'Paralyzed (half Speed)',
		speedTailwindAlly: 'Ally Tailwind (x2)',
		speedTailwindEnemy: 'Enemy Tailwind (x2)',
		speedTrickRoom: 'Trick Room (reverse order)',
		speedTieHint: 'When speeds tie, order is randomized by tie-break rules.',
		speedTieTag: 'Random Tie',
		analysisTitle: 'Team Defensive Blind-Spot Analysis',
		analysisNeedMembers: 'Add at least 2 ally Pokemon to generate blind-spot analysis.',
		analysisNoBlindSpot: 'No obvious shared weakness found across 2 or more allies.',
		analysisBlindSpotPrefix: 'Blind spot:',
		analysisBlindSpotSuffix: ' are all weak to ',
		recommendationTitle: 'Suggested Defensive Picks (resist)',
		recommendationEmpty: 'No defensive candidate currently resists this weakness.'
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
		nameEn: translated.nameEn || fallbackNames.nameEn || fallbackNames.nameZh || moveKey,
		typeKey: translated.typeKey || fallbackNames.typeKey || ''
	}
}

export function resolveLocale(locale) {
	return normalizeLocale(locale)
}
