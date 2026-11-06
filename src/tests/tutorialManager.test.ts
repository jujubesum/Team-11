import {
  MATH_OPERATIONS,
  getMathTutorial,
  isMathOperation,
  type MathOperation
} from "../mathTutorials";
import {
  RECIPE_IDS,
  getRecipeTutorial,
  isRecipeId,
  type RecipeId
} from "../recipeTutorials";
import { TutorialManager } from "../tutorialManager";

describe("math tutorial content", () => {
  it.each(MATH_OPERATIONS)("has complete content for %s", (operation: MathOperation) => {
    const tutorial = getMathTutorial(operation);

    expect(tutorial.steps.length).toBeGreaterThan(1);

    for (const step of tutorial.steps) {
      expect(typeof step).toBe("string");
      expect(step.trim().length).toBeGreaterThan(0);
    }
  });

  it("recognizes supported and unsupported operations", () => {
    expect(isMathOperation("addition")).toBe(true);
    expect(isMathOperation("subtraction")).toBe(true);
    expect(isMathOperation("multiplication")).toBe(true);
    expect(isMathOperation("division")).toBe(true);
    expect(isMathOperation("algebra")).toBe(false);
  });
});

describe("recipe tutorial content", () => {
  it.each(RECIPE_IDS)("has complete steps, operations, and practice problems for %s", (recipeId: RecipeId) => {
    const tutorial = getRecipeTutorial(recipeId);

    expect(tutorial.steps.length).toBeGreaterThan(1);
    expect(tutorial.mathOperations.length).toBeGreaterThan(0);
    expect(tutorial.practiceProblems.length).toBeGreaterThan(0);
  });

  it("recognizes supported and unsupported recipe IDs", () => {
    expect(isRecipeId("recipe_01")).toBe(true);
    expect(isRecipeId("recipe_05")).toBe(true);
    expect(isRecipeId("recipe_99")).toBe(false);
  });
});

describe("TutorialManager", () => {
  it("starts at the first step", () => {
    const manager = new TutorialManager("multiplication");

    expect(manager.getSnapshot()).toMatchObject({
      operation: "multiplication",
      stepNumber: 1,
      canGoBack: false,
      canGoForward: true
    });
  });

  it("moves forward and backward", () => {
    const manager = new TutorialManager();

    expect(manager.nextStep()).toBe(true);
    expect(manager.getSnapshot().stepNumber).toBe(2);

    expect(manager.previousStep()).toBe(true);
    expect(manager.getSnapshot().stepNumber).toBe(1);
  });

  it("does not go before the first step or beyond the final step", () => {
    const manager = new TutorialManager();

    expect(manager.previousStep()).toBe(false);

    while (manager.nextStep()) {
      // Advance to the final step
    }

    expect(manager.getSnapshot().canGoForward).toBe(false);
    expect(manager.nextStep()).toBe(false);

    expect(manager.getSnapshot().stepNumber).toBe(
      manager.getSnapshot().totalSteps
    );
  });

  it("resets when switching tutorials", () => {
    const manager = new TutorialManager();

    manager.nextStep();
    manager.selectTutorial("division");

    expect(manager.getSnapshot()).toMatchObject({
      operation: "division",
      stepNumber: 1
    });
  });

  it("selects the tutorial corresponding to the current math problem", () => {
    const manager = new TutorialManager();

    manager.selectForProblem({ operation: "subtraction" });

    expect(manager.getSnapshot().title).toBe("Subtraction");
  });

  it("restarts the active tutorial", () => {
    const manager = new TutorialManager();

    manager.nextStep();
    manager.restart();

    expect(manager.getSnapshot().stepNumber).toBe(1);
  });

  it("rejects an unsupported operation without changing state", () => {
    const manager = new TutorialManager("addition");

    expect(() =>
      manager.selectTutorial("algebra" as never)
    ).toThrow("Unsupported operation");

    expect(manager.getSnapshot().operation).toBe("addition");
  });

  it("loads a recipe tutorial and steps through recipe steps", () => {
    const manager = new TutorialManager();

    manager.selectRecipeTutorial("recipe_01");

    expect(manager.getSnapshot()).toMatchObject({
      recipeId: "recipe_01",
      mode: "recipe",
      title: "Cookies",
      step: "Add flour, sugar, eggs, and butter",
      stepNumber: 1
    });

    manager.nextStep();
    expect(manager.getCurrentStep()).toBe("Stir until smooth");
  });

  it("lists tested math skills for a recipe and accesses a specific skill tutorial", () => {
    const manager = new TutorialManager();

    const cakeSkills = manager.getRecipeSkills("recipe_05");
    expect(cakeSkills.map((s) => s.operation)).toEqual([
      "addition",
      "subtraction",
      "division",
      "multiplication"
    ]);

    manager.selectRecipeSkillTutorial("recipe_05", "division");
    expect(manager.getSnapshot()).toMatchObject({
      mode: "math",
      operation: "division",
      title: "Division",
      stepNumber: 1
    });

    expect(() =>
      manager.selectRecipeSkillTutorial("recipe_01", "division")
    ).toThrow("Operation is not tested in this recipe");
  });

  it("marks a skill as learned after completing a tutorial and reflects overlap across recipes", () => {
    const manager = new TutorialManager("addition");

    expect(manager.isSkillLearned("addition")).toBe(false);

    while (manager.nextStep()) {
      // advance to end
    }

    expect(manager.isSkillLearned("addition")).toBe(true);

    expect(manager.getRecipeSkills("recipe_01")).toEqual([
      { operation: "addition", learned: true, mark: "✓" }
    ]);

    const cakeSkills = manager.getRecipeSkills("recipe_05");
    expect(cakeSkills).toContainEqual({
      operation: "addition",
      learned: true,
      mark: "✓"
    });
    expect(cakeSkills).toContainEqual({
      operation: "subtraction",
      learned: false,
      mark: ""
    });
  });

  it("provides practice problems for recipes and validates answers", () => {
    const manager = new TutorialManager();
    manager.selectRecipeTutorial("recipe_03");

    const problems = manager.getPracticeProblems();
    const firstProblem = problems[0];

    expect(firstProblem).toBeDefined();
    if (!firstProblem) {
      throw new Error("Expected at least one practice problem");
    }

    expect(manager.checkPracticeAnswer(firstProblem, firstProblem.answer)).toBe(true);
    expect(manager.checkPracticeAnswer(firstProblem, firstProblem.answer + 1)).toBe(false);
  });
});