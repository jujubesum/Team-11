import "jest-canvas-mock";
import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { CashierGameController } from "../CashierMiniGame/CashierGameController.ts";
import { DENOMINATIONS } from "../CashierMiniGame/CashierGameView.ts";
import { CashierGameManager, generateQuestion, type Difficulty } from "../CashierMiniGame/cashierGameManager.ts";

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

describe("CashierGameController", () => {
  let screenSwitcher: ScreenSwitcher;
  let controller: CashierGameController;
  let submitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    submitSpy = jest.spyOn(CashierGameManager.prototype, "submitChange");
    screenSwitcher = { switchToScreen: jest.fn() };
    controller = new CashierGameController(screenSwitcher);
    controller.show();
    clickButton(root(), "Start");
  });

  afterEach(() => {
    controller.destroy();
    submitSpy.mockRestore();
    jest.useRealTimers();
  });

  const root = () => controller.getView().getGroup();
  const clickMoney = (cents: number) => root().findOne<Konva.Group>(`.money-${cents}`)!.fire("click");
  const moneyFromText = (prefix: string) => {
    const node = root().find<Konva.Text>("Text").find(t => t.text().startsWith(prefix) && t.isVisible());
    return Math.round(Number(node!.text().slice(prefix.length).replace("$", "")) * 100);
  };
  const owed = () => moneyFromText("Customer pays: ") - moneyFromText("Total: ");
  const submitButtonEnabled = () => {
    const label = root().find<Konva.Text>("Text").find(t => t.text() === "Submit")!;
    return label.fill() === "black";
  };

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
    expect(root().find<Konva.Text>("Text").some(t => t.text().startsWith("Correct! +") && t.isVisible())).toBe(true);
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
    expect(hasVisibleText(root(), "Time's up! Final score: 0")).toBe(true);
    expect(hasVisibleText(root(), "Play Again")).toBe(true);
    expect(hasVisibleText(root(), "Submit")).toBe(false);
  });

  it("returns to the home screen", () => {
    clickButton(root(), "Back");
    expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
  });
});
