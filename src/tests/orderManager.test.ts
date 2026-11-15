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

        expect(orderManager.unlockRecipe("recipe_02")).toBe(false);
        expect(orderManager.getUnlockedRecipes()).toHaveLength(2);
    });

    it("throws an error when unlocking an invalid recipe ID", () => {
        expect(() => orderManager.unlockRecipe("recipe_99")).toThrow(
            'Recipe "recipe_99" does not exist'
        );
    });

    it("unlocks the next locked recipe in sequence and returns null when all are unlocked", () => {
        const second = orderManager.unlockNextRecipe();
        expect(second?.id).toBe("recipe_02");
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(true);

        expect(orderManager.unlockNextRecipe()?.id).toBe("recipe_03");
        expect(orderManager.unlockNextRecipe()?.id).toBe("recipe_04");
        expect(orderManager.unlockNextRecipe()?.id).toBe("recipe_05");

        expect(orderManager.unlockNextRecipe()).toBeNull();
        expect(orderManager.getUnlockedRecipes()).toHaveLength(RECIPES.length);
    });

    it("keeps recipe 2 locked after 1 order and unlocks it after 2 orders", () => {
        orderManager.generateRandomOrder();
        orderManager.completeRecipeAndFetchNextOrder();
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(false);

        orderManager.completeRecipeAndFetchNextOrder();
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(true);
    });
});

describe("OrderManager generateNextOrder", () => {
    let orderManager: OrderManager;
    let saveManager: SaveManager;
    const ORDERS_PER_UNLOCK = 2;

    // Finish the current order, like main game when orders complete
    const playOrder = () => {
        const recipe = orderManager.generateNextOrder();
        orderManager.completeRecipeAndFetchNextOrder();
        return recipe;
    };

    beforeEach(() => {
        localStorage.clear();
        saveManager = new SaveManager();
        saveManager.startNewGame();
        orderManager = new OrderManager(saveManager);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("gives Cookies as the first order of a new game and saves it as the current order", () => {
        const first = orderManager.generateNextOrder();

        expect(first?.id).toBe("recipe_01");
        expect(saveManager.getCurrent()!.currentOrderId).toBe("recipe_01");
    });

    it("orders each recipe ORDERS_PER_UNLOCK times, in RECIPES order", () => {
        for (const recipe of RECIPES) {
            for (let i = 0; i < ORDERS_PER_UNLOCK; i++) {
                expect(playOrder()?.id).toBe(recipe.id);
            }
        }
    });

    it("only orders a recipe once it has been unlocked by the every-ORDERS_PER_UNLOCK rule", () => {
        for (let i = 0; i < RECIPES.length * ORDERS_PER_UNLOCK; i++) {
            const recipe = orderManager.generateNextOrder()!;
            expect(orderManager.isRecipeUnlocked(recipe.id)).toBe(true);
            orderManager.completeRecipeAndFetchNextOrder();
        }
    });

    it("keeps recipe 2 locked and not ordered until 2 orders are completed", () => {
        playOrder();
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(false);
        expect(orderManager.generateNextOrder()?.id).toBe("recipe_01");

        orderManager.completeRecipeAndFetchNextOrder();
        expect(orderManager.isRecipeUnlocked("recipe_02")).toBe(true);
        expect(orderManager.generateNextOrder()?.id).toBe("recipe_02");
    });

    it("repeats the same recipe if an order is started but not finished", () => {
        const first = orderManager.generateNextOrder();
        const again = orderManager.generateNextOrder(); // e.g. the player quit mid-order

        expect(again?.id).toBe(first?.id);
    });

    it("completeRecipeAndFetchNextOrder returns the next order in the sequence", () => {
        orderManager.generateNextOrder();
        orderManager.completeRecipeAndFetchNextOrder();
        const next = orderManager.completeRecipeAndFetchNextOrder();

        expect(next?.id).toBe("recipe_02");
        expect(saveManager.getCurrent()!.currentOrderId).toBe("recipe_02");
    });

    it("picks randomly from unlocked recipes once every recipe has had its turn", () => {
        for (let i = 0; i < RECIPES.length * ORDERS_PER_UNLOCK; i++) playOrder();
        expect(orderManager.getUnlockedRecipes()).toHaveLength(RECIPES.length);

        // Math.random() = 0 picks the first unlocked recipe, 0.99 the last
        jest.spyOn(Math, "random").mockReturnValue(0);
        expect(orderManager.generateNextOrder()?.id).toBe(RECIPES[0]!.id);

        jest.spyOn(Math, "random").mockReturnValue(0.99);
        expect(orderManager.generateNextOrder()?.id).toBe(RECIPES[RECIPES.length - 1]!.id);
    });
});