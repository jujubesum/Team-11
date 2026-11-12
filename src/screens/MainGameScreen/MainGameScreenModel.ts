import type { SaveManager } from "../../saveManager";
import type { Recipe } from "../../recipeManager";

export type Operation = "+" | "-" | "×" | "÷"; // REMOVE WHEN MERGING!

export interface GameStats {
  questionsAnswered: number;
  questionsCorrect: number;
  earnings: number;
}

export interface MainGameModelApi {
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
}

export class MainGameScreenModel implements MainGameModelApi {
  private saveManager: SaveManager;
  private currentRecipe: Recipe | undefined;
  private currentStep: number;
  private attempts: number;
  private gameStats: GameStats;

  constructor(saveManager: SaveManager){
    // Add/remove instance vars as necessary!
    this.saveManager = saveManager;
    this.currentRecipe = undefined;
    this.currentStep = 0;
    this.attempts = 3;
    this.gameStats = { questionsAnswered: 0, questionsCorrect: 0 , earnings: 0 }
  }

  /**
   * Generates a new random problem with the operation of the current step of the recipe, 
   */
  generateProblem(): void {
    // Checks the operation of the current step and uses it to generate a problem
    // Should save the problem info (operation, left/right) to instance var/s to be used elsewhere
    this.resetAttempts(); // each time a new problem is made attempts should be reset
  }

  /**
   * Selects a random recipe and sets it to the current recipe.
   */
  chooseRandomRecipe(): void {

  }

  /**
   * Checks if the inputted answer is correct
   */
  checkAnswer(answer: number): boolean {
    return false;
  }

  /**
   * Advances to next step of recipe 
   */
  advanceStep(): void {

  }

  /**
   * Generates new problem of same type and updates stats
   */
  retryProblem(): void {
    this.generateProblem();
    this.updateStats(false);
  }

  /**
   * Resets attempt count for user to replay and updates stats
   */
  replayProblem(): void {
    this.updateStats(true);
    this.resetAttempts();
  }

  /**
   * Called when user advances a problem. Should:
   * Reset the attempt count, advance the step of the recipe,
   * increment questions answered/correct, and generate a new problem for that step's operation
   */
  advanceProblem(): void {
    this.advanceStep();
    this.updateStats(true);
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
    this.generateProblem();
  }

  /**
   * Decrement number of attempts the user has left
   */
  decrementAttempts(): void {

  }

  /**
   * Reset attempts remaining to full amount
   */
  resetAttempts(): void {

  }

  /**
   * Reset user statistics to default (questions answered, questions correct, earnings)
   */
  resetStats(): void {

  }

  /**
   * Upon order completion, reset state back to default
   */
  resetOrder(): void {
    this.currentRecipe = undefined;
    this.currentStep = 0;
    this.resetAttempts();
    this.resetStats();
  }

  /**
   * Updates saved stats on question correct/fail 
   */
  updateStats(qCorrect: boolean){

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
    return false;
  }

  /**
   * Checks if user was on their last attempt
   * @returns false if user is out of attempts
   */
  isOrderFailed(): boolean {
    return false;
  }

  /**
   * Should return the absolute difference between the user's answer and the correct answer
   */
  getHint(): number {
    // It might be annoying passing around the answer so I might save the 
    // current answer as an instance var and just use that
    return 0;
  }

  /**
   * @returns object containing questions answered correctly and total number of questions
   */
  getProgress(): { done: number, total: number } {
    return { done: 0, total: 0};
  }

  /**
   * @returns object containing problem info
   */
  getProblem(): { x: number, y: number, operation: Operation } {
    return {x: 0, y: 0, operation: "-"};
  }

  /**
   * @returns GameStats object containing game statistics (questions answered/correct and earnings)
   */
  getStats(): { qAnswered: number, qCorrect: number, earnings: number} {
    return { qAnswered: 4, qCorrect: 4, earnings: 44};
  }

  /**
   * 
   * @returns the current recipe
   */
  getCurrentRecipe(): Recipe {
    // This is a placeholder recipe but in reality should just return this.currentRecipe
    const recipe = { 
      id: 'recipe_01',
      name: 'Cookies',
      mathOperations: ['addition'],
      steps: [
        'Add flour, sugar, eggs, and butter',
        'Stir until smooth',
        'Bake in oven',
        'Decorate with sprinkles'
      ]
    }
    return recipe;
  }
}