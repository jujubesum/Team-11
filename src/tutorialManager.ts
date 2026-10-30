import {
  mathTutorials,
  isMathOperation,
  type MathOperation
} from "./mathTutorials";

export class TutorialManager {
  private operation: MathOperation;
  private stepIndex = 0;

  constructor(operation: MathOperation = "addition") {
    this.operation = operation;
  }

  getCurrentStep(): string {
    return mathTutorials[this.operation].steps[this.stepIndex];
  }

  nextStep(): boolean {
    const steps = mathTutorials[this.operation].steps;

    if (this.stepIndex < steps.length - 1) {
      this.stepIndex++;
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

    this.operation = operation;
    this.stepIndex = 0;
  }

  selectTutorial(operation: MathOperation): void {
    this.changeTutorial(operation);
  }

  selectForProblem(problem: { operation: MathOperation }): void {
    this.changeTutorial(problem.operation);
  }

  restart(): void {
    this.stepIndex = 0;
  }

  getTitle(): string {
    return mathTutorials[this.operation].title;
  }

  getSnapshot() {
    const tutorial = mathTutorials[this.operation];

    return {
      operation: this.operation,
      title: tutorial.title,
      step: this.getCurrentStep(),
      stepNumber: this.stepIndex + 1,
      totalSteps: tutorial.steps.length,
      canGoBack: this.stepIndex > 0,
      canGoForward: this.stepIndex < tutorial.steps.length - 1
    };
  }
}