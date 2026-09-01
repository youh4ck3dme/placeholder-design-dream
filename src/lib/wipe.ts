import { idbClear } from "./idb";

/**
 * Vymaže všetky lokálne dáta aplikácie (IndexedDB, localStorage, sessionStorage,
 * cache) tak, aby bolo možné začať s novým prípadom od nuly.
 */
export async function wipeAllAppData(): Promise<void> {
  try {
    await idbClear();
  } catch {
    /* IndexedDB nemusí byť dostupné */
  }

  if (typeof indexedDB !== "undefined" && "databases" in indexedDB) {
    try {
      const dbs = await indexedDB.databases();
      await Promise.all(
        dbs
          .map((db) => db.name)
          .filter((name): name is string => Boolean(name))
          .map(
            (name) =>
              new Promise<void>((resolve) => {
                const req = indexedDB.deleteDatabase(name);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
                req.onblocked = () => resolve();
              }),
          ),
      );
    } catch {
      /* ignore */
    }
  }

  try {
    const theme = localStorage.getItem("malte-theme");
    localStorage.clear();
    if (theme) localStorage.setItem("malte-theme", theme);
    sessionStorage.clear();
  } catch {
    /* ignore */
  }

  if (typeof caches !== "undefined") {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      /* ignore */
    }
  }
}
