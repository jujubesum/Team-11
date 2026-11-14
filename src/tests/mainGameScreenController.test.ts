import { MainGameScreenController } from "../screens/MainGameScreen/MainGameScreenController";
import { MainGameScreenModelApi } from "../screens/MainGameScreen/MainGameScreenModel";
import type { MainGameScreenHandlers, MainGameScreenView } from "../screens/MainGameScreen/MainGameScreenView";
import type { ScreenSwitcher } from "../types";
import type { SaveManager } from "../saveManager";

const PLACEHOLDER_RECIPE = {
  id: "recipe_01",
  name: "Cookies",
  mathOperations: ["addition"],
  steps: [
    "Add flour, sugar, eggs, and butter",
    "Stir until smooth",
    "Bake in oven",
    "Decorate with sprinkles",
  ],
}

// Mocks
function makeFakeModel(overrides: Partial<MainGameScreenModelApi> = {}): MainGameScreenModelApi {
  return {
    checkAnswer: jest.fn(() => true),
    advanceProblem: jest.fn(),
    retryProblem: jest.fn(),
    replayProblem: jest.fn(),
    advanceOrder: jest.fn(),
    resetOrder: jest.fn(),
    isOrderComplete: jest.fn(() => false),
    isOrderTaken: jest.fn(() => false),
    isOrderFailed: jest.fn(() => false),
    save: jest.fn(),
    getCurrentRecipe: jest.fn(() => (PLACEHOLDER_RECIPE)), 
    getProgress: jest.fn(() => ({ done: 0, total: 4 })),
    getProblem: jest.fn(() => ({ x: 4, y: 4, operation: "+"})),
    getHint: jest.fn(() => 0),
    getStats: jest.fn(() => ({ questionsAnswered: 4, questionsCorrect: 4, earnings: 40 })),
    ...overrides,
  }
}

function makeController(overrides: Partial<MainGameScreenModelApi> = {}) {
  model = makeFakeModel(overrides);
  return new MainGameScreenController(screenSwitcher, saveManager, model, createView);
}

let handlers!: MainGameScreenHandlers;
let view: MainGameScreenView;
let screenSwitcher: ScreenSwitcher;
let model: MainGameScreenModelApi;
const createView = (h: MainGameScreenHandlers) => { handlers = h; return view;}
const saveManager = {} as unknown as SaveManager;

describe("MainGameScreenController", () => {
  beforeEach(() => {
    view = {
      fillLeftPanel: jest.fn(), fillRightPanel: jest.fn(), setProgress: jest.fn(),
      setStepChecked: jest.fn(), clearAnswer: jest.fn(), showPopup: jest.fn(),
      hidePopup: jest.fn(), setActivePopup: jest.fn(), showHint: jest.fn(),
      updateTitle: jest.fn(), showWarning: jest.fn(), setOrderStats: jest.fn(),
      showGuide: jest.fn(),
    } as unknown as MainGameScreenView;
    screenSwitcher = { switchToScreen: jest.fn() } as unknown as ScreenSwitcher;
    model = makeFakeModel();
  });

  it("checks if a recipe is loaded upon creation", () => {
    makeController();
    expect(model.isOrderTaken).toHaveBeenCalledTimes(1);
  });

  it("loads new order and fills panels when user chooses to start a new order", () => {
    const controller = makeController();
    controller.handleNextOrder();

    expect(model.advanceOrder).toHaveBeenCalledTimes(1);
    expect(view.updateTitle).toHaveBeenCalledTimes(1);
    expect(view.fillLeftPanel).toHaveBeenCalledTimes(1);
    expect(view.fillRightPanel).toHaveBeenCalledTimes(1);
    expect(view.setProgress).toHaveBeenCalledTimes(1);
  });

  it("saves and returns user to home screen when user chooses to save and quit", () => {
    const controller = makeController();
    controller.handleSaveQuit();

    expect(model.save).toHaveBeenCalledTimes(1);
    expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
  });

  it("displays an error popup when user enters an invalid input", () => {
    const controller = makeController();
    controller.handleNextOrder();
    controller.handleSubmit("junktext");

    expect(view.clearAnswer).toHaveBeenCalled();
    expect(view.showWarning).toHaveBeenCalledTimes(1);
    expect(model.checkAnswer).not.toHaveBeenCalled();
  });

  it.each(["", "   ", "abc", "12abc"])("rejects invalid input %j", (input) => {
    makeController();
    handlers.onSubmit(input);
    expect(view.showWarning).toHaveBeenCalledTimes(1);
    expect(model.checkAnswer).not.toHaveBeenCalled();
  });

  it("displays incorrect answer popup when user enters a valid but incorrect input", () => {
    const controller = makeController({ checkAnswer: jest.fn(() => false) });
    controller.handleNextOrder();
    controller.handleSubmit("99999");

    expect(model.checkAnswer).toHaveBeenCalledWith(99999);
    expect(view.setActivePopup).toHaveBeenCalledWith("incorrect");
  });

  it("displays correct answer popup when user enters a correct answer", () => {
    const controller = makeController({ checkAnswer: jest.fn(() => true) });
    controller.handleNextOrder();
    controller.handleSubmit("0");

    expect(model.checkAnswer).toHaveBeenCalledWith(0);
    expect(view.setActivePopup).toHaveBeenCalledWith("congrats")
  });

  it("displays failure popup when user submits an incorrect answer on their last attempt", () => {
    const controller = makeController({ checkAnswer: jest.fn(() => false), isOrderFailed: jest.fn(() => true) });
    controller.handleNextOrder();
    controller.handleSubmit("99999");

    expect(model.checkAnswer).toHaveBeenCalledWith(99999);
    expect(model.isOrderFailed).toHaveBeenCalled();
    expect(view.setActivePopup).toHaveBeenCalledWith("fail");
  });

  it("displays congrats popup when user submits a correct answer on the last step of the recipe", () => {
    const controller = makeController({ checkAnswer: jest.fn(() => true), isOrderComplete: jest.fn(() => true) });
    controller.handleNextOrder();
    controller.handleSubmit("0");

    expect(model.checkAnswer).toHaveBeenCalledWith(0);
    expect(model.isOrderComplete).toHaveBeenCalled();
    expect(view.setActivePopup).toHaveBeenCalledWith("complete");
  });

  it("displays help popup when user presses help (question mark button)", () => {
    const controller = makeController();
    controller.handleNextOrder();

    controller.handleHelp();
    expect(view.showGuide).toHaveBeenCalledTimes(1);
  });

  it("advances to next problem and updates ui when user answers a question correctly and advances", () => {
    const controller = makeController({ getProgress: jest.fn(() => ({ done: 1, total: 4 }))})
    controller.handleNextOrder();

    controller.handleNext();
    expect(model.advanceProblem).toHaveBeenCalledTimes(1);
    expect(view.setProgress).toHaveBeenCalledTimes(2);
    expect(view.setStepChecked).toHaveBeenCalled();
    expect(view.fillRightPanel).toHaveBeenCalledTimes(2);
  });

  it("replays question and doesn't advance question when user presses retry", () => {
    const controller = makeController();
    controller.handleNextOrder();

    controller.handleReplay();
    expect(model.advanceProblem).not.toHaveBeenCalled();
  });

  it("displays are you sure popup when user presses home button mid-game", () => {
    const controller = makeController();
    controller.handleNextOrder();

    controller.handleHome();

    expect(view.setActivePopup).toHaveBeenCalledWith("home");
    expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
  });

  it("rerolls and displays new question when user chooses to try again", () => {
    const controller = makeController();
    controller.handleNextOrder();

    controller.handleReroll();

    expect(model.advanceProblem).not.toHaveBeenCalled();
    expect(view.fillRightPanel).toHaveBeenCalledTimes(2);
  });
});