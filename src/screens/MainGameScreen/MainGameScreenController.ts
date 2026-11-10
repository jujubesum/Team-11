import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { MainGameScreenView } from "./MainGameScreenView";
import { HomeScreenController } from "../HomeScreen/HomeScreenController";
import type { Recipe } from "../../recipeManager";

const PLACEHOLDERCIPE: Recipe = { //TO BE DELETED
    id: 'recipe_01',
    name: 'Cookies',
    mathOperations: ['addition'],
    steps: [
      'Add flour, sugar, eggs, and butter',
      'Stir until smooth',
      'Bake in oven',
      'Decorate with sprinkles'
    ],
  }

export class MainGameScreenController extends ScreenController {
  private view: MainGameScreenView;
  private screenSwitcher: ScreenSwitcher;
  private saveManager: SaveManager;

  constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager){
    super();
    this.screenSwitcher = screenSwitcher;
    this.saveManager = saveManager;
    this.view = new MainGameScreenView({
      onHelp: () => this.handleHelp(),
      onSubmit: (answer: string) => this.handleSubmit(answer),
      onHome: () => this.handleHome(),
      onNext: () => this.handleNext(),
      onReplay: () => this.handleReplay(),
    });
    this.updateRecipe(PLACEHOLDERCIPE); // remove when model is created and handles grabbing random order
  }

  getView(): MainGameScreenView {
    return this.view;
  }

  handleHelp(): void { 
    // TODO: Create popup explaining summary of what is to be expected
  }

  handleHome(): void {
    // for now take user back to home screen
    // TODO: Create popup and display "Are you sure?" popup
    this.screenSwitcher.switchToScreen({ type: "home" });
  }

  handleNext(): void {
    // TODO: Cycle to next question, use setProgress to set new progress
    this.view.hideCongrats();
  }

  handleReplay(): void {
    // I think nothing is fine? If no cycling happens, question is not changed and progress bar remains the same
    this.view.hideCongrats();
  }

  handleSubmit(answer: string): void {
    // add logic to validate user input and handle if answer is correct/incorrect
    this.view.clearAnswer();
    this.correctAnswer();
  }

  correctAnswer(): void {
    this.view.showCongrats();
  }

  updateRecipe(recipe: Recipe): void {
    this.view.updateTitle(recipe.name);
    this.view.fillLeftPanel(recipe.steps);
    this.view.setProgress(0, recipe.steps.length);
    this.view.clearAnswer();
  }
}