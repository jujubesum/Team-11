import { error } from "node:console";
import { TUTORIAL_DATA } from "./data/tutorialData";


/**
 * Game tutorial stores data on a tutorial's title, body, and what idx it is
 */

export class GameTutorial {
  private title: string;
  private body: string;

  constructor(title: string, body: string){
    this.title = title;
    this.body = body;
  }

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
   * Update to specific tutorial idx
   * @param idx update to index if valid
   */
  updateTutorialIdx(idx: number){
    if (idx < 0 || idx >= this.tutorials.length) {
      throw new Error('Invalid index!')
    }
    this.currentTutorialIdx = idx;
  }

  /**
   * shift right or left based on input
   * @param rightShift if true shift right, otherwise shift left
   */
  shiftTutorialIdxRight(rightShift: boolean): void{
    if (rightShift) this.currentTutorialIdx = (this.currentTutorialIdx + 1) % this.getNumberOfTutorials();
    else {
      if (this.currentTutorialIdx == 0) this.currentTutorialIdx = this.getNumberOfTutorials() - 1;
      else this.currentTutorialIdx = this.currentTutorialIdx - 1
    }
  }

  /**
   * Getters
   */
  getCurrentTutorialIdx(): number {
    return this.currentTutorialIdx;
  }

  getNumberOfTutorials(): number {
    return this.tutorials.length;
  }
}