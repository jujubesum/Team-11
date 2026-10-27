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
                { id: 'r1', name: 'Cake', mathOperations: ['addition', 'multiplication'] },
                { id: 'r2', name: 'Pie', mathOperations: ['fractions'] },
                { id: 'r3', name: 'Cookies', mathOperations: ['subtraction'] }
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
        expect(['r1', 'r2', 'r3']).toContain(nextOrder!.id);

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