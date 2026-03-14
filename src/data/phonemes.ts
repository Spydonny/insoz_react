// Phoneme inventories per language supported on the site.
// Each entry contains the language id (matching i18n codes) and
// an array of phoneme symbols commonly assessed in speech therapy.

export interface PhonemeLanguage {
  id: string;
  labelKey: string; // i18n key for the language name
  phonemes: string[];
}

export const PHONEME_LANGUAGES: PhonemeLanguage[] = [
  {
    id: "en",
    labelKey: "phonemes.langEnglish",
    phonemes: [
      "p", "b", "t", "d", "k", "g",
      "f", "v", "θ", "ð",
      "s", "z", "ʃ", "ʒ",
      "h", "tʃ", "dʒ",
      "m", "n", "ŋ",
      "l", "r", "w", "j",
    ],
  },
  {
    id: "ru",
    labelKey: "phonemes.langRussian",
    phonemes: [
      "а", "б", "в", "г", "д", "е", "ж", "з",
      "и", "к", "л", "м", "н", "о", "п", "р",
      "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ",
    ],
  },
  {
    id: "kk",
    labelKey: "phonemes.langKazakh",
    phonemes: [
      "а", "ә", "б", "в", "г", "ғ", "д", "е",
      "ж", "з", "и", "й", "к", "қ", "л", "м",
      "н", "ң", "о", "ө", "п", "р", "с", "т",
      "у", "ұ", "ү", "ф", "х", "ш",
    ],
  },
  {
    id: "tr",
    labelKey: "phonemes.langTurkish",
    phonemes: [
      "a", "b", "c", "ç", "d", "e", "f", "g",
      "ğ", "h", "ı", "i", "j", "k", "l", "m",
      "n", "o", "ö", "p", "r", "s", "ş", "t",
      "u", "ü", "v", "y", "z",
    ],
  },
];
