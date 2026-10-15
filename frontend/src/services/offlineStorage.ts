import { SavedRoadmap } from '../types';

const DB_NAME = 'ArohanOfflineDB';
const DB_VERSION = 1;
const ROADMAP_STORE = 'cached_roadmaps';

export class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(ROADMAP_STORE)) {
          db.createObjectStore(ROADMAP_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async cacheRoadmap(roadmap: SavedRoadmap): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(ROADMAP_STORE, 'readwrite');
      const store = tx.objectStore(ROADMAP_STORE);
      store.put({
        ...roadmap,
        cachedAt: new Date().toISOString()
      });
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Could not cache roadmap to IndexedDB', e);
    }
  }

  async getCachedRoadmaps(): Promise<SavedRoadmap[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(ROADMAP_STORE, 'readonly');
      const store = tx.objectStore(ROADMAP_STORE);
      const req = store.getAll();

      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Could not retrieve cached roadmaps', e);
      return [];
    }
  }

  async getCachedRoadmap(id: number): Promise<SavedRoadmap | null> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(ROADMAP_STORE, 'readonly');
      const store = tx.objectStore(ROADMAP_STORE);
      const req = store.get(id);

      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Could not retrieve cached roadmap', e);
      return null;
    }
  }
}

export const offlineStorage = new OfflineStorage();
