import type { SaveManager } from "../../saveManager";
import type { Recipe } from "../../recipeManager";
import { generateQuestion } from "../../questions/questionGenerator.ts";
import { QuestionSession } from "../../questions/questionSession.ts";
import type { AnswerResult, Operation, Question, QuestionConfig } from "../../questions/questionTypes.ts";
import {OrderManager} from "../../orderManager";

//recipes says operations in words, but question uses symbols
const TO_SYMBOL: Record<string, Operation> = {
	addition: "+", subtraction: "-", multiplication: "×", division: "÷",
};

const EARNINGS_PER_CORRECT = 5;

/** Number limits for every question (3rd/4th grade: everything within 100). */
const QUESTION_LIMITS: Omit<QuestionConfig, "allowedOperations"> = {
  operandLimits: { "+": 50, "-": 50, "×": 10, "÷": 10 },
  maxNumber: 100,
};

export interface GameStats {
  questionsAnswered: number;
  questionsCorrect: number;
  earnings: number;
}

// These methods are called by the controller! Any not methods not within this API can be removed as long as things still function without them
export interface MainGameScreenModelApi {
  checkAnswer(answer: number): boolean;
  advanceProblem(): void;
  retryProblem(): void;
  replayProblem(): void;
  advanceOrder(): void;
  resetOrder(): void;
  isOrderComplete(): boolean;
  isOrderTaken(): boolean;
  isOrderFailed(): boolean;
  save(): void;
  getCurrentRecipe(): Recipe; 
  getProgress(): { done: number; total: number };
  getProblem(): { x: number, y: number, operation: Operation };
  getHint(): number;
  getStats(): { questionsAnswered: number, questionsCorrect: number , earnings: number };
  getAttemptsRemaining(): number;
}

export class MainGameScreenModel implements MainGameScreenModelApi {
  // Add/remove instance vars as necessary!
  private saveManager: SaveManager;
  private currentRecipe: Recipe | undefined;
  private currentStep: number;
  private gameStats: GameStats;
  //current question and the player's attempts on it
  private question!: Question;
  private session!: QuestionSession;
  private lastResult: AnswerResult | undefined;
  private lastGuess = 0;
  private orderManager: OrderManager;

  constructor(saveManager: SaveManager){
    this.saveManager = saveManager;
    this.orderManager = new OrderManager(saveManager);
    this.currentRecipe = undefined;
    this.currentStep = 0;
    this.gameStats = { questionsAnswered: 0, questionsCorrect: 0 , earnings: 0 }
    this.lastResult = undefined;
    this.lastGuess = 0;
  }

  private isCurrentStepSolved(): boolean {
    return this.lastResult?.status === "correct";
  }

  /**
   * Generates a new random problem with the operation of the current step of the recipe, 
   */
  generateProblem(): void {
    const operations = this.getCurrentRecipe().mathOperations;
    const name = operations[this.currentStep % operations.length];
    const operation = name === undefined ? undefined : TO_SYMBOL[name];
    if (!operation) {
      throw new Error(`Recipe has an unknown math operation: ${name}`);
    }
 
    this.question = generateQuestion({ allowedOperations: [operation], ...QUESTION_LIMITS });
    this.resetAttempts(); // each time a new problem is made attempts should be reset
  }

  /**
   * Picks the next order’s recipe from the order manager (in order at first, then random when all recipes are unlocked)
   */
  chooseRandomRecipe(): void {
    const recipe = this.orderManager.generateNextOrder();
    if (!recipe) {
      throw new Error("No recipes are unlocked");
    }
    this.currentRecipe = recipe;
  }

  /**
   * Checks if the inputted answer is correct
   */
  checkAnswer(answer: number): boolean {
    this.lastResult = this.session.submit(String(answer));
    if (this.lastResult.status === "incorrect") {
      this.lastGuess = answer;
    }
    if (this.lastResult.finished) {
      this.updateStats(this.lastResult.status === "correct");
    }
    return this.lastResult.status === "correct";
  }

  /**
   * Advances to next step of recipe 
   */
  advanceStep(): void {
    this.currentStep += 1;
  }

  /**
   * After running out of attempts, generates new problem
   */
  retryProblem(): void {
    if (!this.session.isFinished()) {
      return; // "Try Again": nothing to change
    }
    this.generateProblem();
  }

  /**
   * Resets attempt count for user to replay
   */
  replayProblem(): void {
    this.resetAttempts();
  }

  /**
   * Called when user advances a problem. Should:
   * Reset the attempt count, advance the step of the recipe
   */
  advanceProblem(): void {
    this.advanceStep();
    this.generateProblem();
  }

  /**
   * Called when a user completes and order and starts a new one. Should:
   * Select a new random recipe, reset progress counter to 0,
   * Generate a new problem with the first step of the new recipe
   */
  advanceOrder(): void {
    this.chooseRandomRecipe();
    this.currentStep = 0;
    this.resetStats();
    this.generateProblem();
  }


  /**
   * Reset attempts remaining to full amount
   */
  resetAttempts(): void {
    this.session = new QuestionSession(this.question);
    this.lastResult = undefined;
  }

  /**
   * Reset user statistics to default (questions answered, questions correct, earnings)
   */
  resetStats(): void {
    this.gameStats = { questionsAnswered: 0, questionsCorrect: 0, earnings: 0 };
  }

  /**
   * Upon order completion, reset state back to default.
   * Tells order manager the order is complete.
   */
  resetOrder(): void {
    this.orderManager.completeRecipeAndFetchNextOrder();
    this.currentRecipe = undefined;
    this.currentStep = 0;
    this.resetAttempts();
    this.resetStats();
  }

  /**
   * Updates saved stats on question correct/fail 
   */
  updateStats(qCorrect: boolean){
    this.gameStats.questionsAnswered += 1;
    if (qCorrect) {
      this.gameStats.questionsCorrect += 1;
      this.gameStats.earnings += EARNINGS_PER_CORRECT;
    }
  }

  /**
   * Saves the current state to the save file including (can add more/remove):
   * Current recipe, current step, current problem, current attempt count, 
   */
  save(): void {

  }

  /**
   * Checks if an order is currently taken, if not user would be prompted to start a new one
   */
  isOrderTaken(): boolean {
    return false;
  }

  /**
   * Checks if user was on last step of recipe 
   * @returns true if user was on last step
   */
  isOrderComplete(): boolean {
    const lastStep = this.getCurrentRecipe().steps.length - 1;
    return this.currentStep === lastStep && this.isCurrentStepSolved();
  }

  /**
   * Checks if user was on their last attempt
   * @returns true if user is out of attempts
   */
  isOrderFailed(): boolean {
    return this.lastResult?.attemptsRemaining === 0;
  }

  /**
   * 
   * @returns number of attempts user has left
   */
  getAttemptsRemaining(): number {
    return this.lastResult?.attemptsRemaining ?? 2;
  }

  /**
   * Returns the absolute difference between the user's answer and the correct answer
   */
  getHint(): number {
    // It might be annoying passing around the answer so I might save the 
    // current answer as an instance var and just use that
    return Math.abs(this.question.answer - this.lastGuess);
  }

  /**
   * @returns object containing questions answered correctly and total number of questions
   */
  getProgress(): { done: number, total: number } {
    const done = this.currentStep + (this.isCurrentStepSolved() ? 1 : 0);
    return { done, total: this.getCurrentRecipe().steps.length };
  }

  /**
   * @returns object containing problem info
   */
  getProblem(): { x: number, y: number, operation: Operation } {
    return { x: this.question.left, y: this.question.right, operation: this.question.operation };
  }

  /**
   * @returns GameStats object containing game statistics (questions answered/correct and earnings)
   */
  getStats(): { questionsAnswered: number, questionsCorrect: number , earnings: number } {
    return this.gameStats;
  }

  /**
   * 
   * @returns the current recipe
   */
  getCurrentRecipe(): Recipe {
    if(!this.currentRecipe){
      throw new Error("No order has been taken yet.");
    }   
    return this.currentRecipe;
  }
}