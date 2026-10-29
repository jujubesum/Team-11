import { GameTutorialController } from "../screens/game-tutorials/gameTutorialController";
import { GameTutorialModel } from "../screens/game-tutorials/gameTutorialModel";
import type { GameTutorialView } from "../screens/game-tutorials/gameTutorialView";
import { error } from "node:console";

/**
 * Tests arrow button press handler
 */

describe("gameTutorialController.handleArrowButtonPress", () => {
  let controller: GameTutorialController;
  let view: GameTutorialView;
  let model: GameTutorialModel;

  beforeEach(() => {
    model = new GameTutorialModel();
    view = { setTutorial: jest.fn()} as unknown as GameTutorialView // create a mock to detect if visual change occurred
    controller = new GameTutorialController(model, view);
  });

  it("updates view when user presses right arrow", () => {
    controller.handleArrowButtonPress(true);
    const tutorial = model.getCurrentTutorial();
    expect(view.setTutorial).toHaveBeenCalledWith(tutorial.getTitle(), tutorial.getBody());
  });

  it("updates view when uesr presses left arrow", () => {
    controller.handleArrowButtonPress(false);
    const tutorial = model.getCurrentTutorial();
    expect(view.setTutorial).toHaveBeenCalledWith(tutorial.getTitle(), tutorial.getBody());
  });
});

