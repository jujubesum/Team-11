import { OrderManager } from '../orderManager';
import { SaveManager } from '../saveManager';
import { RECIPES } from '../recipeManager';

const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        clear() {
            store = {};
        }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('OrderManager', () => {
    let orderManager: OrderManager;
    let saveManager: SaveManager;
    const unlockedIds = RECIPES.slice(0, 3).map((recipe) => recipe.id);

    beforeEach(() => {
        localStorage.clear();
        saveManager = new SaveManager();
        saveManager.startNewGame();
        saveManager.update({ unlockedRecipeIds: unlockedIds });
        orderManager = new OrderManager(saveManager);
    });

    // Test randomizer works as intended
    test('generateRandomOrder selects a valid recipe from unlocked recipes', () => {
        const nextOrder = orderManager.generateRandomOrder();

        expect(nextOrder).not.toBeNull();
        expect(unlockedIds).toContain(nextOrder!.id);

        expect(saveManager.getCurrent()!.currentOrderId).toBe(nextOrder!.id);
    });

    test('generateRandomOrder returns null if no recipes are unlocked', () => {
        saveManager.update({ unlockedRecipeIds: [] });

        const nextOrder = orderManager.generateRandomOrder();
        expect(nextOrder).toBeNull();
    });

    // Test that it is correctly called during main game
    test('completeRecipeAndFetchNextOrder completes current order and fetches a new one', () => {
        orderManager.generateRandomOrder();

        const initialCompletedCount = saveManager.getCurrent()!.completedOrders;

        const newOrder = orderManager.completeRecipeAndFetchNextOrder();

        // Assertions
        expect(saveManager.getCurrent()!.completedOrders).toBe(initialCompletedCount + 1);
        expect(newOrder).not.toBeNull();
        expect(saveManager.getCurrent()!.currentOrderId).toBe(newOrder!.id);
    });
});