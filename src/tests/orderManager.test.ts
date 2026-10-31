import { OrderManager, GameState } from '../orderManager';

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

    beforeEach(() => {
        localStorage.clear();
        orderManager = new OrderManager();

        const mockState: GameState = {
            unlockedRecipes: [
                { id: 'recipe_01', name: 'Cookies', mathOperations: ['addition'], steps: [
                    'Add flour, sugar, eggs, and butter',
                    'Stir until smooth',
                    'Bake in oven',
                    'Decorate with sprinkles'] 
                },
                { id: 'recipe_02', name: 'Jello', mathOperations: ['subtraction'], steps: [
                    'Subtract the water',
                    'Stir until the powder dissolves',
                    'Let it refrigerate',
                    'Remove the Jello from the mold']
                },
                { id: 'recipe_03', name: 'Cupcakes', mathOperations: ['multiplication'], steps: [
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
        expect(['recipe_01', 'recipe_02', 'recipe_03']).toContain(nextOrder!.id);

        const savedState: GameState = JSON.parse(localStorage.getItem('bakeryGameState')!);
        expect(savedState.currentOrder?.id).toBe(nextOrder!.id);
    });

    test('generateRandomOrder returns null if no recipes are unlocked', () => {
        localStorage.setItem('bakeryGameState', JSON.stringify({
            unlockedRecipes: [],
            currentOrder: null,
            completedOrders: 0
        }));

        const nextOrder = orderManager.generateRandomOrder();
        expect(nextOrder).toBeNull();
    });

    // Test that it is correctly called during main game
    test('completeRecipeAndFetchNextOrder completes current order and fetches a new one', () => {
        orderManager.generateRandomOrder();

        const initialSavedState: GameState = JSON.parse(localStorage.getItem('bakeryGameState')!);
        const initialCompletedCount = initialSavedState.completedOrders;

        const newOrder = orderManager.completeRecipeAndFetchNextOrder();

        const finalSavedState: GameState = JSON.parse(localStorage.getItem('bakeryGameState')!);

        // Assertions
        expect(finalSavedState.completedOrders).toBe(initialCompletedCount + 1);
        expect(newOrder).not.toBeNull();
        expect(finalSavedState.currentOrder?.id).toBe(newOrder!.id);
    });
});