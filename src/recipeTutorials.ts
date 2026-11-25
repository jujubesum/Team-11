import { RECIPES, type Recipe } from "./recipeManager";
import {
    getMathTutorial,
    isMathOperation,
    type MathOperation,
    type MathTutorial
} from "./mathTutorials";

export type RecipeId =
    | "recipe_01"
    | "recipe_02"
    | "recipe_03"
    | "recipe_04"
    | "recipe_05";

export const RECIPE_IDS = [
    "recipe_01",
    "recipe_02",
    "recipe_03",
    "recipe_04",
    "recipe_05"
] as const;

export interface PracticeProblem extends MathTutorial {
    question: string;
    operation: MathOperation;
    answer: number;
}

export interface RecipeTutorial {
    id: RecipeId;
    title: string;
    mathOperations: MathOperation[];
    steps: string[];
    practiceProblems: PracticeProblem[];
}

function extractAnswerFromSteps(steps: string[]): number {
    const lastStep = steps[steps.length - 1] ?? "";
    const numberMatch = lastStep.match(/\d+/);
    return numberMatch ? Number(numberMatch[0]) : 0;
}

export function buildPracticeProblem(operation: MathOperation): PracticeProblem {
    const tutorial = getMathTutorial(operation);
    return {
        ...tutorial,
        question: tutorial.steps[0] ?? tutorial.title,
        operation,
        answer: extractAnswerFromSteps(tutorial.steps)
    };
}

function buildRecipeTutorial(recipe: Recipe): RecipeTutorial {
    const id = recipe.id as RecipeId;
    const mathOperations = recipe.mathOperations.filter(isMathOperation);

    return {
        id,
        title: recipe.name,
        mathOperations,
        steps: [...recipe.steps],
        practiceProblems: mathOperations.map(buildPracticeProblem)
    };
}

export const recipeTutorials: Record<RecipeId, RecipeTutorial> = RECIPES.reduce(
    (acc, recipe) => {
        const id = recipe.id as RecipeId;
        acc[id] = buildRecipeTutorial(recipe);
        return acc;
    },
    {} as Record<RecipeId, RecipeTutorial>
);

export function getRecipeTutorial(recipeId: RecipeId): RecipeTutorial {
    return recipeTutorials[recipeId];
}

export function isRecipeId(value: string): value is RecipeId {
    return Object.prototype.hasOwnProperty.call(recipeTutorials, value);
}