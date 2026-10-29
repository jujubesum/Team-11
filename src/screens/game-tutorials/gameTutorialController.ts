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
    this.updateTutorial();
  }

  /**
   * Shift to specific tutorial
   */
  moveToSpecificTutorial(index : number){
    this.model.updateTutorialIdx(index);
    this.updateTutorial();
  }

  /**
   * To be called whenever a user input changes the current tutorial
   */
  updateTutorial(): void {
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
  handleArrowButtonPress(rightArrowPressed: boolean){
    this.shiftTutorialRight(rightArrowPressed);
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