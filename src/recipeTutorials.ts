import { RECIPES, type Recipe } from "./recipeManager";
import { isMathOperation, type MathOperation } from "./mathTutorials";

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

export interface PracticeProblem {
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

const PRACTICE_PROBLEMS_BY_RECIPE: Record<RecipeId, PracticeProblem[]> = {
    recipe_01: [
        {
            question: "Add 2 cups of flour and 3 cups of sugar. What is 2 + 3?",
            operation: "addition",
            answer: 5
        }
    ],
    recipe_02: [
        {
            question: "Start with 8 cups of water and subtract 3 cups. What is 8 - 3?",
            operation: "subtraction",
            answer: 5
        }
    ],
    recipe_03: [
        {
            question: "Each cupcake needs 2 eggs per batch for 6 batches. What is 2 × 6?",
            operation: "multiplication",
            answer: 12
        }
    ],
    recipe_04: [
        {
            question: "Cut 12 apple slices equally for 4 pies. What is 12 ÷ 4?",
            operation: "division",
            answer: 3
        }
    ],
    recipe_05: [
        {
            question: "Add 4 cups of flour and 2 cups of sugar. What is 4 + 2?",
            operation: "addition",
            answer: 6
        },
        {
            question: "Take 6 eggs and subtract 2. What is 6 - 2?",
            operation: "subtraction",
            answer: 4
        },
        {
            question: "Multiply 3 layers of frosting by 2 cups each. What is 3 × 2?",
            operation: "multiplication",
            answer: 6
        },
        {
            question: "Divide 8 cake slices among 4 plates. What is 8 ÷ 4?",
            operation: "division",
            answer: 2
        }
    ]
};

function buildRecipeTutorial(recipe: Recipe): RecipeTutorial {
    const id = recipe.id as RecipeId;
    const mathOperations = recipe.mathOperations.filter(isMathOperation);

    return {
        id,
        title: recipe.name,
        mathOperations,
        steps: [...recipe.steps],
        practiceProblems: PRACTICE_PROBLEMS_BY_RECIPE[id] ?? []
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