import { ScreenController, type ScreenSwitcher } from "../types.ts";
import { CashierGameManager } from "./cashierGameManager.ts";
import { CashierGameView } from "./CashierGameView.ts";

export class CashierGameController extends ScreenController {
  private readonly manager = new CashierGameManager();
  private readonly view: CashierGameView;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly screenSwitcher: ScreenSwitcher) {
    super();
    this.view = new CashierGameView({
      onStart: () => this.start(),
      onSubmit: answer => this.submit(answer),
      onBack: () => this.screenSwitcher.switchToScreen({ type: "home" })
    });
    this.view.render(this.manager.getSnapshot());
  }

  private start(): void {
    this.stopTimer();
    this.manager.start();
    this.view.render(this.manager.getSnapshot());
    this.startTimer();
  }

  private startTimer(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => {
      this.manager.tick();
      const snapshot = this.manager.getSnapshot();
      this.view.render(snapshot);
      if (!snapshot.active) this.stopTimer();
    }, 1000);
  }

  private submit(answer: string): void {
    const result = this.manager.submitAnswer(answer);
    this.view.render(this.manager.getSnapshot(), result.message);
  }

  private stopTimer(): void {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
  }

  override hide(): void { this.stopTimer(); super.hide(); }
  override show(): void {
    super.show();
    // Return to a paused game, or start a new round with Start.
    this.view.render(this.manager.getSnapshot());
    if (this.manager.getSnapshot().active) this.startTimer();
  }
  getView(): CashierGameView { return this.view; }
  destroy(): void { this.stopTimer(); }
}
