import { GameTutorialController } from "../screens/game-tutorials/gameTutorialController";
import { GameTutorialModel } from "../screens/game-tutorials/gameTutorialModel";
import type { GameTutorialView } from "../screens/game-tutorials/gameTutorialView";
import type { ScreenSwitcher } from "../types";

/**
 * Tests arrow button press handler
 */

describe("gameTutorialController.handleArrowButtonPress", () => {
  let controller: GameTutorialController;
  let view: GameTutorialView;
  let model: GameTutorialModel;
  let screenSwitcher: ScreenSwitcher;

  beforeEach(() => {
    model = new GameTutorialModel();
    screenSwitcher = { switchToScreen: jest.fn() } as unknown as ScreenSwitcher;
    view = {
       setTutorial: jest.fn(), 
       onArrowPress: jest.fn(),
       onBackPress: jest.fn()} as unknown as GameTutorialView // create a mock to detect if visual change occurred
    controller = new GameTutorialController(screenSwitcher, model, view);
    (view.setTutorial as jest.Mock).mockClear(); //override default setTutorial call
  });

  it("shows the next tutorial when right arrow is pressed", () => {
    controller.handleArrowButtonPress(true);
    const tutorial = model.getCurrentTutorial();
    expect(model.getCurrentTutorialIdx()).toBe(1);
    expect(view.setTutorial).toHaveBeenCalledTimes(1);
    expect(view.setTutorial).toHaveBeenCalledWith(tutorial.getTitle(), tutorial.getBody());
  });

  it("shows previous tutorial when left arrow is pressed from non-starting position", () => {
    controller.handleArrowButtonPress(true); //move 1 position from start
    (view.setTutorial as jest.Mock).mockClear();
    
    controller.handleArrowButtonPress(false);

    const firstTutorial = model.getCurrentTutorial();
    expect(model.getCurrentTutorialIdx()).toBe(0);
    expect(view.setTutorial).toHaveBeenCalledWith(firstTutorial.getTitle(), firstTutorial.getBody());
  });

  it("shows the final tutorial when left arrow is pressed on first tutorial", () => {
    controller.handleArrowButtonPress(false);
    const tutorial = model.getCurrentTutorial();
    expect(model.getCurrentTutorialIdx()).toBe(model.getNumberOfTutorials() - 1);
    expect(view.setTutorial).toHaveBeenCalledWith(tutorial.getTitle(), tutorial.getBody());
  });

  it("shows the first tutorial when right arrow is pressed on final tutorial", () => {
    const firstTutorial = model.getCurrentTutorial();
    model.updateTutorialIdx(model.getNumberOfTutorials() - 1);

    controller.handleArrowButtonPress(true);

    expect(model.getCurrentTutorialIdx()).toBe(0)
    expect(view.setTutorial).toHaveBeenCalledWith(firstTutorial.getTitle(), firstTutorial.getBody());
  });

  it("routes the view's arrow callback to handleArrowButtonPress", () => {
    const handler = (view.onArrowPress as jest.Mock).mock.calls[0][0]; // this line is a little confusing but essentially mocks .onArrowPress, [0][0] being the argument passed to the callback (eg (rightShift))

    handler(true); // functionally, handler = (rightShift) => this.handleArrowButtonPress(rightShift)

    expect(model.getCurrentTutorialIdx()).toBe(1);
    expect(view.setTutorial).toHaveBeenCalledTimes(1);
  });
});

/** Test expected behaviors upon constructor call */
describe("GameTutorialController.constructor", () => {
  let controller: GameTutorialController;
  let view: GameTutorialView;
  let model: GameTutorialModel;
  let screenSwitcher: ScreenSwitcher;

  beforeEach(() => {
    model = new GameTutorialModel();
    view = {
       setTutorial: jest.fn(), 
       onArrowPress: jest.fn(),
       onBackPress: jest.fn()} as unknown as GameTutorialView
    screenSwitcher = { switchToScreen: jest.fn() } as unknown as ScreenSwitcher;
  });

  it("displays the first tutorial on construction", () => {
    controller = new GameTutorialController(screenSwitcher, model, view);
    const firstTutorial = model.getCurrentTutorial();
    expect(view.setTutorial).toHaveBeenCalledTimes(1);
    expect(view.setTutorial).toHaveBeenCalledWith(firstTutorial.getTitle(), firstTutorial.getBody());
  });

  it("registers an arrow press handler with the view", () => {
    controller = new GameTutorialController(screenSwitcher, model,view);
    expect(view.onArrowPress).toHaveBeenCalledTimes(1);
  });
});


