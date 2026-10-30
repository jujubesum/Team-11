import { GameTutorialModel, GameTutorial } from "../screens/game-tutorials/gameTutorialModel";
import { TUTORIAL_DATA } from "../screens/game-tutorials/data/tutorialData";
import { error } from "node:console";

/** 
 * Test loading of tutorials
 */
describe("GameTutorialModel.loadTutorals", () => {
  let model: GameTutorialModel;

  beforeEach(() => {
    model = new GameTutorialModel();
  });

  it("creates 1 GameTutorial object per data entry", () => {
    const tutorials = model.loadTutorials();
    expect(tutorials).toHaveLength(TUTORIAL_DATA.length);
  });

  it("doesn't modify title or body from the data file", () =>{
    const tutorials = model.loadTutorials();
    expect(tutorials.map(tutorial => ({
      title: tutorial.getTitle(), body: tutorial.getBody()
    }))).toEqual(TUTORIAL_DATA);
  });
});

/**
 * Test left/right shifts of tutorials
 */
describe("GameTutorialModel.shiftTutorialIdx", () => {
  let model: GameTutorialModel;

  beforeEach(() => {
    model = new GameTutorialModel();
  });

  it("moves to the next tutorial when shifting right", () => {
    const before = model.getCurrentTutorialIdx();
    model.shiftTutorialIdxRight(true);
    expect(model.getCurrentTutorialIdx()).toBe(before + 1);
  });

  it("moves to the previous tutorial when shifting left", () => {
    model.shiftTutorialIdxRight(true); // shift right by 1 to avoid wrapping scenario for this test
    const before = model.getCurrentTutorialIdx();
    model.shiftTutorialIdxRight(false);
    expect(model.getCurrentTutorialIdx()).toBe(before - 1);
  });

  it("wraps to the final entry when shifting left from the start", () => {
    model.shiftTutorialIdxRight(false);
    expect(model.getCurrentTutorialIdx()).toBe(model.getNumberOfTutorials() - 1);
  });

  it("wraps to the first entry when shifting right from the final entry", () => {
    model.shiftTutorialIdxRight(false); //shift to final entry
    model.shiftTutorialIdxRight(true); // shift right at final entry
    expect(model.getCurrentTutorialIdx()).toBe(0);
  })

  it("moves nowhere from a left shift followed by a rightshift", () => {
    const start = model.getCurrentTutorialIdx();
    model.shiftTutorialIdxRight(false);
    model.shiftTutorialIdxRight(true);
    expect(model.getCurrentTutorialIdx()).toBe(start);
  })

  it("moves nowhere from a right shift followed by a leftshift", () => {
    const start = model.getCurrentTutorialIdx();
    model.shiftTutorialIdxRight(true);
    model.shiftTutorialIdxRight(false);
    expect(model.getCurrentTutorialIdx()).toBe(start);
  })

  it("ends at the start after shifting through all the tutorials", () => {
    const start = model.getCurrentTutorialIdx();
    const iterations = model.getNumberOfTutorials();
    for (let i = 0; i < iterations; i++){
      model.shiftTutorialIdxRight(true);
    }
    expect(model.getCurrentTutorialIdx()).toBe(start);
  })
});

/**
 * Test shifting to a specific tutorial
 */
describe("GameTutorialModel.updateTutorialIdx", () => {
  let model: GameTutorialModel
  beforeEach(() => {
    model = new GameTutorialModel();
  });

  it("updates to the specified index (given valid)", () => {
    const idx = Math.floor(Math.random() * model.getNumberOfTutorials());
    model.updateTutorialIdx(idx);
    expect(model.getCurrentTutorialIdx()).toBe(idx);
  });

  it("throws an error when given an invalid index (negative out of bound)", () => {
    expect(() => model.updateTutorialIdx(-1)).toThrow("Invalid index!");
  });

  it("throws an error when given an invalid index (positive out of bound)", () => {
    expect(() => model.updateTutorialIdx(model.getNumberOfTutorials())).toThrow("Invalid index!");
  });
  
  it("updates to idx of last tutorial successfully", () => {
    model.updateTutorialIdx(model.getNumberOfTutorials()-1);
    expect(model.getCurrentTutorialIdx()).toBe(model.getNumberOfTutorials()-1);
  });
})