import { SaveManager, SAVE_KEY, SaveData, STARTING_MONEY } from '../saveManager';

const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem(key: string) {
            return store[key] ?? null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('SaveManager', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('first time opening the game: there is no save', () => {
        const manager = new SaveManager();
        expect(manager.hasSave()).toBe(false);
        expect(manager.load()).toBeNull();
    });

    // New game with no save data starts a new game
    test('startNewGame creates a save with default values', () => {
        const manager = new SaveManager();
        const save = manager.startNewGame();

        expect(save.level).toBe(1);
        expect(save.money).toBe(STARTING_MONEY);
        expect(manager.hasSave()).toBe(true);
    });

    // Save file is recognized and "Continue" loads it
    test('saved progress is loaded by a brand new SaveManager (like reopening the page)', () => {
        const first = new SaveManager();
        first.startNewGame();
        first.update({ level: 3, money: 120 });
        first.save();

        const reopened = new SaveManager();
        const loaded = reopened.load();

        expect(loaded).not.toBeNull();
        expect(loaded!.level).toBe(3);
        expect(loaded!.money).toBe(120);
    });

    test('update() without save() does not change what is stored', () => {
        const manager = new SaveManager();
        manager.startNewGame();
        manager.update({ money: 999 });

        const stored: SaveData = JSON.parse(localStorage.getItem(SAVE_KEY)!);
        expect(stored.money).toBe(STARTING_MONEY);
    });

    // Clicking yes to reset clears old data and creates a new game
    test('startNewGame wipes old progress', () => {
        const manager = new SaveManager();
        manager.startNewGame();
        manager.update({ level: 5, money: 300 });
        manager.save();

        manager.startNewGame();

        const loaded = new SaveManager().load();
        expect(loaded!.level).toBe(1);
        expect(loaded!.money).toBe(STARTING_MONEY);
    });

    // Clicking no to reset keeps old data
    test('loading a save does not change it', () => {
        const manager = new SaveManager();
        manager.startNewGame();
        manager.update({ level: 4 });
        manager.save();

        new SaveManager().load();

        expect(new SaveManager().load()!.level).toBe(4);
    });

    test('corrupted save data is treated as no save', () => {
        localStorage.setItem(SAVE_KEY, '{not valid json');
        expect(new SaveManager().load()).toBeNull();

        localStorage.setItem(SAVE_KEY, JSON.stringify({ hello: 'world' }));
        expect(new SaveManager().hasSave()).toBe(false);
    });

    test('save() does nothing if no game was started or loaded', () => {
        new SaveManager().save();
        expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });

    test('saving does not crash when browser storage is blocked', () => {
        jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new Error('storage full');
        });
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const manager = new SaveManager();
        expect(() => manager.startNewGame()).not.toThrow();
        expect(warn).toHaveBeenCalled();
    });
});