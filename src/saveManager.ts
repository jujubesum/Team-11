export interface SaveData {
	version: number;
	level: number;
	money: number;
	unlockedRecipeIds: string[];
	customizations: string[];
	createdAt: number;
	lastSavedAt: number;
}

export const SAVE_KEY = "bakeryGameSave";
export const SAVE_VERSION = 1;
export const STARTING_MONEY = 100;

export function createDefaultSave(): SaveData {
	const now = Date.now();
	return {
		version: SAVE_VERSION,
		level: 1,
		money: STARTING_MONEY,
		unlockedRecipeIds: ["recipe_01"],
		customizations: [],
		createdAt: now,
		lastSavedAt: now,
	};
}

export class SaveManager {
	private current: SaveData | null = null;

	// Checks for a save file
	hasSave(): boolean {
		return this.readFromStorage() !== null;
	}

	// Loads a save file if there is one, otherwise returns null
	load(): SaveData | null {
		this.current = this.readFromStorage();
		return this.current;
	}

	// Creates a new save file
	startNewGame(): SaveData {
		this.current = createDefaultSave();
		this.writeToStorage(this.current);
		return this.current;
	}

	// Saves progress to your save file
	save(): void {
		if (!this.current) return;
		this.current.lastSavedAt = Date.now();
		this.writeToStorage(this.current);
	}

	// Gets current save data
	getCurrent(): SaveData | null {
		return this.current;
	}

	// Updates save progress in memory
	update(changes: Partial<Omit<SaveData, "version" | "createdAt">>): void {
		if (!this.current) return;
		this.current = { ...this.current, ...changes };
	}

	private readFromStorage(): SaveData | null {
		try {
			const raw = localStorage.getItem(SAVE_KEY);
			if (!raw) return null;
			const data: unknown = JSON.parse(raw);
			return isValidSave(data) ? data : null;
		} catch {
			// Corrupted JSON or storage blocked is treated as no save
			return null;
		}
	}

	private writeToStorage(data: SaveData): void {
		try {
			localStorage.setItem(SAVE_KEY, JSON.stringify(data));
		} catch (err) {
			// Can happen in private browsing or if storage is full
			console.warn("Could not save game:", err);
		}
	}
}

// Verifies the storage actually has some valid save file to call from
function isValidSave(data: unknown): data is SaveData {
	if (typeof data !== "object" || data === null) return false;
	const d = data as Record<string, unknown>;
	return (
		d["version"] === SAVE_VERSION &&
		typeof d["level"] === "number" &&
		typeof d["money"] === "number" &&
		Array.isArray(d["unlockedRecipeIds"]) &&
		Array.isArray(d["customizations"])
	);
}