import { Recipe, RECIPES } from './recipeManager'
/*export interface Recipe {
    id: string;
    name: string;
    mathOperations: string[];
}
*/
export interface GameState {
    unlockedRecipes: Recipe[];
    currentOrder: Recipe | null;
    completedOrders: number;
}

export class OrderManager {
    private readonly DB_KEY = 'bakeryGameState';

    private getGameState(): GameState {
        const stateData = localStorage.getItem(this.DB_KEY);
        if (stateData) {
            return JSON.parse(stateData);
        }
        return {
            // This is just a place holder for the initial recipe that gets unlocked upon starting a game.
            unlockedRecipes: [RECIPES[0]!],
            currentOrder: null,
            completedOrders: 0
        };
    }

    private saveGameState(state: GameState): void {
        localStorage.setItem(this.DB_KEY, JSON.stringify(state));
    }

    public generateRandomOrder(): Recipe | null {
        const state = this.getGameState();
        const availableRecipes = state.unlockedRecipes;

        if (availableRecipes.length === 0) {
            console.warn("No recipes unlocked. Cannot generate customer order.");
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableRecipes.length);

        const nextOrder = availableRecipes[randomIndex]!;

        state.currentOrder = nextOrder;
        this.saveGameState(state);

        return nextOrder;
    }

    public completeRecipeAndFetchNextOrder(): Recipe | null {
        const state = this.getGameState();

        if (state.currentOrder) {
            state.completedOrders += 1;
            state.currentOrder = null;
            this.saveGameState(state);
        }

        return this.generateRandomOrder();
    }
}
