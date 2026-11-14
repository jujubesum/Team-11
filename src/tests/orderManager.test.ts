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

describe("OrderManager recipe unlocking", () => {
    let orderManager: OrderManager;
    let saveManager: SaveManager;

    beforeEach(() => {
        localStorage.clear();
        saveManager = new SaveManager();
        saveManager.startNewGame();
        orderManager = new OrderManager(saveManager);
    });

    it("starts with only the first recipe (Cookies) unlocked", () => {
        expect(orderManager.getUnlockedRecipes()).toEqual([RECIPES[0]]);
        expect(orderManager.isRecipeUnlocked("recipe_01")).toBe(true);
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(false);
    });

    it("unlocks a specific recipe and prevents duplicates", () => {
        expect(orderManager.unlockRecipe("recipe_02")).toBe(true);
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(true);

        // Calling unlockRecipe again for the same recipe returns false
        expect(orderManager.unlockRecipe("recipe_02")).toBe(false);
        expect(orderManager.getUnlockedRecipes()).toHaveLength(2);
    });

    it("throws an error when unlocking an invalid recipe ID", () => {
        expect(() => orderManager.unlockRecipe("recipe_99")).toThrow(
            'Recipe "recipe_99" does not exist'
        );
    });

    it("unlocks the next locked recipe in sequence", () => {
        const next = orderManager.unlockNextRecipe();
        expect(next?.id).toBe("recipe_02");
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(true);
    });

    it("automatically unlocks the next recipe after completing 2 orders", () => {
        for (let i = 0; i < 2; i++) {
            orderManager.generateRandomOrder();
            orderManager.completeRecipeAndFetchNextOrder();
        }

        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(true);
    });
});
