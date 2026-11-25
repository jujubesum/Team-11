import { ScreenController, type ScreenSwitcher } from "../../types.ts";
import { getRecipeTutorial, RECIPE_IDS, type RecipeId } from "../../recipeTutorials.ts";
import { SaveManager } from "../../saveManager.ts";
import { RecipeTutorialView } from "./RecipeTutorialView.ts";

export class RecipeTutorialController extends ScreenController {
    private view: RecipeTutorialView;
    private screenSwitcher: ScreenSwitcher;
    private saveManager: SaveManager;
    private ownsSaveManager: boolean;
    private unlockedRecipes: RecipeId[] = [];
    private currentRecipeId: RecipeId | null = null;
    private stepIndex = 0;

    constructor(
        screenSwitcher: ScreenSwitcher,
        saveManager?: SaveManager,
        view?: RecipeTutorialView,
    ) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.ownsSaveManager = saveManager === undefined;
        this.saveManager = saveManager ?? new SaveManager();
        this.unlockedRecipes = this.loadUnlockedRecipes();
        this.currentRecipeId = this.unlockedRecipes[0] ?? null;
        this.view = view ?? new RecipeTutorialView(this.unlockedRecipes);

        this.view.setUnlockedRecipes(this.unlockedRecipes, this.currentRecipeId ?? undefined);
        this.view.onShow(() => this.refreshUnlockedRecipes());
        this.view.onArrowPress((rightShift) => this.handleArrowButtonPress(rightShift));
        this.view.onRecipeSelect((recipeId) => this.handleRecipeSelect(recipeId));
        this.view.onBackPress(() => this.handleBackButtonPress());

        this.updateView();
    }

    private loadUnlockedRecipes(): RecipeId[] {
        const saveData = this.ownsSaveManager
            ? this.saveManager.load()
            : (this.saveManager.getCurrent() ?? this.saveManager.load());

        const unlockedIds = saveData?.unlockedRecipeIds ?? ["recipe_01"];
        return RECIPE_IDS.filter((id) => unlockedIds.includes(id));
    }

    refreshUnlockedRecipes(): void {
        this.unlockedRecipes = this.loadUnlockedRecipes();
        if (!this.currentRecipeId || !this.unlockedRecipes.includes(this.currentRecipeId)) {
            this.currentRecipeId = this.unlockedRecipes[0] ?? null;
            this.stepIndex = 0;
        }
        this.view.setUnlockedRecipes(this.unlockedRecipes, this.currentRecipeId ?? undefined);
        this.updateView();
    }

    updateView(): void {
        if (!this.currentRecipeId) {
            this.view.setUnlockedRecipes([], undefined);
            this.view.setTutorialContent({
                recipeId: "recipe_01",
                title: "No Unlocked Recipes",
                step: "Unlock recipes to view their tutorial steps.",
                stepNumber: 0,
                totalSteps: 0,
                canGoBack: false,
                canGoForward: false,
            });
            return;
        }

        const tutorial = getRecipeTutorial(this.currentRecipeId);
        const totalSteps = tutorial.steps.length;
        const clampedIndex = Math.max(0, Math.min(this.stepIndex, Math.max(totalSteps - 1, 0)));
        this.stepIndex = clampedIndex;

        this.view.setTutorialContent({
            recipeId: this.currentRecipeId,
            title: tutorial.title,
            step: tutorial.steps[this.stepIndex] ?? "",
            stepNumber: totalSteps > 0 ? this.stepIndex + 1 : 0,
            totalSteps,
            canGoBack: this.stepIndex > 0,
            canGoForward: this.stepIndex < totalSteps - 1,
        });
    }

    handleArrowButtonPress(rightShift: boolean): void {
        if (!this.currentRecipeId) return;
        const steps = getRecipeTutorial(this.currentRecipeId).steps;

        if (rightShift && this.stepIndex < steps.length - 1) {
            this.stepIndex++;
        } else if (!rightShift && this.stepIndex > 0) {
            this.stepIndex--;
        }
        this.updateView();
    }

    handleRecipeSelect(recipeId: RecipeId): void {
        if (!this.unlockedRecipes.includes(recipeId)) {
            this.view.showLockedPopup(getRecipeTutorial(recipeId).title);
            return;
        }
        this.currentRecipeId = recipeId;
        this.stepIndex = 0;
        this.updateView();
    }

    handleBackButtonPress(): void {
        this.screenSwitcher.switchToScreen({ type: "home" });
    }

    getView(): RecipeTutorialView {
        return this.view;
    }
}