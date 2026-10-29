import { TUTORIAL_DATA } from "./data/tutorialData";


/**
 * Game tutorial stores data on a tutorial's title, body, and what idx it is
 */

export class GameTutorial {
  private title: string;
  private body: string;
  private static tutorialCount = 0;

  constructor(title: string, body: string){
    this.title = title;
    this.body = body;
  }

  /**
   * Reset tutorial count
   */
  static resetCount() { GameTutorial.tutorialCount = 0; }

  /** Ahead will be a number of getters for testing purposes */

  getTitle(){
    return this.title;
  }

  getBody(){
    return this.body;
  }
}

/**
 * GameTutorialModel - manages tutorial state
 */
export class GameTutorialModel {
  private tutorials: GameTutorial[];
  private currentTutorialIdx: number; 

  constructor(){
    this.tutorials = this.loadTutorials();
    this.currentTutorialIdx = 0;
  }

  /**
   * Load the tutorials contained in the data folder
   */
  loadTutorials(): GameTutorial[]{
    return TUTORIAL_DATA.map((tutorial) => new GameTutorial(tutorial.title, tutorial.body));
  }

  /**
   * Update to new tutorial idx
   */
  updateTutorialIdx(idx: number){
    this.currentTutorialIdx = idx;
  }
}