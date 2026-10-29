import { GameTutorialModel } from "./gameTutorialModel";
import { GameTutorialView } from "./gameTutorialView";

/**
 * TutorialController - Handles game tutorial screen interactions
 */
export class GameTutorialController {
  private model: GameTutorialModel;
  private view: GameTutorialView;
  
  constructor() { // add screenSwitcher as parameter when ready
    // this.screenSwitcher = screenSwitcher; //uncomment when ready
    this.model = new GameTutorialModel;
    this.view = new GameTutorialModel;
  }
}