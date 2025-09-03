export class processStore {
  #instance: processStore | undefined;
  store: Record<string, () => void> = {};

  constructor() {
    if (!this.#instance) {
      this.#instance = this;
    }
    return this.#instance;
  }

  push = (key: string, callback: () => void) => (this.store[key] = callback);
  pop = (key: string) => {
    if (this.store[key]) {
      this.store[key]?.();
      delete this.store[key];
    }
  };
}
