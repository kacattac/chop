let dictionary: Set<string> | null = null;
let loadPromise: Promise<Set<string>> | null = null;

/** Loads the bundled English word list (public/words.txt) once and caches it. */
export function loadDictionary(): Promise<Set<string>> {
  if (dictionary) return Promise.resolve(dictionary);
  if (loadPromise) return loadPromise;

  loadPromise = fetch(`${import.meta.env.BASE_URL}words.txt`)
    .then((res) => res.text())
    .then((text) => {
      const words = text.split("\n").map((w) => w.trim()).filter(Boolean);
      dictionary = new Set(words);
      return dictionary;
    });

  return loadPromise;
}

export function getDictionarySync(): Set<string> | null {
  return dictionary;
}
