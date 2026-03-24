// Phoneme inventories per language supported on the site.
// Each entry contains the language id (matching i18n codes) and
// an array of phoneme symbols commonly assessed in speech therapy.

export interface PhonemeLanguage {
  id: string;
  labelKey: string;
  phonemes: string[];
}

export const PHONEME_LANGUAGES: PhonemeLanguage[] = [
  {
    id: "ru",
    labelKey: "phonemes.langRussian",
    phonemes: [
      "а/ɑ","б/b","в/v","г/ɡ","д/d","е/e","ж/ʒ","з/z",
"и/i","к/k","л/l","м/m","н/n","о/o","п/p","р/r",
"с/s","т/t","у/u","ф/f","х/x","ц/ts","ч/tɕ","ш/ʃ","щ/ɕː"
    ]
  },
  {
    id: "kk",
    labelKey: "phonemes.langKazakh",
    phonemes: [
"а/ɑ","ә/æ","б/b","в/v","г/ɡ","ғ/ʁ","д/d","е/e",
"ж/ʒ","з/z","и/ɪ","й/j","к/k","қ/q","л/l","м/m",
"н/n","ң/ŋ","о/o","ө/ø","п/p","р/r","с/s","т/t",
"у/u","ұ/ʊ","ү/ʏ","ф/f","х/χ","ш/ʃ"
    ],
  },
];
