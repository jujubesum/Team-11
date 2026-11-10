import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { MainGameScreenView } from "./MainGameScreenView";
import { HomeScreenController } from "../HomeScreen/HomeScreenController";
import type { Recipe } from "../../recipeManager";

const PLACEHOLDERCIPE: Recipe = {
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
    });
    this.updateRecipe(PLACEHOLDERCIPE); // remove when model is created and handles grabbing random order
  }

  getView(): MainGameScreenView {
    return this.view;
  }

  handleHelp(): void {

  }

  handleHome(): void {
    // for now take user back to home screen
    // TODO Create popup and display "Are you sure?" popup
    this.screenSwitcher.switchToScreen({ type: "home" });
  }

  handleSubmit(answer: string): void {
    // add logic to validate user input and handle if answer is correct/incorrect
    this.view.clearAnswer();
  }

  updateRecipe(recipe: Recipe): void {
    this.view.updateTitle(recipe.name);
    this.view.fillLeftPanel(recipe.steps);
    this.view.setProgress(0, recipe.steps.length);
    this.view.clearAnswer();
  }
}