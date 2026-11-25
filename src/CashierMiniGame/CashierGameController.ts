import { ScreenController, type ScreenSwitcher } from "../types.ts";
import type { SaveManager } from "../saveManager.ts";
import { CashierGameManager, calculateReward } from "./cashierGameManager.ts";
import { CashierGameView, type Feedback, type RoundReward } from "./CashierGameView.ts";

export class CashierGameController extends ScreenController {
  private readonly view: CashierGameView;
  private timer: ReturnType<typeof setInterval> | null = null;
  private visible = false;
  private helpOpen = false;
  // Guards against paying out the same round twice
  private roundRewarded = false;
  private reward: RoundReward | null = null;

  constructor(
    private readonly screenSwitcher: ScreenSwitcher,
    private readonly saveManager: SaveManager,
    private readonly manager: CashierGameManager = new CashierGameManager(),
  ) {
    super();
    this.view = new CashierGameView({
      onStart: () => this.start(),
      onSubmit: changeCents => this.submit(changeCents),
      onHome: () => this.screenSwitcher.switchToScreen({ type: "home" }),
      onHelp: () => this.openHelp(),
      onHelpClosed: () => this.closeHelp(),
    });
    this.renderView();
  }

  private start(): void {
    this.stopTimer();
    this.manager.start();
    this.roundRewarded = false;
    this.reward = null;
    this.renderView();
    this.resumeRound();
  }

  private startTimer(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => this.tick(), 1000);
  }

  private stopTimer(): void {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
  }

  private tick(): void {
    this.manager.tick();
    if (!this.manager.getSnapshot().active) {
      this.stopTimer();
      this.completeRound();
    }
    this.renderView();
  }

  private submit(changeCents: number): void {
    const result = this.manager.submitChange(changeCents);
    this.renderView(result);
  }

  // Pays out the round's score once, when the clock runs out or the player leaves early
  private completeRound(): void {
    if (this.roundRewarded) return;
    this.roundRewarded = true;
    const amount = calculateReward(this.manager.getSnapshot().score);
    const save = this.saveManager.getCurrent();
    if (!save) {
      console.warn("No active save; Cashier Rush reward was not stored.");
      this.reward = { amount, saved: false };
      return;
    }
    if (amount > 0) {
      this.saveManager.update({ money: save.money + amount });
      this.saveManager.save();
    }
    this.reward = { amount, saved: true };
  }

  private pauseRound(): void {
    this.stopTimer();
    this.manager.pause();
  }

  private resumeRound(): void {
    if (!this.visible || this.helpOpen || !this.manager.getSnapshot().active) return;
    this.manager.resume();
    this.startTimer();
  }

  private openHelp(): void {
    this.helpOpen = true;
    this.pauseRound();
    this.view.showHelp();
  }

  private closeHelp(): void {
    this.helpOpen = false;
    this.resumeRound();
  }

  private renderView(feedback?: Feedback): void {
    this.view.render(this.manager.getSnapshot(), feedback, this.reward);
  }

  // Leaving keeps the points earned so far, then the next visit starts fresh
  override hide(): void {
    this.visible = false;
    this.helpOpen = false;
    this.stopTimer();
    if (this.manager.getSnapshot().active) this.completeRound();
    this.manager.reset();
    this.reward = null;
    this.renderView();
    super.hide();
  }

  override show(): void {
    this.visible = true;
    super.show();
    this.renderView();
  }

  getView(): CashierGameView { return this.view; }
  destroy(): void { this.stopTimer(); }
}
