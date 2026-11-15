import { Recipe, RECIPES } from './recipeManager'
import type { SaveManager } from './saveManager';
export interface GameState {
    unlockedRecipes: Recipe[];
    currentOrder: Recipe | null;
    completedOrders: number;
}

const ORDERS_PER_UNLOCK = 2;

export class OrderManager {
    constructor(private saveManager: SaveManager) {}

    // Makes the order state from the shared save
    private getGameState(): GameState {
        const saveData = this.saveManager.getCurrent();
        const unlockedIds = saveData?.unlockedRecipeIds ?? [];
        return {
            unlockedRecipes: RECIPES.filter((recipe) => unlockedIds.includes(recipe.id)),
            currentOrder: RECIPES.find((recipe) => recipe.id === saveData?.currentOrderId) ?? null,
            completedOrders: saveData?.completedOrders ?? 0
        };
    }

    // Writes the order state back into the shared save
    private saveGameState(state: GameState): void {
        this.saveManager.update({
            unlockedRecipeIds: state.unlockedRecipes.map((recipe) => recipe.id),
            currentOrderId: state.currentOrder?.id ?? null,
            completedOrders: state.completedOrders
        });
        this.saveManager.save();
    }

    public getUnlockedRecipes(): Recipe[] {
        return this.getGameState().unlockedRecipes;
    }

    public isRecipeUnlocked(recipeId: string): boolean {
        const state = this.getGameState();
        return state.unlockedRecipes.some((recipe) => recipe.id === recipeId);
    }

    // For unlocking recipes in the shop
    public unlockRecipe(recipeId: string): boolean {
        const recipeToUnlock = RECIPES.find((r) => r.id === recipeId);
        if (!recipeToUnlock) {
            throw new Error(`Recipe "${recipeId}" does not exist`);
        }

        const state = this.getGameState();
        const alreadyUnlocked = state.unlockedRecipes.some(
            (r) => r.id === recipeId
        );

        if (alreadyUnlocked) {
            return false;
        }

        state.unlockedRecipes.push(recipeToUnlock);
        this.saveGameState(state);
        return true;
    }

    public unlockNextRecipe(): Recipe | null {
        const state = this.getGameState();
        const nextRecipe = RECIPES.find(
            (recipe) => !state.unlockedRecipes.some((u) => u.id === recipe.id)
        );

        if (!nextRecipe) {
            return null;
        }

        state.unlockedRecipes.push(nextRecipe);
        this.saveGameState(state);
        return nextRecipe;
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

            if (state.completedOrders % ORDERS_PER_UNLOCK === 0) {
                this.unlockNextRecipe();
            }
        }

        return this.generateRandomOrder();
    }
}
