import { GameTutorialModel, GameTutorial } from "../screens/game-tutorials/gameTutorialModel";
import { TUTORIAL_DATA } from "../screens/game-tutorials/data/tutorialData";

/** 
 * Test loading of tutorials
 */
describe("GameTutorialModel.loadTutorals", () => {
  let model: GameTutorialModel;

  beforeEach(() => {
    model = new GameTutorialModel();
    GameTutorial.resetCount(); // constructor calls it so we need to set counter back to 0 to test properly
  });

  it("creates 1 GameTutorial object per data entry", () => {
    const tutorials = model.loadTutorials();
    expect(tutorials).toHaveLength(TUTORIAL_DATA.length);
  });

  it("doesn't modify title or body from the data file", () =>{
    const tutorials = model.loadTutorials();
    tutorials.forEach((tutorial, idx) => {
      expect(tutorial.getTitle()).toBe(TUTORIAL_DATA[idx].title);
      expect(tutorial.getBody()).toBe(TUTORIAL_DATA[idx].body);
    });
  });

  it("numbers tutorials in order starting from 0", () => {
    const tutorials = model.loadTutorials();
    tutorials.forEach((tutorial, idx) => {
      expect(tutorial.getNum()).toBe(idx);
    })
  })
});