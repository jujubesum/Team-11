import { GameTutorialModel } from "./gameTutorialModel";
import { GameTutorialView } from "./gameTutorialView";
import Konva from "konva";

/**
 * TutorialController - Handles game tutorial screen interactions
 */
export class GameTutorialController {
  private model: GameTutorialModel;
  private view: GameTutorialView;
  
  constructor() { // add screenSwitcher as parameter when ready
    // this.screenSwitcher = screenSwitcher; //uncomment when ready
    this.model = new GameTutorialModel;
    this.view = new GameTutorialView;
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

  updateTutorial(): void {
    const currentTutorial = this.model.getCurrentTutorial();
    this.view.setTutorial(currentTutorial.getTitle(), currentTutorial.getBody());
  }
  
  /**
   * Return to main menu
   */
  returnToMenu() :void {

  }

  getGroup() : Konva.Group{
    return this.view.getGroup();
  }
}