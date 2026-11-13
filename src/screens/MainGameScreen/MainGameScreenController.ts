import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { MainGameScreenHandlers, MainGameScreenView } from "./MainGameScreenView";
import { MainGameScreenModel } from "./MainGameScreenModel";
import type { MainGameScreenModelApi } from "./MainGameScreenModel";

export class MainGameScreenController extends ScreenController {
  private model: MainGameScreenModelApi;
  private view: MainGameScreenView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager, 
              model: MainGameScreenModelApi = new MainGameScreenModel(saveManager),
              createView: (handlers: MainGameScreenHandlers) => MainGameScreenView =
                (h) => new MainGameScreenView(h),
              ){
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = model;
    this.view = createView({
      onHelp: () => this.handleHelp(),
      onSubmit: (answer: string) => this.handleSubmit(answer),
      onHome: () => this.handleHome(),
      onNext: () => this.handleNext(),
      onReplay: () => this.handleReplay(),
      onRetry: () => this.handleRetry(),
      onHint: () => this.handleHint(),
      onNextOrder: () => this.handleNextOrder(),
      onSaveQuit: () => this.handleSaveQuit(),
      onReroll: () => this.handleReroll(),
      onFailQuit: () => this.handleFailQuit(),
    });
    this.onStart();
  }

  getView(): MainGameScreenView {
    return this.view;
  }

  // OVERLOADED SHOW()
  show(): void {
    this.onStart();
		this.getView().show();
	}

  // HANDLERS

  /**
   * Called when the user presses the question mark of the topbar
   */
  handleHelp(): void { 
    this.view.showGuide();
  }

  /**
   * Called when the user presses the home button
   */
  handleHome(): void {
    this.view.setActivePopup("home");
    this.view.showPopup();
  }

  /**
   * Called when the user presses the "next" button upon question completion
   */
  handleNext(): void {
    this.model.advanceProblem();
    this.updateProblem();
    this.updateProgress();
    this.view.hidePopup();
  }

  /**
   * Called when the user presses the "replay" button upon question completion
   */
  handleReplay(): void {
    this.model.replayProblem();
    this.view.hidePopup();
  }

  /**
   * Called when user presses the enter key or presses the submit button
   * @param answer User input
   */
  handleSubmit(answer: string): void {
    this.view.clearAnswer();
    const correct = this.validateAnswer(answer); 
    if (correct){
      this.updateProgress();
      const orderComplete = this.retrieveOrderStatus(); 
      if (orderComplete) this.orderComplete();
      else this.correctAnswer();
    }
  }

  /**
   * Called when the user presses the "retry" button upon submitting an incorrect answer
   */
  handleRetry(): void {
    this.model.retryProblem();
    this.view.hidePopup();
  }

  /**
   * Called whe the user presses the "new question" button upon failing a question
   */
  handleReroll(): void {
    this.model.retryProblem();
    this.updateProblem();
    this.view.hidePopup();
  }

  /**
   * Called when the user presses the "Save & Quit" button upon failing a question
   */
  handleFailQuit(): void {
    this.handleReroll(); //gets a new problem ready and hides the popup
    this.handleSaveQuit();
  }

  /**
   * Called when the user presses the "Hint" button when submitting an incorrect answer
   */
  handleHint(): void {
    this.view.hidePopup();
    const diff = this.model.getHint();
    const hint = `You were ${diff} off from the correct answer!`;
    this.view.showHint(hint);
  }

  /**
   * Called when the user presses the "Next Order" button on order completion or "Start new order" on screen switch
   */
  handleNextOrder(): void {
    this.nextOrder();
    this.view.hidePopup();
  }

  /**
   * Called when the user presses the "Save & Quit" button on order completion
   */
  handleSaveQuit(): void {
    this.model.save(); 
    this.view.hidePopup();
    this.screenSwitcher.switchToScreen({ type: "home" });
  }

  // METHODS

  /**
   * Called everytime the screen is switched to the main game
   * Main function is to check if an order is currently taken(if a recipe is currently loaded)
   * If not, prompt user to take an order
   */
  onStart() {
    const save = this.model.isOrderTaken();
    if (!save){
      this.view.setActivePopup("start");
      this.view.showPopup();
    }
  }

  /**
   * Checks user input to make sure it is a valid number 
   * If it is a valid, check if it is correct
   * @param input to validate and check
   * @returns 
   */
  validateAnswer(input: string): boolean {
    if (!input || input.trim() === ""){
      this.invalidInput();
      return false;
    }
    const num = Number(input);
    if (Number.isNaN(num)) {
      this.invalidInput();
      return false; // Input could not be cleanly converted to a number
    }
    const correct = this.model.checkAnswer(num);
    if (correct) return true;

    this.incorrectAnswer(); // if this is reached, the answer was valid but incorrect
    return false;
  }

  /**
   * Called when user submits a correct answer
   */
  correctAnswer(): void {
    this.view.setActivePopup("congrats");
    this.view.showPopup();
  }

  /**
   * Called when user submits an incorrect answer
   * If it is the user's last attempt, it will show the order failed popup,
   * otherwise it will show the incorrect answer popup
   */
  incorrectAnswer(): void {
    const fail = this.model.isOrderFailed();
    if (fail){
      this.view.setActivePopup("fail");
    }
    else {
      this.view.setActivePopup("incorrect"); 
    }
    this.view.showPopup();
  }

  /**
   * Called when the user enters an invalid input, displays a warning
   */
  invalidInput(): void {
    this.view.showWarning();
  }

  /**
   * When an order is complete, collects and displays the statistics of the current order
   * Resets the order state to default (no order loaded) and prompts user to save or to continue
   */
  orderComplete(): void {
    const stats = this.model.getStats();
    this.view.setOrderStats(stats.questionsAnswered, stats.questionsCorrect, stats.earnings);
    this.view.setActivePopup("complete");
    this.view.showPopup();
    this.model.resetOrder();
  }

  /**
   * When user chooses to continue, loads a new recipe and updates ui to reflect
   */
  nextOrder(): void {
    this.model.advanceOrder();
    this.updateProblem();
    this.updateRecipe();
    this.updateProgress();
  }

  /**
   * Updates the "steps" panel on the left side of the screen after getting recipe
   * info from the model
   */
  updateRecipe(): void {
    const recipe = this.model.getCurrentRecipe();
    this.view.updateTitle(recipe.name);
    this.view.fillLeftPanel(recipe.steps);
    this.view.clearAnswer();
  }

  /**
   * Updates the progress bar and stats on top after getting info from model
   */
  updateProgress(): void {
    const steps = this.model.getProgress();
    const stepsTotal = steps.total; 
    const stepsDone = steps.done; 
    for (let i = 0; i < stepsDone; i++){
      this.view.setStepChecked(i, true);
    }
    this.view.setProgress(stepsDone, stepsTotal);
  }

  /**
   * Updates the current problem on the right panel after getting info from model
   */
  updateProblem(): void {
    const problem = this.model.getProblem()
    const x = problem.x;
    const y = problem.y;
    const operation = problem.operation;
    this.view.fillRightPanel(x, y, operation);
  }

  /**
   * Checks if order is complete after user correctly answers a question
   * @returns if order is complete
   */
  retrieveOrderStatus(): boolean {
    return this.model.isOrderComplete();
  }
}