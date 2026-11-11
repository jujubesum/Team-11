import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { MainGameScreenView } from "./MainGameScreenView";
import { HomeScreenController } from "../HomeScreen/HomeScreenController";

export class MainGameScreenController extends ScreenController {
  private view: MainGameScreenView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager){
    super();
    this.screenSwitcher = screenSwitcher;
    this.view = new MainGameScreenView({
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
    this.updateRecipe(); 
    this.updateProblem();
  }

  getView(): MainGameScreenView {
    return this.view;
  }

  // HANDLERS

  handleHelp(): void { 

  }

  handleHome(): void {
    this.view.setActivePopup("home");
    this.view.showPopup();
  }

  handleNext(): void {
    // TODO: Call model & cycle to next question
    this.updateProblem();
    this.view.hidePopup();

  }

  handleReplay(): void {
    // TODO: Call model to reset attempt count back to full
    this.view.hidePopup();
  }

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

  handleRetry(): void {
    // TODO: Call model to decrement number of attempts by 1
    this.view.hidePopup();
  }

  handleReroll(): void {
    // TODO: Call model to generate a new problem of the same type and save the order state
    this.view.hidePopup();
  }

  handleFailQuit(): void {
    this.handleReroll(); //gets a new problem ready and hides the popup for switching screens
    this.screenSwitcher.switchToScreen({ type: "home" })
  }

  handleHint(): void {
    this.view.hidePopup();
    // TODO: When hint screen is ready, call to show it
  }

  handleNextOrder(): void {
    // TODO: Call model to get next order/recipe to make
    this.updateRecipe();
    this.view.hidePopup();
  }

  handleSaveQuit(): void {
    // TODO: Get model to save current game state 
    this.view.hidePopup();
    this.screenSwitcher.switchToScreen({ type: "home" });
  }

  // METHODS

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

    // TODO: Call model to check if num is the correct answer 
    const correct = false;
    if (correct) return true;

    this.incorrectAnswer(); // if this is reached, the answer was valid but incorrect
    return false;
  }

  correctAnswer(): void {
    this.view.setActivePopup("congrats");
    this.view.showPopup();
  }

  incorrectAnswer(): void {
    // TODO: Call model and see if this was users last attempt
    const fail = false;
    if (fail){
      this.view.setActivePopup("fail");
    }
    else {
      this.view.setActivePopup("incorrect"); 
    }
    this.view.showPopup();
  }

  invalidInput(): void {

  }

  orderComplete(): void {
    // TODO: Create order complete popup
    // Get stats from model (questions answered, correct answers, earnings)
    let placeholder = 44;
    this.view.setOrderStats(placeholder, placeholder, placeholder);
    this.view.setActivePopup("complete");
    this.view.showPopup();
  }

  updateRecipe(): void {
    const recipe = { 
    id: 'recipe_01',
    name: 'Cookies',
    mathOperations: ['addition'],
    steps: [
      'Add flour, sugar, eggs, and butter',
      'Stir until smooth',
      'Bake in oven',
      'Decorate with sprinkles'
    ],
  }; // TODO: Replace with call to model for current recipe
    this.view.updateTitle(recipe.name);
    this.view.fillLeftPanel(recipe.steps);
    this.view.setProgress(0, recipe.steps.length);
    this.view.clearAnswer();
  }

  updateProgress(): void {
    const steps = 4; // replace with a call to model asking how many steps are in the current recipe
    const stepsCompleted = 0; // replace with a call to model asking how many steps have been completed
    for (let i = 0; i < stepsCompleted; i++){
      this.view.setStepChecked(i, true);
    }
    this.view.setProgress(stepsCompleted, steps);
  }

  updateProblem(): void {
    //TODO: Call model and retrieve question, then use retrieved info to call fillRightPanel()
    const x = 10;
    const y = 14;
    const operation = "*"; // PLACEHOLDERS
    this.view.fillRightPanel(x, y, operation);
  }

  // MODEL CALLS

  retrieveOrderStatus(): boolean {
    //TODO: Call model to retrieve order status, if order is complete, return true

    return false;
  }


}