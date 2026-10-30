import { GameTutorial, GameTutorialModel } from "./gameTutorialModel";
import type { GameTutorialView } from "./gameTutorialView";
import Konva from "konva";

/**
 * TutorialController - Handles game tutorial screen interactions
 */
export class GameTutorialController {
  private model: GameTutorialModel;
  private view: GameTutorialView;
  
  constructor(model: GameTutorialModel, view: GameTutorialView) { // add screenSwitcher as parameter when ready
    // this.screenSwitcher = screenSwitcher; //uncomment when ready
    this.model = model;
    this.view = view;
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
   * Return to main menu
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