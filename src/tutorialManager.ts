import {
  mathTutorials,
  isMathOperation,
  type MathOperation
} from "./mathTutorials";
import {
  recipeTutorials,
  isRecipeId,
  buildPracticeProblem,
  type RecipeId,
  type PracticeProblem
} from "./recipeTutorials";

export interface RecipeSkillStatus {
  operation: MathOperation;
  learned: boolean;
  mark: "✓" | "";
}

export class TutorialManager {
  private operation: MathOperation;
  private activeRecipeId: RecipeId | null = null;
  private mode: "math" | "recipe" = "math";
  private stepIndex = 0;
  private learnedSkills = new Set<MathOperation>();

  constructor(operation: MathOperation = "addition") {
    this.operation = operation;
  }

  private getActiveSteps(): string[] {
    if (this.mode === "recipe" && this.activeRecipeId !== null) {
      return recipeTutorials[this.activeRecipeId].steps;
    }
    return mathTutorials[this.operation].steps;
  }

  getCurrentStep(): string {
    const step = this.getActiveSteps()[this.stepIndex];

    if (step === undefined) {
      throw new Error("Tutorial step not found");
    }

    return step;
  }

  nextStep(): boolean {
    const steps = this.getActiveSteps();

    if (this.stepIndex < steps.length - 1) {
      this.stepIndex++;

      if (this.stepIndex === steps.length - 1) {
        this.completeTutorial();
      }

      return true;
    }

    return false;
  }

  previousStep(): boolean {
    if (this.stepIndex > 0) {
      this.stepIndex--;
      return true;
    }

    return false;
  }

  changeTutorial(operation: MathOperation): void {
    if (!isMathOperation(operation)) {
      throw new Error("Unsupported operation");
    }

    this.mode = "math";
    this.operation = operation;
    this.stepIndex = 0;
  }

  selectTutorial(operation: MathOperation): void {
    this.changeTutorial(operation);
  }

  selectForProblem(problem: { operation: MathOperation }): void {
    this.changeTutorial(problem.operation);
  }

  selectRecipeTutorial(recipeId: RecipeId): void {
    if (!isRecipeId(recipeId)) {
      throw new Error("Unsupported recipe");
    }

    this.mode = "recipe";
    this.activeRecipeId = recipeId;
    const firstOp = recipeTutorials[recipeId].mathOperations[0];
    if (firstOp) {
      this.operation = firstOp;
    }
    this.stepIndex = 0;
  }

  selectRecipeSkillTutorial(recipeId: RecipeId, operation: MathOperation): void {
    if (!isRecipeId(recipeId)) {
      throw new Error("Unsupported recipe");
    }
    if (!isMathOperation(operation)) {
      throw new Error("Unsupported operation");
    }

    const recipe = recipeTutorials[recipeId];
    if (!recipe.mathOperations.includes(operation)) {
      throw new Error("Operation is not tested in this recipe");
    }

    this.activeRecipeId = recipeId;
    this.changeTutorial(operation);
  }

  getRecipeSkills(recipeId: RecipeId): RecipeSkillStatus[] {
    if (!isRecipeId(recipeId)) {
      throw new Error("Unsupported recipe");
    }

    return recipeTutorials[recipeId].mathOperations.map((operation) => {
      const learned = this.learnedSkills.has(operation);
      return {
        operation,
        learned,
        mark: learned ? "✓" : ""
      };
    });
  }

  completeTutorial(): void {
    if (this.mode === "recipe" && this.activeRecipeId !== null) {
      for (const op of recipeTutorials[this.activeRecipeId].mathOperations) {
        this.learnedSkills.add(op);
      }
    } else {
      this.learnedSkills.add(this.operation);
    }
  }

  isSkillLearned(operation: MathOperation): boolean {
    return this.learnedSkills.has(operation);
  }

  getPracticeProblems(recipeId?: RecipeId): PracticeProblem[] {
    const targetId = recipeId ?? this.activeRecipeId;
    if (targetId && isRecipeId(targetId)) {
      return recipeTutorials[targetId].practiceProblems;
    }

    return [buildPracticeProblem(this.operation)];
  }

  checkPracticeAnswer(problem: PracticeProblem, userAnswer: number): boolean {
    return problem.answer === userAnswer;
  }

  restart(): void {
    this.stepIndex = 0;
  }

  getTitle(): string {
    if (this.mode === "recipe" && this.activeRecipeId !== null) {
      return recipeTutorials[this.activeRecipeId].title;
    }
    return mathTutorials[this.operation].title;
  }

  getSnapshot() {
    const steps = this.getActiveSteps();

    return {
      operation: this.operation,
      recipeId: this.activeRecipeId,
      mode: this.mode,
      title: this.getTitle(),
      step: this.getCurrentStep(),
      stepNumber: this.stepIndex + 1,
      totalSteps: steps.length,
      canGoBack: this.stepIndex > 0,
      canGoForward: this.stepIndex < steps.length - 1,
      learned: this.isSkillLearned(this.operation)
    };
  }
}