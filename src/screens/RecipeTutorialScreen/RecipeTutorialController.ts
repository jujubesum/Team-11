import { ScreenController, type ScreenSwitcher } from "../../types.ts";
import { TutorialManager } from "../../tutorialManager.ts";
import { RECIPE_IDS, type RecipeId } from "../../recipeTutorials.ts";
import type { MathOperation } from "../../mathTutorials.ts";
import { RecipeTutorialView } from "./RecipeTutorialView.ts";

export class RecipeTutorialController extends ScreenController {
    private manager: TutorialManager;
    private view: RecipeTutorialView;
    private screenSwitcher: ScreenSwitcher;
    private currentRecipeIndex = 0;

    constructor(
        screenSwitcher: ScreenSwitcher,
        manager: TutorialManager = new TutorialManager(),
        view: RecipeTutorialView = new RecipeTutorialView(),
    ) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.manager = manager;
        this.view = view;

        const initialRecipe = this.getCurrentRecipeId();
        this.manager.selectRecipeTutorial(initialRecipe);

        this.view.onArrowPress((rightShift) => this.handleArrowButtonPress(rightShift));
        this.view.onHomePress(() => this.handleHome());
        this.view.onHelpPress(() => this.handleHelp());
        this.view.onSkillSelect((operation) => this.handleSkillSelect(operation));
        this.view.onRecipeChange((next) => this.handleRecipeChange(next));
        this.view.onBackToRecipeSteps(() => {
            this.manager.selectRecipeTutorial(this.getCurrentRecipeId());
            this.updateView();
        });

        this.updateView();
    }

    private handleHome(): void {
		this.screenSwitcher.switchToScreen({ type: "home" });
	}

	private handleHelp(): void {
		// TODO: show how the recipe tutorial works (skipped for now)
	}

    private getCurrentRecipeId(): RecipeId {
        return RECIPE_IDS[this.currentRecipeIndex] ?? "recipe_01";
    }

    updateView(): void {
        const snapshot = this.manager.getSnapshot();
        const recipeId = this.getCurrentRecipeId();
        const skills = this.manager.getRecipeSkills(recipeId);
        const problems = this.manager.getPracticeProblems(recipeId);
        const matchingProblem =
            problems.find((p) => p.operation === snapshot.operation) ?? problems[0];

        const practiceText = matchingProblem
            ? `Practice: ${matchingProblem.question}\n(Answer: ${matchingProblem.answer})`
            : "";

        const body = `Step ${snapshot.stepNumber} of ${snapshot.totalSteps}:\n\n${snapshot.step}`;

        this.view.setTutorialContent({
            title: snapshot.title,
            body,
            practiceText,
            skills,
            isSkillMode: snapshot.mode === "math",
        });

        this.view.setArrows(snapshot.canGoBack, snapshot.canGoForward);
    }

    handleArrowButtonPress(rightShift: boolean): void {
        if (rightShift) {
            this.manager.nextStep();
        } else {
            this.manager.previousStep();
        }
        this.updateView();
    }

    handleSkillSelect(operation: MathOperation): void {
        const recipeId = this.getCurrentRecipeId();
        this.manager.selectRecipeSkillTutorial(recipeId, operation);
        this.updateView();
    }

    handleRecipeChange(next: boolean): void {
        if (next) {
            this.currentRecipeIndex = (this.currentRecipeIndex + 1) % RECIPE_IDS.length;
        } else {
            this.currentRecipeIndex =
                (this.currentRecipeIndex - 1 + RECIPE_IDS.length) % RECIPE_IDS.length;
        }
        this.manager.selectRecipeTutorial(this.getCurrentRecipeId());
        this.updateView();
    }

    getView(): RecipeTutorialView {
        return this.view;
    }
}