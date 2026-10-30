import { GameTutorial, GameTutorialModel } from "./gameTutorialModel";
import { GameTutorialView } from "./gameTutorialView";
import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import Konva from "konva";

/**
 * TutorialController - Handles game tutorial screen interactions
 */
export class GameTutorialController extends ScreenController{
  private model: GameTutorialModel;
  private view: GameTutorialView;
  private screenSwitcher: ScreenSwitcher;
  
  constructor(screenSwitcher: ScreenSwitcher, model: GameTutorialModel = new GameTutorialModel(), view: GameTutorialView = new GameTutorialView()) { 
    super();
    this.model = model;
    this.view = view;
    this.screenSwitcher = screenSwitcher;
    this.view.onArrowPress((rightShift) => this.handleArrowButtonPress(rightShift));
    this.updateView();
  }

  /**
   * Make tutorials visible
   */
  showTutorials(){
    this.view.show();
  }

  /**
   * Hide tutorials
   */
  hideTutorials(){
    this.view.hide();
  }

  /**
   * Shift tutorial 1 to the right/left
   */
  shiftTutorialRight(rightShift: boolean): void {
    this.model.shiftTutorialIdxRight(rightShift);
  }

  /**
   * Shift to specific tutorial
   */
  moveToSpecificTutorial(index : number): void {
    this.model.updateTutorialIdx(index);
  }

  /**
   * To be called whenever a user input changes the current tutorial
   */
  updateView(): void {
    const currentTutorial = this.model.getCurrentTutorial();
    this.view.setTutorial(currentTutorial.getTitle(), currentTutorial.getBody());
  }
  
  /**
   * Return to main menu (TO-DO)
   */
  returnToMenu() :void {

  }

  /** 
   * Handles when the user either of the directional buttons
   */
  handleArrowButtonPress(rightShift: boolean){
    this.shiftTutorialRight(rightShift);
    this.updateView();
  }  

  /**
   * Used for testing purposes atm, remove if unnecessary later
   */
  getGroup() : Konva.Group{
    return this.view.getGroup();
  }

  getModel(): GameTutorialModel {
    return this.model;
  }

  getView(): GameTutorialView {
    return this.view;
  }
}