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
        orderManager = new OrderManager();

        const mockState: GameState = {
            unlockedRecipes: [
                {
                    id: 'recipe_01', name: 'Cookies', mathOperations: ['addition'], steps: [
                        'Add flour, sugar, eggs, and butter',
                        'Stir until smooth',
                        'Bake in oven',
                        'Decorate with sprinkles']
                },
                {
                    id: 'recipe_02', name: 'Jello', mathOperations: ['subtraction'], steps: [
                        'Subtract the water',
                        'Stir until the powder dissolves',
                        'Let it refrigerate',
                        'Remove the Jello from the mold']
                },
                {
                    id: 'recipe_03', name: 'Cupcakes', mathOperations: ['multiplication'], steps: [
                        'Multiply how much flour, sugar, eggs, and butter is needed for 6 cupcakes',
                        'Stir until smooth',
                        'Pour the batter and bake',
                        'Decorate with the right amount of frosting for 6 cupcakes']
                },
            ],
            currentOrder: null,
            completedOrders: 0
        };
        localStorage.setItem('bakeryGameState', JSON.stringify(mockState));
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
    beforeEach(() => {
        localStorage.clear();
    });

    it("starts with only the first recipe (Cookies) unlocked", () => {
        const manager = new OrderManager();

        expect(manager.getUnlockedRecipes()).toEqual([RECIPES[0]]);
        expect(manager.isRecipeUnlocked("recipe_01")).toBe(true);
        expect(manager.isRecipeUnlocked("recipe_02")).toBe(false);
    });

    it("unlocks a specific recipe and prevents duplicates", () => {
        const manager = new OrderManager();

        expect(manager.unlockRecipe("recipe_02")).toBe(true);
        expect(manager.isRecipeUnlocked("recipe_02")).toBe(true);

        // Calling unlockRecipe again for the same recipe returns false
        expect(manager.unlockRecipe("recipe_02")).toBe(false);
        expect(manager.getUnlockedRecipes()).toHaveLength(2);
    });

    it("throws an error when unlocking an invalid recipe ID", () => {
        const manager = new OrderManager();

        expect(() => manager.unlockRecipe("recipe_99")).toThrow(
            'Recipe "recipe_99" does not exist'
        );
    });

    it("unlocks the next locked recipe in sequence", () => {
        const manager = new OrderManager();

        const next = manager.unlockNextRecipe();
        expect(next?.id).toBe("recipe_02");
        expect(manager.isRecipeUnlocked("recipe_02")).toBe(true);
    });

    it("automatically unlocks the next recipe after completing 2 orders", () => {
        const manager = new OrderManager();

        for (let i = 0; i < 2; i++) {
            manager.generateRandomOrder();
            manager.completeRecipeAndFetchNextOrder();
        }

        expect(manager.isRecipeUnlocked("recipe_02")).toBe(true);
    });
});

describe("OrderManager recipe unlocking", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("starts with only the first recipe (Cookies) unlocked", () => {
        const manager = new OrderManager();

        expect(manager.getUnlockedRecipes()).toEqual([RECIPES[0]]);
        expect(manager.isRecipeUnlocked("recipe_01")).toBe(true);
        expect(manager.isRecipeUnlocked("recipe_02")).toBe(false);
    });

    it("unlocks a specific recipe and prevents duplicates", () => {
        const manager = new OrderManager();

        expect(manager.unlockRecipe("recipe_02")).toBe(true);
        expect(manager.isRecipeUnlocked("recipe_02")).toBe(true);

        // Calling unlockRecipe again for the same recipe returns false
        expect(manager.unlockRecipe("recipe_02")).toBe(false);
        expect(manager.getUnlockedRecipes()).toHaveLength(2);
    });

    it("throws an error when unlocking an invalid recipe ID", () => {
        const manager = new OrderManager();

        expect(() => manager.unlockRecipe("recipe_99")).toThrow(
            'Recipe "recipe_99" does not exist'
        );
    });

    it("unlocks the next locked recipe in sequence", () => {
        const manager = new OrderManager();

        const next = manager.unlockNextRecipe();
        expect(next?.id).toBe("recipe_02");
        expect(manager.isRecipeUnlocked("recipe_02")).toBe(true);
    });

    it("automatically unlocks the next recipe after completing 2 orders", () => {
        const manager = new OrderManager();

        for (let i = 0; i < 2; i++) {
            manager.generateRandomOrder();
            manager.completeRecipeAndFetchNextOrder();
        }

        expect(manager.isRecipeUnlocked("recipe_02")).toBe(true);
    });
});