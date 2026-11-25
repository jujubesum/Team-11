import "jest-canvas-mock";
import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { CashierGameController } from "../CashierMiniGame/CashierGameController.ts";
import { DENOMINATIONS, HELP_TEXT } from "../CashierMiniGame/CashierGameView.ts";
import {
  CashierGameManager, calculateReward, generateQuestion, type CashierSnapshot, type Difficulty,
} from "../CashierMiniGame/cashierGameManager.ts";
import { SaveManager, SAVE_KEY } from "../saveManager.ts";
import { TOP_BAR_HEIGHT } from "../components/TopBar.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";

// Splits an amount into the available bills and coins, largest first
function makeChange(cents: number): number[] {
  const pieces: number[] = [];
  for (const { cents: value } of DENOMINATIONS) {
    while (cents >= value) { pieces.push(value); cents -= value; }
  }
  return pieces;
}

describe("generateQuestion", () => {
  it("always produces change that the available money can make", () => {
    for (const difficulty of [1, 2, 3, 4] as Difficulty[]) {
      for (let i = 0; i < 200; i++) {
        const q = generateQuestion(difficulty);
        expect(Number.isInteger(q.changeCents)).toBe(true);
        expect(q.changeCents).toBeGreaterThan(0);
        expect(makeChange(q.changeCents).reduce((a, b) => a + b, 0)).toBe(q.changeCents);
      }
    }
  });
});

describe("CashierGameManager.submitChange", () => {
  let manager: CashierGameManager;
  beforeEach(() => { manager = new CashierGameManager(() => 0); manager.start(); });
  const change = () => manager.getSnapshot().question!.changeCents;

  it("scores a correct answer and moves to a new transaction", () => {
    const result = manager.submitChange(change());
    expect(result.correct).toBe(true);
    expect(manager.getSnapshot().score).toBe(result.points);
    expect(manager.getSnapshot().streak).toBe(1);
    expect(manager.getSnapshot().correctAnswers).toBe(1);
  });

  it("resets the streak on a wrong answer and keeps the same transaction", () => {
    manager.submitChange(change());
    const question = manager.getSnapshot().question;
    const result = manager.submitChange(change() + 1);
    expect(result).toEqual({ correct: false, points: 0, message: "Not quite! Try again." });
    expect(manager.getSnapshot().streak).toBe(0);
    expect(manager.getSnapshot().question).toBe(question);
  });

  it("raises the difficulty and adds discounts as the player improves", () => {
    for (let i = 0; i < 3; i++) manager.submitChange(change());
    expect(manager.getSnapshot().question!.difficulty).toBe(2);
    for (let i = 0; i < 9; i++) manager.submitChange(change());
    expect(manager.getSnapshot().question!.difficulty).toBe(4);
    expect(manager.getSnapshot().question!.discountPercent).toBeGreaterThan(0);
  });

  it("still accepts typed answers", () => {
    expect(manager.submitAnswer((change() / 100).toFixed(2)).correct).toBe(true);
  });

  it("ends the game after two minutes", () => {
    manager.tick(120);
    expect(manager.getSnapshot().active).toBe(false);
    expect(manager.submitChange(100).correct).toBe(false);
  });
});

describe("CashierGameManager pause and resume", () => {
  it("does not count paused time against the speed bonus", () => {
    let now = 0;
    const manager = new CashierGameManager(() => now);
    manager.start();
    now = 2000;
    manager.pause();
    now = 60_000;
    manager.resume();
    expect(manager.submitChange(manager.getSnapshot().question!.changeCents).points).toBe(100 + 18 * 5);
  });

  it("ignores resume without a pause and repeated pauses", () => {
    let now = 0;
    const manager = new CashierGameManager(() => now);
    manager.start();
    manager.resume();
    manager.pause();
    now = 5000;
    manager.pause();
    manager.resume();
    expect(manager.submitChange(manager.getSnapshot().question!.changeCents).points).toBe(200);
  });
});

describe("CashierGameManager.reset", () => {
  it("returns to the pre-game state", () => {
    const manager = new CashierGameManager(() => 0);
    manager.start();
    manager.submitChange(manager.getSnapshot().question!.changeCents);
    manager.tick(30);
    manager.reset();
    expect(manager.getSnapshot()).toEqual({
      score: 0, streak: 0, correctAnswers: 0, timeLeftSeconds: 120, active: false, question: null,
    });
  });
});

describe("calculateReward", () => {
  it.each([[0, 0], [999, 0], [1000, 1], [1999, 1], [2000, 2], [5500, 5], [-50, 0]])(
    "%i points earns $%i", (score, dollars) => {
      expect(calculateReward(score)).toBe(dollars);
    });
});

describe("CashierGameController", () => {
  let screenSwitcher: ScreenSwitcher;
  let saveManager: SaveManager;
  let manager: CashierGameManager;
  let controller: CashierGameController;
  let submitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    submitSpy = jest.spyOn(CashierGameManager.prototype, "submitChange");
    screenSwitcher = { switchToScreen: jest.fn() };
    saveManager = new SaveManager();
    saveManager.startNewGame();
    manager = new CashierGameManager();
    controller = new CashierGameController(screenSwitcher, saveManager, manager);
    controller.show();
    clickButton(root(), "Start");
  });

  afterEach(() => {
    controller.destroy();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const root = () => controller.getView().getGroup();
  const clickMoney = (cents: number) => root().findOne<Konva.Group>(`.money-${cents}`)!.fire("click");
  const centsIn = (name: string) =>
    Math.round(Number(root().findOne<Konva.Text>(`.${name}`)!.text().replace("$", "")) * 100);
  const owed = () => centsIn("customer-pays") - centsIn("customer-total");
  const submitButtonEnabled = () => {
    const label = root().find<Konva.Text>("Text").find(t => t.text() === "Submit")!;
    return label.fill() === "black";
  };
  const hasVisibleTextStarting = (prefix: string) =>
    root().find<Konva.Text>("Text").some(t => t.text().startsWith(prefix) && t.isVisible());
  const visibleTextIncluding = (part: string) =>
    root().find<Konva.Text>("Text").some(t => t.text().includes(part) && t.isVisible());
  const money = () => saveManager.getCurrent()!.money;

  // Makes the round end with the given score once the clock runs out
  const finishRoundWithScore = (score: number) => {
    const real = CashierGameManager.prototype.getSnapshot.bind(manager);
    jest.spyOn(manager, "getSnapshot").mockImplementation((): CashierSnapshot => ({ ...real(), score }));
    jest.advanceTimersByTime(120_000);
  };

  describe("gameplay", () => {
    it("shows all six denominations with their images", () => {
      for (const d of DENOMINATIONS) {
        expect(hasVisibleText(root(), d.label)).toBe(true);
        const images = root().findOne<Konva.Group>(`.money-${d.cents}`)!.find<Konva.Image>("Image");
        expect((images[0]!.image() as HTMLImageElement).src).toContain(d.image);
      }
    });

    it("shows the image once loaded and keeps a fallback when loading fails", () => {
      const quarter = root().findOne<Konva.Group>(".money-25")!.find<Konva.Image>("Image")[0]!;
      const dime = root().findOne<Konva.Group>(".money-10")!.find<Konva.Image>("Image")[0]!;
      jest.spyOn(console, "warn").mockImplementation(() => {});
      (quarter.image() as HTMLImageElement).dispatchEvent(new Event("load"));
      (dime.image() as HTMLImageElement).dispatchEvent(new Event("error"));
      expect(quarter.visible()).toBe(true);
      expect(dime.visible()).toBe(false);
      expect(hasVisibleText(root(), "10¢")).toBe(true);
    });

    it("shows only the customer total and amount paid on the transaction card", () => {
      const q = manager.getSnapshot().question!;
      expect(hasVisibleText(root(), "Customer total")).toBe(true);
      expect(hasVisibleText(root(), "Customer pays")).toBe(true);
      expect(centsIn("customer-total")).toBe(q.totalCents);
      expect(centsIn("customer-pays")).toBe(q.paidCents);
      for (const hidden of ["Customer orders", "Subtotal", "Discount", "Difficulty", "Correct: "]) {
        expect(hasVisibleTextStarting(hidden)).toBe(false);
      }
    });

    it("adds up clicked money, including repeated clicks", () => {
      expect(hasVisibleText(root(), "Your change: $0.00")).toBe(true);
      [100, 100, 25, 25, 10, 5].forEach(clickMoney);
      expect(hasVisibleText(root(), "Your change: $2.65")).toBe(true);
      expect(hasVisibleText(root(), "×2")).toBe(true);
    });

    it("undoes the last piece and clears the selection", () => {
      [500, 1, 10].forEach(clickMoney);
      clickButton(root(), "Undo");
      expect(hasVisibleText(root(), "Your change: $5.01")).toBe(true);
      clickButton(root(), "Clear");
      expect(hasVisibleText(root(), "Your change: $0.00")).toBe(true);
    });

    it("scores a correct answer and resets the selection for the next customer", () => {
      makeChange(owed()).forEach(clickMoney);
      clickButton(root(), "Submit");
      expect(hasVisibleText(root(), "Score: 0")).toBe(false);
      expect(hasVisibleText(root(), "Streak: 1")).toBe(true);
      expect(hasVisibleTextStarting("Correct! +")).toBe(true);
      expect(hasVisibleText(root(), "Your change: $0.00")).toBe(true);
    });

    it("shows feedback for a wrong answer and blocks duplicate submissions", () => {
      makeChange(owed() + 1).forEach(clickMoney);
      clickButton(root(), "Submit");
      clickButton(root(), "Submit");
      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(hasVisibleText(root(), "Not quite! Try again.")).toBe(true);
      expect(hasVisibleText(root(), "Streak: 0")).toBe(true);
      expect(submitButtonEnabled()).toBe(false);

      clickButton(root(), "Undo");
      expect(submitButtonEnabled()).toBe(true);
    });

    it("does not submit an empty selection", () => {
      clickButton(root(), "Submit");
      expect(submitSpy).not.toHaveBeenCalled();
    });

    it("counts down and shows the game-over screen", () => {
      jest.advanceTimersByTime(5000);
      expect(hasVisibleText(root(), "Time: 1:55")).toBe(true);
      jest.advanceTimersByTime(115_000);
      expect(hasVisibleText(root(), "Time's up!")).toBe(true);
      expect(visibleTextIncluding("Final score: 0")).toBe(true);
      expect(visibleTextIncluding("Customers served: 0")).toBe(true);
      expect(visibleTextIncluding("Money earned: $0")).toBe(true);
      expect(hasVisibleText(root(), "Play Again")).toBe(true);
      expect(hasVisibleText(root(), "Submit")).toBe(false);
    });

    it("starts another round after a completed game", () => {
      jest.advanceTimersByTime(120_000);
      clickButton(root(), "Play Again");
      expect(hasVisibleText(root(), "Time: 2:00")).toBe(true);
      expect(hasVisibleText(root(), "Submit")).toBe(true);
      jest.advanceTimersByTime(1000);
      expect(hasVisibleText(root(), "Time: 1:59")).toBe(true);
      expect(jest.getTimerCount()).toBe(1);
    });
  });

  describe("shared top bar", () => {
    const barRect = () => root().find<Konva.Rect>("Rect").find(r => r.fill() === "#a6a6a6" && r.width() === STAGE_WIDTH)!;

    it("uses the shared TopBar at stage size, outside the scaled content", () => {
      const rect = barRect();
      expect(rect).toBeDefined();
      expect(rect.height()).toBe(TOP_BAR_HEIGHT);
      expect(rect.getAbsoluteScale()).toEqual({ x: 1, y: 1 });
      expect(rect.getAbsolutePosition()).toEqual({ x: 0, y: 0 });
      const title = root().find<Konva.Text>("Text").find(t => t.text() === "Cashier Rush")!;
      expect(title.fontSize()).toBe(56);
      expect(title.getAbsoluteScale()).toEqual({ x: 1, y: 1 });
      expect(hasVisibleText(root(), "⌂")).toBe(true);
      expect(hasVisibleText(root(), "?")).toBe(true);
      expect(hasVisibleText(root(), "Back")).toBe(false);
    });

    it("keeps the game content between the top bar and the bottom of the stage", () => {
      const box = root().getChildren()[1]!.getClientRect();
      expect(box.y).toBeGreaterThanOrEqual(TOP_BAR_HEIGHT);
      expect(box.y + box.height).toBeLessThanOrEqual(STAGE_HEIGHT);
      expect(hasVisibleTextStarting("Time: ")).toBe(true);
      const time = root().find<Konva.Text>("Text").find(t => t.text().startsWith("Time: "))!;
      expect(time.getAbsolutePosition().y).toBeGreaterThanOrEqual(TOP_BAR_HEIGHT);
    });

    it("goes home with the home button", () => {
      clickButton(root(), "⌂");
      expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
    });

    it("opens help, pauses the clock, and resumes after Done", () => {
      jest.advanceTimersByTime(3000);
      clickButton(root(), "?");
      expect(hasVisibleText(root(), HELP_TEXT)).toBe(true);
      expect(HELP_TEXT).toContain("$1 for every 1,000 points");
      expect(jest.getTimerCount()).toBe(0);
      jest.advanceTimersByTime(10_000);
      expect(hasVisibleText(root(), "Time: 1:57")).toBe(true);

      clickButton(root(), "Done");
      expect(hasVisibleText(root(), HELP_TEXT)).toBe(false);
      jest.advanceTimersByTime(1000);
      expect(hasVisibleText(root(), "Time: 1:56")).toBe(true);

      clickMoney(100);
      expect(hasVisibleText(root(), "Your change: $1.00")).toBe(true);
    });

    it("closes the help popup when leaving the screen", () => {
      clickButton(root(), "?");
      controller.hide();
      controller.show();
      expect(hasVisibleText(root(), HELP_TEXT)).toBe(false);
      expect(hasVisibleText(root(), "Start")).toBe(true);
    });

    it("does not count time spent reading help against the speed bonus", () => {
      clickButton(root(), "?");
      jest.advanceTimersByTime(60_000);
      clickButton(root(), "Done");
      makeChange(owed()).forEach(clickMoney);
      clickButton(root(), "Submit");
      expect(hasVisibleText(root(), "Correct! +200 points")).toBe(true);
    });
  });

  describe("leaving and returning", () => {
    it("stops the timer on exit and shows the start screen on reentry", () => {
      jest.advanceTimersByTime(5000);
      [100, 25].forEach(clickMoney);
      controller.hide();
      expect(jest.getTimerCount()).toBe(0);
      jest.advanceTimersByTime(30_000);

      controller.show();
      expect(hasVisibleText(root(), "Serve customers for two minutes!")).toBe(true);
      expect(hasVisibleText(root(), "Start")).toBe(true);
      expect(hasVisibleText(root(), "Submit")).toBe(false);
      expect(hasVisibleText(root(), "Time: 2:00")).toBe(true);
      expect(hasVisibleText(root(), "Score: 0")).toBe(true);
      expect(jest.getTimerCount()).toBe(0);

      clickButton(root(), "Start");
      expect(hasVisibleText(root(), "Your change: $0.00")).toBe(true);
      jest.advanceTimersByTime(1000);
      expect(hasVisibleText(root(), "Time: 1:59")).toBe(true);
    });

    it("never runs more than one interval", () => {
      controller.show();
      controller.show();
      expect(jest.getTimerCount()).toBe(1);
      for (let i = 0; i < 3; i++) {
        controller.hide();
        controller.show();
        clickButton(root(), "Start");
      }
      expect(jest.getTimerCount()).toBe(1);
      jest.advanceTimersByTime(1000);
      expect(hasVisibleText(root(), "Time: 1:59")).toBe(true);
    });

    it("keeps currency, Undo, Clear, and Submit working after reentry", () => {
      for (let i = 0; i < 3; i++) { controller.hide(); controller.show(); }
      clickButton(root(), "Start");
      clickMoney(100);
      expect(hasVisibleText(root(), "Your change: $1.00")).toBe(true);
      clickMoney(25);
      clickButton(root(), "Undo");
      expect(hasVisibleText(root(), "Your change: $1.00")).toBe(true);
      clickButton(root(), "Clear");
      expect(hasVisibleText(root(), "Your change: $0.00")).toBe(true);
      makeChange(owed()).forEach(clickMoney);
      clickButton(root(), "Submit");
      expect(submitSpy).toHaveBeenCalledTimes(1);
      expect(hasVisibleText(root(), "Streak: 1")).toBe(true);
    });

    it("returns to the start screen after leaving a finished game", () => {
      jest.advanceTimersByTime(120_000);
      controller.hide();
      controller.show();
      expect(hasVisibleText(root(), "Start")).toBe(true);
      expect(hasVisibleText(root(), "Time's up!")).toBe(false);
    });
  });

  describe("rewards", () => {
    it.each([[999, 0], [1000, 1], [1999, 1], [2000, 2]])("%i points adds $%i", (score, dollars) => {
      finishRoundWithScore(score);
      expect(money()).toBe(dollars);
      expect(visibleTextIncluding(`Money earned: $${dollars}`)).toBe(true);
      expect(visibleTextIncluding(`Final score: ${score.toLocaleString("en-US")}`)).toBe(true);
    });

    it("pays out only once per round", () => {
      finishRoundWithScore(2500);
      expect(money()).toBe(2);
      expect(visibleTextIncluding("Money earned: $2")).toBe(true);
      jest.advanceTimersByTime(60_000);
      for (let i = 0; i < 3; i++) { controller.hide(); controller.show(); }
      expect(money()).toBe(2);
    });

    it("adds to money earned elsewhere and accumulates across rounds", () => {
      saveManager.update({ money: 10 });
      finishRoundWithScore(2000);
      expect(money()).toBe(12);
      clickButton(root(), "Play Again");
      expect(visibleTextIncluding("Money earned")).toBe(false);
      finishRoundWithScore(3500);
      expect(money()).toBe(15);
    });

    it("pays out the score so far when the player leaves early, exactly once", () => {
      saveManager.update({ money: 3 });
      const real = CashierGameManager.prototype.getSnapshot.bind(manager);
      jest.spyOn(manager, "getSnapshot").mockImplementation((): CashierSnapshot => ({ ...real(), score: 2500 }));
      jest.advanceTimersByTime(60_000);
      clickButton(root(), "⌂");
      controller.hide();
      expect(money()).toBe(5);
      expect(localStorage.getItem(SAVE_KEY)).toContain('"money":5');

      jest.restoreAllMocks();
      controller.hide();
      controller.show();
      controller.hide();
      jest.advanceTimersByTime(120_000);
      expect(money()).toBe(5);
    });

    it("pays nothing when leaving early with under 1,000 points", () => {
      makeChange(owed()).forEach(clickMoney);
      clickButton(root(), "Submit");
      controller.hide();
      expect(money()).toBe(0);
      controller.show();
      expect(hasVisibleText(root(), "Score: 0")).toBe(true);
    });

    it("does not pay when the screen is hidden without a round in progress", () => {
      controller.hide();
      const idle = new CashierGameController(screenSwitcher, saveManager, new CashierGameManager());
      idle.hide();
      idle.show();
      idle.hide();
      expect(money()).toBe(0);
    });

    it("persists the new balance and leaves the rest of the save alone", () => {
      saveManager.update({
        level: 3, money: 7, unlockedRecipeIds: ["recipe_01", "recipe_02"], customizations: ["kitchen_green"],
        activeKitchenId: "kitchen_green", currentOrderId: "recipe_02", completedOrders: 4,
      });
      saveManager.save();
      const before = new SaveManager().load()!;

      finishRoundWithScore(5500);

      const after = new SaveManager().load()!;
      expect(after.money).toBe(12);
      const { money: _m1, lastSavedAt: _l1, ...restBefore } = before;
      const { money: _m2, lastSavedAt: _l2, ...restAfter } = after;
      expect(restAfter).toEqual(restBefore);
    });

    it("handles a missing save without creating or overwriting one", () => {
      controller.destroy();
      localStorage.clear();
      jest.spyOn(console, "warn").mockImplementation(() => {});
      saveManager = new SaveManager();
      manager = new CashierGameManager();
      controller = new CashierGameController(screenSwitcher, saveManager, manager);
      controller.show();
      clickButton(root(), "Start");

      finishRoundWithScore(3000);

      expect(saveManager.getCurrent()).toBeNull();
      expect(saveManager.hasSave()).toBe(false);
      expect(visibleTextIncluding("Money earned: $3 (not saved")).toBe(true);
    });
  });
});
