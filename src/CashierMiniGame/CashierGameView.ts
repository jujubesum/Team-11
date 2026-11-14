import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";
import { Button } from "../components/Button.ts";
import type { View } from "../types.ts";
import { type CashierSnapshot, formatMoney } from "./cashierGameManager.ts";

/** Simple, all-Konva screen with an on-screen numeric keypad. */
export class CashierGameView implements View {
  private readonly group = new Konva.Group({ visible: false });
  private readonly content = new Konva.Group();
  private answer = "";
  private questionId = "";
  private readonly onStart: () => void;
  private readonly onSubmit: (answer: string) => void;
  private readonly onBack: () => void;

  constructor(handlers: { onStart: () => void; onSubmit: (answer: string) => void; onBack: () => void }) {
    this.onStart = handlers.onStart;
    this.onSubmit = handlers.onSubmit;
    this.onBack = handlers.onBack;
    this.group.add(this.content);
  }

  private line(text: string, y: number, fontSize = 23): void {
    this.content.add(new Konva.Text({ x: 30, y, width: Math.max(300, STAGE_WIDTH - 60), text,
      fontSize, fontFamily: "Arial", fill: "#222", listening: false }));
  }

  private button(label: string, x: number, y: number, onClick: () => void, width = 95): void {
    this.content.add(new Button({ x, y, width, height: 48, label, fontSize: 20, onClick }).getGroup());
  }

  render(snapshot: CashierSnapshot, feedback = ""): void {
    const q = snapshot.question;
    const id = q ? `${q.item}:${q.subtotalCents}:${q.discountPercent}:${q.paidCents}:${snapshot.correctAnswers}` : "";
    if (id !== this.questionId) { this.answer = ""; this.questionId = id; }
    this.content.destroyChildren();
    this.content.add(new Konva.Rect({ x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "#fff9ed" }));
    this.line("Cashier Rush", 24, 32);
    this.button("Back", Math.max(330, STAGE_WIDTH - 125), 18, this.onBack, 95);
    this.line(`Time: ${Math.floor(snapshot.timeLeftSeconds / 60)}:${String(snapshot.timeLeftSeconds % 60).padStart(2, "0")}`, 75);
    this.line(`Score: ${snapshot.score}     Streak: ${snapshot.streak}     Correct: ${snapshot.correctAnswers}`, 109, 19);

    if (!snapshot.active || !q) {
      this.line(snapshot.timeLeftSeconds === 0 ? `Time's up! Final score: ${snapshot.score}` : "Serve customers for two minutes!", 175);
      this.button(snapshot.timeLeftSeconds === 0 ? "Play Again" : "Start", 30, 230, this.onStart, 160);
      this.group.getLayer()?.batchDraw();
      return;
    }

    this.line(`Customer orders: ${q.item}`, 155);
    this.line(`Subtotal: ${formatMoney(q.subtotalCents)}`, 189);
    this.line(q.discountPercent ? `Discount: ${q.discountPercent}%` : "Discount: none", 223);
    this.line(`Total: ${formatMoney(q.totalCents)}`, 257);
    this.line(`Customer pays: ${formatMoney(q.paidCents)}`, 291);
    this.line(`Difficulty: ${q.difficulty}/4`, 325, 18);
    this.line(`Change ($): ${this.answer || "_"}`, 363, 24);
    this.line(feedback, 399, 18);

    const keys = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], [".", "0", "⌫"]];
    keys.forEach((row, rowIndex) => row.forEach((key, colIndex) => {
      this.button(key, 30 + colIndex * 105, 440 + rowIndex * 54, () => {
        if (key === "⌫") this.answer = this.answer.slice(0, -1);
        else if (key === ".") { if (!this.answer.includes(".")) this.answer += this.answer ? "." : "0."; }
        else if (this.answer.length < 10 && (this.answer.split(".")[1]?.length ?? 0) < 2) this.answer += key;
        this.render(snapshot, feedback);
      });
    }));
    this.button("Give Change", 30, 665, () => this.onSubmit(this.answer), 305);
    this.group.getLayer()?.batchDraw();
  }

  getGroup(): Konva.Group { return this.group; }
  show(): void { this.group.show(); this.group.getLayer()?.batchDraw(); }
  hide(): void { this.group.hide(); this.group.getLayer()?.batchDraw(); }
}
