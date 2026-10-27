export interface Recipe {
    id: string;
    name: string;
    mathOperations: string[]; 
}

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
            unlockedRecipes: [
                { 
                    id: 'recipe_01', 
                    name: 'Cookies', 
                    mathOperations: ['addition', 'subtraction'] 
                }
            ],
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
