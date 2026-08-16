'use client'

export type LangDef = { code: string; label: string }

export const LANGS: LangDef[] = [
  { code: 'en', label: 'English' },
  { code: 'ab', label: 'Abkhaz' },
  { code: 'ace', label: 'Acehnese' },
  { code: 'ach', label: 'Acholi' },
  { code: 'aa', label: 'Afar' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'sq', label: 'Albanian' },
  { code: 'alz', label: 'Alur' },
  { code: 'am', label: 'Amharic' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hy', label: 'Armenian' },
  { code: 'as', label: 'Assamese' },
  { code: 'av', label: 'Avar' },
  { code: 'awa', label: 'Awadhi' },
  { code: 'ay', label: 'Aymara' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'az-Arab', label: 'Azerbaijani (Arabic)' },
  { code: 'ban', label: 'Balinese' },
  { code: 'bal', label: 'Baluchi' },
  { code: 'bm', label: 'Bambara' },
  { code: 'bci', label: 'Baoule' },
  { code: 'ba', label: 'Bashkir' },
  { code: 'eu', label: 'Basque' },
  { code: 'btx', label: 'Batak Karo' },
  { code: 'bts', label: 'Batak Simalungun' },
  { code: 'bbc', label: 'Batak Toba' },
  { code: 'be', label: 'Belarusian' },
  { code: 'bem', label: 'Bemba' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ber', label: 'Berber' },
  { code: 'bew', label: 'Betawi' },
  { code: 'bho', label: 'Bhojpuri' },
  { code: 'bik', label: 'Bikol' },
  { code: 'bs', label: 'Bosnian' },
  { code: 'br', label: 'Breton' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'my', label: 'Burmese (Myanmar)' },
  { code: 'bua', label: 'Buryat' },
  { code: 'yue', label: 'Cantonese' },
  { code: 'ca', label: 'Catalan' },
  { code: 'ceb', label: 'Cebuano' },
  { code: 'ch', label: 'Chamorro' },
  { code: 'ce', label: 'Chechen' },
  { code: 'ny', label: 'Chichewa' },
  { code: 'zh-HK', label: 'Chinese (Hong Kong)' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
  { code: 'chk', label: 'Chuukese' },
  { code: 'cv', label: 'Chuvash' },
  { code: 'co', label: 'Corsican' },
  { code: 'crh', label: 'Crimean Tatar' },
  { code: 'hr', label: 'Croatian' },
  { code: 'cs', label: 'Czech' },
  { code: 'da', label: 'Danish' },
  { code: 'fa-AF', label: 'Dari' },
  { code: 'dv', label: 'Dhivehi' },
  { code: 'din', label: 'Dinka' },
  { code: 'doi', label: 'Dogri' },
  { code: 'dov', label: 'Dombe' },
  { code: 'nl', label: 'Dutch' },
  { code: 'dyu', label: 'Dyula' },
  { code: 'dz', label: 'Dzongkha' },
  { code: 'eo', label: 'Esperanto' },
  { code: 'et', label: 'Estonian' },
  { code: 'ee', label: 'Ewe' },
  { code: 'fo', label: 'Faroese' },
  { code: 'fj', label: 'Fijian' },
  { code: 'tl', label: 'Filipino / Tagalog' },
  { code: 'fi', label: 'Finnish' },
  { code: 'fon', label: 'Fon' },
  { code: 'fr', label: 'French' },
  { code: 'fr-CA', label: 'French (Canada)' },
  { code: 'fy', label: 'Frisian' },
  { code: 'fur', label: 'Friulian' },
  { code: 'ff', label: 'Fulani' },
  { code: 'gaa', label: 'Ga' },
  { code: 'gl', label: 'Galician' },
  { code: 'ka', label: 'Georgian' },
  { code: 'de', label: 'German' },
  { code: 'el', label: 'Greek' },
  { code: 'kl', label: 'Greenlandic' },
  { code: 'gn', label: 'Guarani' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ht', label: 'Haitian Creole' },
  { code: 'cnh', label: 'Hakha Chin' },
  { code: 'ha', label: 'Hausa' },
  { code: 'haw', label: 'Hawaiian' },
  { code: 'iw', label: 'Hebrew' },
  { code: 'hil', label: 'Hiligaynon' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hmn', label: 'Hmong' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'hrx', label: 'Hunsrik' },
  { code: 'iba', label: 'Iban' },
  { code: 'is', label: 'Icelandic' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ilo', label: 'Ilocano' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ga', label: 'Irish' },
  { code: 'it', label: 'Italian' },
  { code: 'jam', label: 'Jamaican Patois' },
  { code: 'ja', label: 'Japanese' },
  { code: 'jw', label: 'Javanese' },
  { code: 'kac', label: 'Jingpo' },
  { code: 'kn', label: 'Kannada' },
  { code: 'kr', label: 'Kanuri' },
  { code: 'pam', label: 'Kapampangan' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'km', label: 'Khmer' },
  { code: 'cgg', label: 'Kiga' },
  { code: 'kg', label: 'Kikongo' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'ktu', label: 'Kituba' },
  { code: 'trp', label: 'Kokborok' },
  { code: 'kv', label: 'Komi' },
  { code: 'gom', label: 'Konkani' },
  { code: 'ko', label: 'Korean' },
  { code: 'kri', label: 'Krio' },
  { code: 'ku', label: 'Kurdish (Kurmanji)' },
  { code: 'ckb', label: 'Kurdish (Sorani)' },
  { code: 'ky', label: 'Kyrgyz' },
  { code: 'lo', label: 'Lao' },
  { code: 'ltg', label: 'Latgalian' },
  { code: 'la', label: 'Latin' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lij', label: 'Ligurian' },
  { code: 'li', label: 'Limburgish' },
  { code: 'ln', label: 'Lingala' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'lmo', label: 'Lombard' },
  { code: 'lg', label: 'Luganda' },
  { code: 'luo', label: 'Luo' },
  { code: 'lb', label: 'Luxembourgish' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'mad', label: 'Madurese' },
  { code: 'mai', label: 'Maithili' },
  { code: 'mak', label: 'Makassar' },
  { code: 'mg', label: 'Malagasy' },
  { code: 'ms', label: 'Malay' },
  { code: 'ms-Arab', label: 'Malay (Jawi)' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mt', label: 'Maltese' },
  { code: 'mam', label: 'Mam' },
  { code: 'gv', label: 'Manx' },
  { code: 'mi', label: 'Maori' },
  { code: 'mr', label: 'Marathi' },
  { code: 'mh', label: 'Marshallese' },
  { code: 'mwr', label: 'Marwadi' },
  { code: 'mfe', label: 'Mauritian Creole' },
  { code: 'mhr', label: 'Meadow Mari' },
  { code: 'mni-Mtei', label: 'Meiteilon (Manipuri)' },
  { code: 'min', label: 'Minang' },
  { code: 'lus', label: 'Mizo' },
  { code: 'mn', label: 'Mongolian' },
  { code: 'nhe', label: 'Nahuatl (Eastern Huasteca)' },
  { code: 'nr', label: 'Ndebele (South)' },
  { code: 'new', label: 'Nepalbhasa (Newari)' },
  { code: 'ne', label: 'Nepali' },
  { code: 'no', label: 'Norwegian' },
  { code: 'nus', label: 'Nuer' },
  { code: 'oc', label: 'Occitan' },
  { code: 'or', label: 'Odia (Oriya)' },
  { code: 'om', label: 'Oromo' },
  { code: 'os', label: 'Ossetian' },
  { code: 'pag', label: 'Pangasinan' },
  { code: 'pap', label: 'Papiamento' },
  { code: 'ps', label: 'Pashto' },
  { code: 'fa', label: 'Persian / Farsi' },
  { code: 'pl', label: 'Polish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'pa-Arab', label: 'Punjabi (Shahmukhi)' },
  { code: 'kek', label: 'Qeqchi' },
  { code: 'qu', label: 'Quechua' },
  { code: 'rom', label: 'Romani' },
  { code: 'ro', label: 'Romanian' },
  { code: 'rn', label: 'Rundi' },
  { code: 'ru', label: 'Russian' },
  { code: 'se', label: 'Sami (North)' },
  { code: 'sm', label: 'Samoan' },
  { code: 'sg', label: 'Sango' },
  { code: 'sa', label: 'Sanskrit' },
  { code: 'sat', label: 'Santali' },
  { code: 'sat-Deva', label: 'Santali (Devanagari)' },
  { code: 'sat-Olck', label: 'Santali (Ol Chiki)' },
  { code: 'gd', label: 'Scots Gaelic' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'sr', label: 'Serbian' },
  { code: 'sr-Latn', label: 'Serbian (Latin)' },
  { code: 'st', label: 'Sesotho' },
  { code: 'shn', label: 'Shan' },
  { code: 'sn', label: 'Shona' },
  { code: 'scn', label: 'Sicilian' },
  { code: 'szl', label: 'Silesian' },
  { code: 'sd', label: 'Sindhi' },
  { code: 'sd-Deva', label: 'Sindhi (Devanagari)' },
  { code: 'si', label: 'Sinhala' },
  { code: 'sk', label: 'Slovak' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'so', label: 'Somali' },
  { code: 'es', label: 'Spanish' },
  { code: 'su', label: 'Sundanese' },
  { code: 'sus', label: 'Susu' },
  { code: 'sw', label: 'Swahili' },
  { code: 'ss', label: 'Swati' },
  { code: 'sv', label: 'Swedish' },
  { code: 'ty', label: 'Tahitian' },
  { code: 'tg', label: 'Tajik' },
  { code: 'ta', label: 'Tamil' },
  { code: 'tt', label: 'Tatar' },
  { code: 'te', label: 'Telugu' },
  { code: 'tet', label: 'Tetum' },
  { code: 'th', label: 'Thai' },
  { code: 'bo', label: 'Tibetan' },
  { code: 'ti', label: 'Tigrinya' },
  { code: 'tiv', label: 'Tiv' },
  { code: 'tpi', label: 'Tok Pisin' },
  { code: 'to', label: 'Tongan' },
  { code: 'ts', label: 'Tsonga' },
  { code: 'tn', label: 'Tswana' },
  { code: 'tcy', label: 'Tulu' },
  { code: 'tum', label: 'Tumbuka' },
  { code: 'tr', label: 'Turkish' },
  { code: 'tk', label: 'Turkmen' },
  { code: 'tyv', label: 'Tuvan' },
  { code: 'ak', label: 'Twi' },
  { code: 'udm', label: 'Udmurt' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'ur', label: 'Urdu' },
  { code: 'ug', label: 'Uyghur' },
  { code: 'uz', label: 'Uzbek' },
  { code: 've', label: 'Venda' },
  { code: 'vec', label: 'Venetian' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'war', label: 'Waray' },
  { code: 'cy', label: 'Welsh' },
  { code: 'wo', label: 'Wolof' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'sah', label: 'Yakut' },
  { code: 'yi', label: 'Yiddish' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'yua', label: 'Yucatec Maya' },
  { code: 'zap', label: 'Zapotec' },
  { code: 'zu', label: 'Zulu' },
]

export const LANG_EVENT = 'ott-lang-change'
const LANG_KEY = 'ott_lang'
const CACHE_KEY = 'ott_tcache_v1'

let cache: { [k: string]: string } = {}
let cacheLoaded = false

function loadCache() {
  if (cacheLoaded) return
  cacheLoaded = true
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (raw) cache = JSON.parse(raw) || {}
  } catch (e) { cache = {} }
}

let saveTimer: any = null
function saveCache() {
  if (typeof window === 'undefined') return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(function () {
    try {
      const keys = Object.keys(cache)
      if (keys.length > 4000) {
        const trimmed: { [k: string]: string } = {}
        keys.slice(keys.length - 3000).forEach(function (k) { trimmed[k] = cache[k] })
        cache = trimmed
      }
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch (e) {}
  }, 900)
}

export function getLang(): string {
  if (typeof window === 'undefined') return 'en'
  try {
    const v = window.localStorage.getItem(LANG_KEY)
    if (v) return v
  } catch (e) {}
  return 'en'
}

export function setLang(code: string) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LANG_KEY, code) } catch (e) {}
  try { window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: code })) } catch (e) {}
}

export function langLabel(code: string): string {
  for (let i = 0; i < LANGS.length; i++) { if (LANGS[i].code === code) return LANGS[i].label }
  return code
}

function ckey(text: string, from: string, to: string) { return from + '>' + to + '|' + text }

const TTS: { [k: string]: string } = {
  'en': 'en-US',
  'es': 'es-US',
  'fr': 'fr-FR',
  'fr-CA': 'fr-CA',
  'ht': 'fr-FR',
  'pt': 'pt-BR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pl': 'pl-PL',
  'ro': 'ro-RO',
  'ru': 'ru-RU',
  'uk': 'uk-UA',
  'tr': 'tr-TR',
  'ar': 'ar-SA',
  'fa': 'fa-IR',
  'fa-AF': 'fa-IR',
  'ur': 'ur-PK',
  'hi': 'hi-IN',
  'pa': 'pa-IN',
  'pa-Arab': 'pa-IN',
  'bn': 'bn-IN',
  'ne': 'ne-NP',
  'so': 'so-SO',
  'am': 'am-ET',
  'sw': 'sw-KE',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-HK',
  'yue': 'zh-HK',
  'vi': 'vi-VN',
  'ko': 'ko-KR',
  'ja': 'ja-JP',
  'th': 'th-TH',
  'my': 'my-MM',
  'tl': 'fil-PH',
  'iw': 'he-IL',
  'nl': 'nl-NL',
  'sv': 'sv-SE',
  'da': 'da-DK',
  'no': 'nb-NO',
  'fi': 'fi-FI',
  'cs': 'cs-CZ',
  'sk': 'sk-SK',
  'hu': 'hu-HU',
  'el': 'el-GR',
  'id': 'id-ID',
  'ms': 'ms-MY',
  'bg': 'bg-BG',
  'hr': 'hr-HR',
  'sr': 'sr-RS',
  'sr-Latn': 'sr-RS',
  'sl': 'sl-SI',
  'lt': 'lt-LT',
  'lv': 'lv-LV',
  'et': 'et-EE',
  'ca': 'ca-ES',
  'eu': 'eu-ES',
  'gl': 'gl-ES',
  'af': 'af-ZA',
  'sq': 'sq-AL',
  'is': 'is-IS',
  'mk': 'mk-MK',
  'az': 'az-AZ',
  'ka': 'ka-GE',
  'hy': 'hy-AM',
  'kk': 'kk-KZ',
  'uz': 'uz-UZ',
  'mn': 'mn-MN',
  'km': 'km-KH',
  'lo': 'lo-LA',
  'si': 'si-LK',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'gu': 'gu-IN',
  'mr': 'mr-IN',
  'or': 'or-IN',
  'as': 'as-IN',
  'sa': 'sa-IN',
  'zu': 'zu-ZA',
  'xh': 'xh-ZA',
  'st': 'st-ZA',
  'tn': 'tn-ZA',
  'yo': 'yo-NG',
  'ig': 'ig-NG',
  'ha': 'ha-NG',
  'cy': 'cy-GB',
  'ga': 'ga-IE',
  'gd': 'gd-GB',
  'mt': 'mt-MT',
}

export function ttsLang(code: string): string { return TTS[code] || code }

// Many languages have no built in voice on a phone. These groups say which
// voice sounds closest so the person still hears words they understand.
const NEAR_GROUPS: any[] = [
  ['zh-CN', ['wuu', 'za', 'gan', 'hsn', 'cjy']],
  ['zh-TW', ['nan', 'hak', 'zh-Hant']],
  ['zh-HK', ['yue']],
  ['nb-NO', ['nn', 'se', 'smj']],
  ['sv-SE', ['sma', 'scn-sv']],
  ['da-DK', ['fo', 'kl']],
  ['de-DE', ['lb', 'gsw', 'bar', 'yi', 'nds', 'pdc', 'li']],
  ['it-IT', ['sc', 'nap', 'scn', 'co', 'rm', 'fur', 'lij', 'vec', 'lmo', 'pms', 'la', 'ia']],
  ['fr-FR', ['oc', 'wa', 'ht', 'br', 'nrm', 'ln', 'sg', 'kg']],
  ['es-ES', ['an', 'ast', 'ext', 'lad', 'qu', 'ay', 'gn', 'nah', 'arn', 'eo']],
  ['pt-BR', ['pt', 'pap', 'cr-pt']],
  ['hr-HR', ['bs', 'sh']],
  ['sr-RS', ['cnr', 'me']],
  ['ru-RU', ['tt', 'ba', 'cv', 'ce', 'os', 'sah', 'udm', 'kv', 'mhr', 'myv', 'ky', 'tg', 'ab', 'kbd', 'av']],
  ['tr-TR', ['tk', 'crh', 'ug', 'ku', 'kmr']],
  ['fa-IR', ['ps', 'prs', 'ckb', 'lrc', 'mzn', 'glk']],
  ['ur-PK', ['sd', 'bal', 'ks', 'skr']],
  ['ar-SA', ['arz', 'ary', 'apc', 'acm', 'ars', 'aeb', 'ber', 'tzm', 'kab', 'shi']],
  ['hi-IN', ['bho', 'mai', 'awa', 'mag', 'raj', 'hne', 'doi', 'sat', 'brx', 'new', 'ne']],
  ['mr-IN', ['gom', 'kok']],
  ['bn-IN', ['mni', 'bpy']],
  ['si-LK', ['dv']],
  ['my-MM', ['shn', 'mnw']],
  ['km-KH', ['kha']],
  ['id-ID', ['jv', 'su', 'min', 'ban', 'ace', 'bug', 'mad', 'bjn', 'ms']],
  ['fil-PH', ['tl', 'ceb', 'hil', 'ilo', 'war', 'pam', 'bcl', 'pag', 'ch']],
  ['sw-KE', ['rw', 'rn', 'lg', 'sn', 'ny', 'lu', 'bem', 'kam', 'luo', 'mg']],
  ['am-ET', ['ti', 'om', 'aa', 'sid', 'wal']],
  ['so-SO', ['sso']],
  ['zu-ZA', ['ss', 'nr', 'nd']],
  ['st-ZA', ['nso', 've', 'ts', 'tn']],
  ['yo-NG', ['ak', 'tw', 'ee', 'fon']],
  ['ha-NG', ['ff', 'wo', 'bm', 'dyu', 'kr']],
  ['ig-NG', ['efi', 'ibb']],
  ['mi-NZ', ['ty', 'rar']],
  ['sm-WS', ['to', 'fj', 'haw', 'ty-pf']],
  ['he-IL', ['iw']],
  ['hy-AM', ['hyw']],
]

const NEAR: { [k: string]: string } = {}
for (let g = 0; g < NEAR_GROUPS.length; g++) {
  const target = String(NEAR_GROUPS[g][0])
  const list: string[] = NEAR_GROUPS[g][1]
  for (let n = 0; n < list.length; n++) NEAR[list[n]] = target
}

// These are the languages the reading voice can really speak.
const CLOUD_OK: string[] = [
  'sq', 'am', 'en', 'ar', 'af', 'eu', 'bn', 'bs', 'my', 'yue',
  'bg', 'ca', 'zh-HK', 'zh-CN', 'zh-TW', 'hr', 'da', 'cs', 'nl', 'et',
  'tl', 'fr-CA', 'fi', 'fr', 'gl', 'de', 'el', 'gu', 'ha', 'iw',
  'hi', 'hu', 'is', 'ja', 'it', 'id', 'kn', 'jw', 'km', 'ko',
  'la', 'lv', 'lt', 'ms-Arab', 'ms', 'ml', 'mr', 'ne', 'no', 'pl',
  'pt', 'pa-Arab', 'pa', 'ro', 'ru', 'sr-Latn', 'sr', 'sk', 'si', 'es',
  'su', 'sw', 'sv', 'te', 'ta', 'th', 'tr', 'uk', 'vi', 'ur',
  'cy',
]

// For every other language, this is the voice that comes closest in sound,
// so the words still come out in a way the person can follow.
const CLOUD_NEAR: { [k: string]: string } = {
  'ace': 'id', 'aa': 'sw', 'alz': 'sw', 'ab': 'ru', 'ach': 'sw',
  'av': 'ru', 'as': 'bn', 'awa': 'hi', 'az': 'tr', 'ay': 'es',
  'az-Arab': 'ur', 'bm': 'fr', 'bal': 'ur', 'ban': 'id', 'bci': 'fr',
  'ba': 'ru', 'bbc': 'id', 'btx': 'id', 'bts': 'id', 'be': 'ru',
  'bem': 'sw', 'bew': 'id', 'ber': 'ar', 'bho': 'hi', 'bik': 'tl',
  'bua': 'ru', 'br': 'fr', 'ce': 'ru', 'ch': 'es', 'ny': 'sw',
  'ceb': 'tl', 'chk': 'tl', 'co': 'it', 'crh': 'tr', 'cv': 'ru',
  'fa-AF': 'ur', 'din': 'sw', 'doi': 'hi', 'dyu': 'fr', 'dov': 'sw',
  'eo': 'es', 'fj': 'id', 'ee': 'sw', 'fo': 'da', 'fy': 'nl',
  'fon': 'fr', 'fur': 'it', 'ff': 'sw', 'gaa': 'sw', 'kl': 'da',
  'ht': 'fr', 'gn': 'es', 'haw': 'id', 'cnh': 'id', 'hil': 'tl',
  'hmn': 'id', 'iba': 'ms', 'hrx': 'de', 'ig': 'sw', 'ilo': 'tl',
  'ga': 'en', 'jam': 'en', 'kac': 'id', 'pam': 'tl', 'kr': 'ha',
  'kk': 'ru', 'cgg': 'sw', 'kg': 'sw', 'rw': 'sw', 'ktu': 'sw',
  'trp': 'bn', 'gom': 'mr', 'kv': 'ru', 'ckb': 'ur', 'ku': 'tr',
  'kri': 'en', 'ltg': 'lv', 'ky': 'ru', 'lij': 'it', 'li': 'nl',
  'ln': 'sw', 'lmo': 'it', 'luo': 'sw', 'lg': 'sw', 'lb': 'de',
  'mad': 'id', 'mk': 'sr', 'mai': 'hi', 'mak': 'id', 'mg': 'id',
  'mt': 'it', 'mam': 'es', 'gv': 'en', 'mfe': 'fr', 'mi': 'id',
  'mwr': 'hi', 'mni-Mtei': 'bn', 'mhr': 'ru', 'mh': 'id', 'min': 'id',
  'lus': 'id', 'nhe': 'es', 'mn': 'ru', 'nr': 'sw', 'new': 'ne',
  'nus': 'sw', 'oc': 'fr', 'om': 'sw', 'os': 'ru', 'pap': 'es',
  'pag': 'tl', 'ps': 'ur', 'fa': 'ur', 'kek': 'es', 'qu': 'es',
  'rom': 'ro', 'sm': 'id', 'rn': 'sw', 'se': 'no', 'sg': 'fr',
  'sat-Deva': 'hi', 'sa': 'hi', 'gd': 'en', 'nso': 'sw', 'sn': 'sw',
  'st': 'sw', 'shn': 'my', 'scn': 'it', 'sd': 'ur', 'sd-Deva': 'hi',
  'szl': 'pl', 'sl': 'hr', 'so': 'sw', 'sus': 'fr', 'ss': 'sw',
  'ty': 'id', 'tg': 'ru', 'tt': 'ru', 'ti': 'am', 'tet': 'id',
  'tpi': 'en', 'tiv': 'sw', 'to': 'id', 'ts': 'sw', 'tcy': 'kn',
  'tum': 'sw', 'tn': 'sw', 'tk': 'tr', 'tyv': 'ru', 'udm': 'ru',
  'ak': 'sw', 'ug': 'ur', 'vec': 'it', 'uz': 'tr', 've': 'sw',
  'war': 'tl', 'sah': 'ru', 'wo': 'fr', 'xh': 'sw', 'yi': 'iw',
  'yo': 'sw', 'yua': 'es', 'zu': 'sw', 'zap': 'es',
}

function cloudCode(code: string): string {
  const c = String(code || 'en')
  for (let i = 0; i < CLOUD_OK.length; i++) { if (CLOUD_OK[i] === c) return c }
  if (CLOUD_NEAR[c]) return CLOUD_NEAR[c]
  const b = c.split('-')[0]
  for (let i = 0; i < CLOUD_OK.length; i++) { if (CLOUD_OK[i] === b) return b }
  if (CLOUD_NEAR[b]) return CLOUD_NEAR[b]
  return ''
}

function nearLang(code: string): string {
  const c = String(code || 'en')
  if (NEAR[c]) return NEAR[c]
  const b = c.split('-')[0]
  if (NEAR[b]) return NEAR[b]
  return ttsLang(c)
}

export function canSpeak(): boolean {
  if (typeof window === 'undefined') return false
  if ((window as any).speechSynthesis && (window as any).SpeechSynthesisUtterance) return true
  return !!(window as any).Audio
}

let cloudAudio: any = null
let speakToken = 0

const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

// A tap or a key press wakes the sound up. Phones will not talk before that.
export function primeVoice() {
  if (typeof window === 'undefined') return
  try {
    const sy: any = (window as any).speechSynthesis
    if (sy && (window as any).SpeechSynthesisUtterance) {
      const u: any = new (window as any).SpeechSynthesisUtterance(' ')
      u.volume = 0
      sy.speak(u)
    }
  } catch (e) {}
  try {
    if (!cloudAudio) cloudAudio = new (window as any).Audio()
    cloudAudio.muted = true
    cloudAudio.src = SILENT
    const p = cloudAudio.play()
    const done = function () { try { cloudAudio.pause(); cloudAudio.muted = false } catch (e2) {} }
    if (p && p.then) p.then(done).catch(done)
    else done()
  } catch (e) {}
}

export function stopSpeaking() {
  if (typeof window === 'undefined') return
  speakToken = speakToken + 1
  try {
    const sy: any = (window as any).speechSynthesis
    if (sy) sy.cancel()
  } catch (e) {}
  try {
    if (cloudAudio) {
      cloudAudio.onended = null
      cloudAudio.onerror = null
      cloudAudio.pause()
    }
  } catch (e) {}
}

function voiceFor(want: string): any {
  try {
    const sy: any = (window as any).speechSynthesis
    if (!sy || !sy.getVoices) return null
    const vs: any[] = sy.getVoices() || []
    const wl = String(want || '').toLowerCase().split('_').join('-')
    if (!wl) return null
    const base = wl.split('-')[0]
    for (let i = 0; i < vs.length; i++) {
      const vl = String(vs[i].lang || '').toLowerCase().split('_').join('-')
      if (vl === wl) return vs[i]
    }
    for (let i = 0; i < vs.length; i++) {
      const vl = String(vs[i].lang || '').toLowerCase().split('_').join('-')
      if (vl.split('-')[0] === base) return vs[i]
    }
    return null
  } catch (e) { return null }
}

function deviceSay(text: string, want: string, v: any) {
  try {
    const sy: any = (window as any).speechSynthesis
    if (!sy || !(window as any).SpeechSynthesisUtterance) return
    const u: any = new (window as any).SpeechSynthesisUtterance(text)
    u.lang = v && v.lang ? v.lang : want
    if (v) u.voice = v
    u.rate = 0.98
    u.pitch = 1
    u.volume = 1
    sy.speak(u)
  } catch (e) {}
}

function chunkText(t: string): string[] {
  const words = String(t || '').split(' ')
  const out: string[] = []
  let cur = ''
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (!w) continue
    if (cur.length > 0 && (cur + ' ' + w).length > 170) { out.push(cur); cur = w }
    else cur = cur.length > 0 ? cur + ' ' + w : w
  }
  if (cur.length > 0) out.push(cur)
  return out
}

function cloudUrl(text: string, code: string, alt: boolean): string {
  const q = encodeURIComponent(text)
  const full = String(code || 'en')
  const tl = encodeURIComponent(alt ? full.split('-')[0] : full)
  return '/api/say\u003Ftl=' + tl + '&q=' + q
}

// Reads it with a voice from the internet when the phone has no voice of its own.
function cloudSay(parts: string[], code: string, token: number, onFail: any) {
  if (typeof window === 'undefined') return
  if (!parts || parts.length === 0) return
  let idx = 0
  let alt = false
  let any = false
  try {
    if (!cloudAudio) cloudAudio = new (window as any).Audio()
  } catch (e) { onFail(); return }
  const a: any = cloudAudio
  const fail = function () {
    if (token !== speakToken) return
    if (!alt) { alt = true; play(); return }
    if (any) return
    onFail()
  }
  const play = function () {
    if (token !== speakToken) return
    if (idx >= parts.length) return
    try {
      a.src = cloudUrl(parts[idx], code, alt)
      a.muted = false
      a.volume = 1
      const p = a.play()
      if (p && p.catch) p.catch(function () { fail() })
    } catch (e) { fail() }
  }
  a.onended = function () {
    if (token !== speakToken) return
    any = true
    idx = idx + 1
    alt = false
    if (idx < parts.length) play()
  }
  a.onerror = function () { fail() }
  play()
}

export function speak(text: string, code: string) {
  if (typeof window === 'undefined') return
  const body = String(text || '').trim()
  if (!body) return
  stopSpeaking()
  speakToken = speakToken + 1
  const token = speakToken
  const lang = String(code || 'en')
  const want = ttsLang(lang)
  const near = nearLang(lang)
  const cc = cloudCode(lang)
  const fallBack = function () {
    if (token !== speakToken) return
    const back = voiceFor(near)
    deviceSay(body, back ? String(back.lang) : want, back)
  }
  const go = function () {
    if (token !== speakToken) return
    const own = voiceFor(want)
    if (own) { deviceSay(body, want, own); return }
    if (cc) { cloudSay(chunkText(body), cc, token, fallBack); return }
    fallBack()
  }
  try {
    const sy: any = (window as any).speechSynthesis
    if (sy && sy.getVoices && (sy.getVoices() || []).length === 0) {
      let fired = false
      const once = function () { if (fired) return; fired = true; go() }
      sy.onvoiceschanged = once
      setTimeout(once, 350)
      return
    }
  } catch (e) {}
  go()
}

// Turns the words into the person's own language first, then says them out loud.
export async function speakTranslated(text: string, code: string) {
  const body = String(text || '').trim()
  if (!body) return
  const to = String(code || 'en')
  let out = body
  if (to && to !== 'en') {
    try { out = await translateText(body, to, 'en') } catch (e) { out = body }
  }
  speak(out, to)
}

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single'

async function callGoogle(q: string, from: string, to: string): Promise<{ text: string; src: string }> {
  const url = ENDPOINT + '\u003Fclient=gtx&dt=t&dj=1&sl=' + encodeURIComponent(from || 'auto') + '&tl=' + encodeURIComponent(to) + '&q=' + encodeURIComponent(q)
  const r = await fetch(url)
  if (!r.ok) throw new Error('translate failed')
  const j: any = await r.json()
  const arr: any[] = j && j.sentences ? j.sentences : []
  let outStr = ''
  for (let i = 0; i < arr.length; i++) { outStr += arr[i] && arr[i].trans ? arr[i].trans : '' }
  return { text: outStr, src: String((j && j.src) || from || 'en') }
}

export async function detectLang(text: string): Promise<string> {
  if (typeof window === 'undefined') return 'en'
  if (!text || !text.trim()) return 'en'
  try {
    const r = await callGoogle(text.slice(0, 300), 'auto', 'en')
    return r.src || 'en'
  } catch (e) { return 'en' }
}

export async function translateBatch(texts: string[], to: string, from?: string): Promise<string[]> {
  const target = to || 'en'
  const src = from || 'auto'
  const out = texts.slice()
  if (typeof window === 'undefined') return out
  if (src !== 'auto' && src === target) return out
  loadCache()
  const need: number[] = []
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i]
    if (!t || !t.trim()) continue
    const k = ckey(t, src, target)
    if (typeof cache[k] === 'string') { out[i] = cache[k]; continue }
    need.push(i)
  }
  const chunks: number[][] = []
  let cur: number[] = []
  let len = 0
  for (let n = 0; n < need.length; n++) {
    const i = need[n]
    const l = texts[i].length + 1
    if (cur.length > 0 && (len + l > 1100 || cur.length >= 40)) { chunks.push(cur); cur = []; len = 0 }
    cur.push(i)
    len += l
  }
  if (cur.length > 0) chunks.push(cur)
  for (let c = 0; c < chunks.length; c++) {
    const grp = chunks[c]
    const q = grp.map(function (i) { return texts[i].split('\r').join(' ').split('\n').join(' ') }).join('\n')
    try {
      const res = await callGoogle(q, src, target)
      const parts = res.text.split('\n')
      if (parts.length === grp.length) {
        for (let n = 0; n < grp.length; n++) {
          const val = parts[n]
          if (typeof val !== 'string' || val.length === 0) continue
          out[grp[n]] = val
          cache[ckey(texts[grp[n]], src, target)] = val
        }
      } else {
        for (let n = 0; n < grp.length; n++) {
          const one = texts[grp[n]].split('\r').join(' ').split('\n').join(' ')
          try {
            const r2 = await callGoogle(one, src, target)
            if (r2.text) { out[grp[n]] = r2.text; cache[ckey(texts[grp[n]], src, target)] = r2.text }
          } catch (e2) {}
        }
      }
    } catch (e) {}
  }
  saveCache()
  return out
}

export async function translateText(text: string, to: string, from?: string): Promise<string> {
  const r = await translateBatch([text], to, from)
  return r && typeof r[0] === 'string' ? r[0] : text
}
