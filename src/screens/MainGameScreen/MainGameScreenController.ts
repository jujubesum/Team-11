import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { MainGameScreenView } from "./MainGameScreenView";
import { MainGameScreenModel } from "./MainGameScreenModel";
import { HomeScreenController } from "../HomeScreen/HomeScreenController";

export class MainGameScreenController extends ScreenController {
  private model: MainGameScreenModel;
  private view: MainGameScreenView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager){
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new MainGameScreenModel(saveManager);
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

  handleHelp(): void { 
    this.view.showGuide();
  }

  handleHome(): void {
    this.view.setActivePopup("home");
    this.view.showPopup();
  }

  handleNext(): void {
    this.model.advanceProblem();
    this.updateProblem();
    this.updateProgress();
    this.view.hidePopup();
  }

  handleReplay(): void {
    this.model.replayProblem();
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
    this.model.decrementAttempts();
    this.view.hidePopup();
  }

  handleReroll(): void {
    this.model.retryProblem();
    this.updateProblem();
    this.view.hidePopup();
  }

  handleFailQuit(): void {
    this.handleReroll(); //gets a new problem ready and hides the popup
    this.handleSaveQuit();
  }

  handleHint(): void {
    this.view.hidePopup();
    const diff = this.model.getHint();
    const hint = `You were ${diff} off from the correct answer!`;
    this.view.showHint(hint);
  }

  handleNextOrder(): void {
    this.nextOrder();
    this.view.hidePopup();
  }

  handleSaveQuit(): void {
    this.model.save(); 
    this.view.hidePopup();
    this.screenSwitcher.switchToScreen({ type: "home" });
  }

  // METHODS

  onStart() {
    const save = this.model.isOrderTaken();
    if (!save){
      this.view.setActivePopup("start");
      this.view.showPopup();
    }
  }

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

  correctAnswer(): void {
    this.view.setActivePopup("congrats");
    this.view.showPopup();
  }

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

  invalidInput(): void {
    this.view.showWarning();
  }

  orderComplete(): void {
    const stats = this.model.getStats();
    this.view.setOrderStats(stats.qAnswered, stats.qCorrect, stats.earnings);
    this.view.setActivePopup("complete");
    this.view.showPopup();
    this.model.resetOrder();
  }

  nextOrder(): void {
    this.model.advanceOrder();
    this.updateProblem();
    this.updateRecipe();
    this.updateProgress();
  }

  updateRecipe(): void {
    const recipe = this.model.getCurrentRecipe();
    this.view.updateTitle(recipe.name);
    this.view.fillLeftPanel(recipe.steps);
    this.view.setProgress(0, recipe.steps.length);
    this.view.clearAnswer();
  }

  updateProgress(): void {
    const steps = this.model.getProgress();
    const stepsTotal = steps.total; 
    const stepsDone = steps.done; 
    for (let i = 0; i < stepsDone; i++){
      this.view.setStepChecked(i, true);
    }
    this.view.setProgress(stepsDone, stepsTotal);
  }

  updateProblem(): void {
    const problem = this.model.getProblem()
    const x = problem.x;
    const y = problem.y;
    const operation = problem.operation;
    this.view.fillRightPanel(x, y, operation);
  }

  retrieveOrderStatus(): boolean {
    return this.model.isOrderComplete();
  }


}