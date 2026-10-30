import {
  MATH_OPERATIONS,
  getMathTutorial,
  isMathOperation,
  type MathOperation
} from "../mathTutorials";
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
    expect(isMathOperation("fractions")).toBe(true);
    expect(isMathOperation("algebra")).toBe(false);
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

  it("supports switching to fractions", () => {
    const manager = new TutorialManager("addition");

    manager.selectTutorial("fractions");

    expect(manager.getSnapshot()).toMatchObject({
      operation: "fractions",
      title: "Fractions",
      stepNumber: 1
    });
  });

  it("rejects an unsupported operation without changing state", () => {
    const manager = new TutorialManager("addition");

    expect(() =>
      manager.selectTutorial("algebra" as never)
    ).toThrow("Unsupported operation");

    expect(manager.getSnapshot().operation).toBe("addition");
  });
});
