import { MainGameScreenModel } from "../screens/MainGameScreen/MainGameScreenModel";
import { OrderManager } from "../orderManager";
import type { SaveManager } from "../saveManager";
import type { Recipe } from "../recipeManager";
import { applyOperation } from "../questions/questionGenerator";

const COOKIES: Recipe = {
  id: "recipe_01",
  name: "Cookies",
  mathOperations: ["addition"],
  steps: ["Mix", "Stir", "Bake", "Decorate"],
};

const CAKE: Recipe = {
  id: "recipe_05",
  name: "Cake",
  mathOperations: ["addition", "subtraction", "division", "multiplication"],
  steps: ["Add", "Subtract", "Cut", "Frost"],
};

// mock save manager
function makeSaveManager(): SaveManager {
  let data: Record<string, unknown> = {
    unlockedRecipeIds: ["recipe_01"],
    currentOrderId: null,
    completedOrders: 0,
  };
  return {
    getCurrent: () => data,
    update: (changes: Record<string, unknown>) => {
      data = { ...data, ...changes };
    },
    save: () => {},
  } as unknown as SaveManager;
}

// model with an order already started for given recipe
function startOrder(recipe: Recipe = COOKIES) {
  jest.spyOn(OrderManager.prototype, "generateNextOrder").mockReturnValue(recipe);
  const model = new MainGameScreenModel(makeSaveManager());
  model.advanceOrder();
  return model;
}

// correct answer to the model's current problem
function answerOf(model: MainGameScreenModel): number {
  const { x, y, operation } = model.getProblem();
  return applyOperation(x, operation, y);
}

// answer every step of the current order correctly
function finishOrder(model: MainGameScreenModel) {
  const steps = model.getCurrentRecipe().steps.length;
  for (let i = 0; i < steps; i++) {
    model.checkAnswer(answerOf(model));
    if (i < steps - 1) model.advanceProblem();
  }
}

beforeEach(() => {
  // same numbers every run
  jest.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("MainGameScreenModel", () => {
  it("uses the recipe's operation for each step, in order", () => {
    const model = startOrder(CAKE);
    const operations: string[] = [];
    for (let step = 0; step < CAKE.steps.length; step++) {
      operations.push(model.getProblem().operation);
      model.checkAnswer(answerOf(model));
      if (step < CAKE.steps.length - 1) model.advanceProblem();
    }
    expect(operations).toEqual(["+", "-", "÷", "×"]);
  });

  it("returns true for the right answer and false for a wrong one", () => {
    const model = startOrder();
    const answer = answerOf(model);
    expect(model.checkAnswer(answer + 1)).toBe(false);
    expect(model.checkAnswer(answer)).toBe(true);
  });

  it("is not failed after 2 wrong answers, but is after 3", () => {
    const model = startOrder();
    const answer = answerOf(model);
    model.checkAnswer(answer + 1);
    model.checkAnswer(answer + 2);
    expect(model.isOrderFailed()).toBe(false);
    model.checkAnswer(answer + 3);
    expect(model.isOrderFailed()).toBe(true);
  });

  it("does not use up an attempt for negatives or decimals", () => {
    const model = startOrder();
    const answer = answerOf(model);
    expect(model.checkAnswer(-5)).toBe(false);
    expect(model.checkAnswer(3.5)).toBe(false);
    // only these 2 wrong answers count, so the player still has 1 attempt left
    model.checkAnswer(answer + 1);
    model.checkAnswer(answer + 2);
    expect(model.isOrderFailed()).toBe(false);
  });

  it("keeps the same problem and remaining attempts on Try Again", () => {
    const model = startOrder();
    const problem = model.getProblem();
    const answer = answerOf(model);
    model.checkAnswer(answer + 1);
    model.retryProblem(); //"Try Again"
    expect(model.getProblem()).toEqual(problem);
    // attempts carried over: 2 more wrong answers make 3 in total
    model.checkAnswer(answer + 2);
    model.checkAnswer(answer + 3);
    expect(model.isOrderFailed()).toBe(true);
  });

  it("gives fresh attempts after running out (New Question)", () => {
    const model = startOrder();
    const answer = answerOf(model);
    for (let i = 1; i <= 3; i++){
      model.checkAnswer(answer + i);
    }
    model.retryProblem(); // "New Question"
    expect(model.isOrderFailed()).toBe(false);
    expect(model.checkAnswer(answerOf(model))).toBe(true);
  });

  it("is only complete after the last step is answered correctly", () => {
    const model = startOrder();
    for (let step = 0; step < 3; step++) {
      model.checkAnswer(answerOf(model));
      expect(model.isOrderComplete()).toBe(false);
      model.advanceProblem();
    }
    model.checkAnswer(answerOf(model));
    expect(model.isOrderComplete()).toBe(true);
  });

  it("counts every question in the order, including the last one", () => {
    const model = startOrder();
    finishOrder(model);
    expect(model.getStats().questionsAnswered).toBe(4);
    expect(model.getStats().questionsCorrect).toBe(4);
  });

  it("starts a new order at 0/0, even if the last order was abandoned", () => {
    const model = startOrder();
    model.checkAnswer(answerOf(model));
    model.advanceOrder(); // player quit and started a new order
    expect(model.getStats()).toEqual({ questionsAnswered: 0, questionsCorrect: 0, earnings: 0 });
  });

  it("tells the order manager when an order is completed", () => {
    const complete = jest.spyOn(OrderManager.prototype, "completeRecipeAndFetchNextOrder");
    const model = startOrder();
    finishOrder(model);
    model.resetOrder();
    expect(complete).toHaveBeenCalled();
  });
});
