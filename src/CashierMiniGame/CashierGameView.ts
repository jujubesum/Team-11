import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";
import { Button } from "../components/Button.ts";
import type { View } from "../types.ts";
import { type CashierSnapshot, formatMoney } from "./cashierGameManager.ts";

export interface Denomination {
  cents: number;
  label: string;
  shortLabel: string;
  image: string;
  kind: "bill" | "coin";
  // Enlarges photos with a lot of white space around the money
  imageZoom?: number;
}

export const DENOMINATIONS: readonly Denomination[] = [
  { cents: 500, label: "$5 bill", shortLabel: "$5", image: "/images/money/5dollar.png", kind: "bill" },
  { cents: 100, label: "$1 bill", shortLabel: "$1", image: "/images/money/dollar.png", kind: "bill" },
  { cents: 25, label: "Quarter (25¢)", shortLabel: "25¢", image: "/images/money/quarter.png", kind: "coin" },
  { cents: 10, label: "Dime (10¢)", shortLabel: "10¢", image: "/images/money/dime.png", kind: "coin" },
  { cents: 5, label: "Nickel (5¢)", shortLabel: "5¢", image: "/images/money/nickel.png", kind: "coin", imageZoom: 1.65 },
  { cents: 1, label: "Penny (1¢)", shortLabel: "1¢", image: "/images/money/penny.png", kind: "coin" },
];

export interface Feedback { correct: boolean; message: string; }

// Everything is laid out on a fixed design canvas, then scaled to fit the stage.
const DESIGN_WIDTH = 1000;
const DESIGN_HEIGHT = 700;
const SCALE = Math.min(STAGE_WIDTH / DESIGN_WIDTH, STAGE_HEIGHT / DESIGN_HEIGHT);
const HEADER_HEIGHT = 100;

const BILL_WIDTH = 210;
const BILL_HEIGHT = 90;
// Roughly proportional to real coin diameters
const COIN_SIZES: Record<number, number> = { 25: 92, 10: 72, 5: 84, 1: 76 };

const BG_FILL = "#fff9ed";
const HEADER_FILL = "#f6e3bf";
const CARD_STROKE = "#d8c3a0";
const TEXT_COLOR = "#222";
const MUTED_COLOR = "#6b5a40";
const GREEN = "#2e7d32";
const RED = "#c62828";

export class CashierGameView implements View {
  private readonly group = new Konva.Group({ visible: false });
  private readonly content = new Konva.Group({
    x: (STAGE_WIDTH - DESIGN_WIDTH * SCALE) / 2, scaleX: SCALE, scaleY: SCALE,
  });
  private readonly playGroup = new Konva.Group();
  private readonly idleGroup = new Konva.Group();

  private readonly timeText: Konva.Text;
  private readonly scoreText: Konva.Text;
  private readonly streakText: Konva.Text;
  private readonly correctText: Konva.Text;
  private readonly orderText: Konva.Text;
  private readonly subtotalText: Konva.Text;
  private readonly discountText: Konva.Text;
  private readonly difficultyText: Konva.Text;
  private readonly totalText: Konva.Text;
  private readonly paidText: Konva.Text;
  private readonly feedbackText: Konva.Text;
  private readonly selectedText: Konva.Text;
  private readonly idleTitle: Konva.Text;
  private readonly idleDetails: Konva.Text;
  private readonly startButton: Button;
  private readonly playAgainButton: Button;
  private readonly undoButton: Button;
  private readonly clearButton: Button;
  private readonly submitButton: Button;
  private readonly badges = new Map<number, { group: Konva.Group; text: Konva.Text }>();

  private selected: number[] = [];
  private submitted = false;
  private playing = false;
  private questionId = "";
  private readonly onStart: () => void;
  private readonly onSubmit: (changeCents: number) => void;
  private readonly onBack: () => void;

  constructor(handlers: { onStart: () => void; onSubmit: (changeCents: number) => void; onBack: () => void }) {
    this.onStart = handlers.onStart;
    this.onSubmit = handlers.onSubmit;
    this.onBack = handlers.onBack;

    this.group.add(
      
      new Konva.Rect({ width: STAGE_WIDTH, height: HEADER_HEIGHT * SCALE, fill: HEADER_FILL }),
      this.content,
    );

    // Header
    this.text(this.content, { x: 30, y: 18, text: "Cashier Rush", fontSize: 34, fontStyle: "bold" });
    this.content.add(new Button({ x: 875, y: 18, width: 95, height: 46, label: "Back", fontSize: 20, onClick: this.onBack }).getGroup());
    this.timeText = this.text(this.content, { x: 30, y: 66, fontSize: 22, fontStyle: "bold" });
    this.scoreText = this.text(this.content, { x: 230, y: 66, fontSize: 22 });
    this.streakText = this.text(this.content, { x: 430, y: 66, fontSize: 22 });
    this.correctText = this.text(this.content, { x: 630, y: 66, fontSize: 22 });

    // Start / game-over card
    this.idleGroup.add(this.card(30, 130, 940, 260));
    this.idleTitle = this.text(this.idleGroup, { x: 30, y: 165, width: 940, align: "center", fontSize: 30, fontStyle: "bold" });
    this.idleDetails = this.text(this.idleGroup, { x: 80, y: 215, width: 840, align: "center", fontSize: 20, fill: MUTED_COLOR, lineHeight: 1.3 });
    this.startButton = new Button({ x: 410, y: 300, width: 180, height: 54, label: "Start", fontSize: 24, onClick: () => this.start() });
    this.playAgainButton = new Button({ x: 410, y: 300, width: 180, height: 54, label: "Play Again", fontSize: 24, onClick: () => this.start() });
    this.idleGroup.add(this.startButton.getGroup(), this.playAgainButton.getGroup());

    // Order card
    this.playGroup.add(this.card(30, 120, 940, 165));
    this.orderText = this.text(this.playGroup, { x: 55, y: 138, fontSize: 24, fontStyle: "bold" });
    this.subtotalText = this.text(this.playGroup, { x: 55, y: 178, fontSize: 20 });
    this.discountText = this.text(this.playGroup, { x: 55, y: 208, fontSize: 20 });
    this.difficultyText = this.text(this.playGroup, { x: 55, y: 245, fontSize: 16, fill: MUTED_COLOR });
    this.totalText = this.text(this.playGroup, { x: 520, y: 140, fontSize: 30, fontStyle: "bold" });
    this.paidText = this.text(this.playGroup, { x: 520, y: 185, fontSize: 30, fontStyle: "bold" });
    this.text(this.playGroup, {
      x: 520, y: 245, width: 430, fontSize: 17, fontStyle: "italic", fill: MUTED_COLOR,
      text: "Click the money below to give the correct change.",
    });
    this.feedbackText = this.text(this.playGroup, { x: 30, y: 297, width: 940, align: "center", fontSize: 22, fontStyle: "bold" });

    // Money tray
    this.playGroup.add(this.card(30, 335, 940, 345, "#fdf3df"));
    const bills = DENOMINATIONS.filter(d => d.kind === "bill");
    const coins = DENOMINATIONS.filter(d => d.kind === "coin");
    bills.forEach((d, i) => this.buildMoney(d, 365 + i * 270, 395));
    coins.forEach((d, i) => this.buildMoney(d, 275 + i * 150, 525));

    this.selectedText = this.text(this.playGroup, { x: 55, y: 627, fontSize: 26, fontStyle: "bold" });
    this.undoButton = new Button({ x: 560, y: 615, width: 120, height: 50, label: "Undo", fontSize: 22, onClick: () => this.undo() });
    this.clearButton = new Button({ x: 695, y: 615, width: 120, height: 50, label: "Clear", fontSize: 22, onClick: () => this.clear() });
    this.submitButton = new Button({
      x: 830, y: 615, width: 120, height: 50, label: "Submit", fontSize: 22,
      fill: "#c8efc8", hoverFill: "#a6e3a6", onClick: () => this.submit(),
    });
    this.playGroup.add(this.undoButton.getGroup(), this.clearButton.getGroup(), this.submitButton.getGroup());

    this.content.add(this.idleGroup, this.playGroup);
  }

  private text(parent: Konva.Group, config: Konva.TextConfig): Konva.Text {
    const node = new Konva.Text({ fontFamily: "Arial", fill: TEXT_COLOR, listening: false, ...config });
    parent.add(node);
    return node;
  }

  private card(x: number, y: number, width: number, height: number, fill = "white"): Konva.Rect {
    return new Konva.Rect({ x, y, width, height, fill, stroke: CARD_STROKE, strokeWidth: 2, cornerRadius: 14, listening: false });
  }

  private buildMoney(d: Denomination, cx: number, cy: number): void {
    const isBill = d.kind === "bill";
    const w = isBill ? BILL_WIDTH : COIN_SIZES[d.cents] ?? 80;
    const h = isBill ? BILL_HEIGHT : w;
    const item = new Konva.Group({ x: cx, y: cy, name: `money-${d.cents}` });
    const visual = new Konva.Group();

    const shape = (config: Konva.ShapeConfig): Konva.Shape => isBill
      ? new Konva.Rect({ x: -w / 2, y: -h / 2, width: w, height: h, cornerRadius: 6, ...config })
      : new Konva.Circle({ radius: w / 2, ...config });

    // Clipped area holds the fallback art and the photo
    const face = new Konva.Group({
      clipFunc: ctx => {
        if (isBill) ctx.rect(-w / 2, -h / 2, w, h);
        else ctx.arc(0, 0, w / 2, 0, Math.PI * 2, false);
      },
    });
    const fallback = new Konva.Group({ listening: false });
    fallback.add(
      shape({ fill: isBill ? "#cfe3c3" : d.cents === 1 ? "#d39064" : "#d4d4d4" }),
      new Konva.Text({
        x: -w / 2, y: -h / 2, width: w, height: h, text: d.shortLabel, align: "center", verticalAlign: "middle",
        fontSize: isBill ? 40 : 24, fontStyle: "bold", fontFamily: "Arial", fill: TEXT_COLOR,
      }),
    );
    const image = new Konva.Image({ image: undefined, visible: false, listening: false });
    face.add(fallback, image);

    visual.add(
      shape({ fill: "white", shadowColor: "black", shadowBlur: 6, shadowOpacity: 0.25, shadowOffset: { x: 2, y: 3 } }),
      face,
      shape({ stroke: isBill ? "#4f7a43" : "#8a7a60", strokeWidth: 2 }),
    );
    this.loadImage(d, image, fallback, w, h);

    const rowHeight = isBill ? BILL_HEIGHT : Math.max(...Object.values(COIN_SIZES));
    this.text(item, { x: -85, y: rowHeight / 2 + 8, width: 170, align: "center", text: d.label, fontSize: 18 });

    const badge = new Konva.Group({ x: w / 2 - 4, y: -h / 2 + 4, visible: false, listening: false });
    badge.add(new Konva.Circle({ radius: 15, fill: RED, stroke: "white", strokeWidth: 2 }));
    const badgeText = new Konva.Text({
      x: -15, y: -15, width: 30, height: 30, align: "center", verticalAlign: "middle",
      fontSize: 15, fontStyle: "bold", fontFamily: "Arial", fill: "white",
    });
    badge.add(badgeText);
    this.badges.set(d.cents, { group: badge, text: badgeText });

    item.add(visual, badge);
    this.playGroup.add(item);

    let hovered = false;
    const scaleTo = (scale: number, onFinish?: () => void) => {
      if (!visual.getLayer()) { visual.scale({ x: scale, y: scale }); onFinish?.(); return; }
      visual.to({ scaleX: scale, scaleY: scale, duration: 0.08, ...(onFinish ? { onFinish } : {}) });
    };
    item.on("mouseenter", () => { hovered = true; this.setCursor("pointer"); scaleTo(1.08); });
    item.on("mouseleave", () => { hovered = false; this.setCursor("default"); scaleTo(1); });
    item.on("click tap", () => {
      if (!this.addMoney(d.cents)) return;
      scaleTo(0.92, () => scaleTo(hovered ? 1.08 : 1));
    });
  }

  private loadImage(d: Denomination, node: Konva.Image, fallback: Konva.Group, w: number, h: number): void {
    const img = new Image();
    img.onload = () => {
      // Fit inside the slot without stretching
      const fit = Math.min(w / img.naturalWidth, h / img.naturalHeight) * (d.imageZoom ?? 1);
      const width = img.naturalWidth * fit;
      const height = img.naturalHeight * fit;
      node.setAttrs({ image: img, x: -width / 2, y: -height / 2, width, height, visible: true });
      fallback.visible(false);
      this.group.getLayer()?.batchDraw();
    };
    img.onerror = () => {
      console.warn(`Could not load ${d.image}; showing a plain ${d.label} instead.`);
      node.visible(false);
      fallback.visible(true);
      this.group.getLayer()?.batchDraw();
    };
    img.src = d.image;
    node.image(img);
  }

  private setCursor(cursor: string): void {
    const container = this.group.getStage()?.container();
    if (container) container.style.cursor = cursor;
  }

  private start(): void {
    this.selected = [];
    this.submitted = false;
    this.feedbackText.text("");
    this.onStart();
  }

  private addMoney(cents: number): boolean {
    if (!this.playing) return false;
    this.selected.push(cents);
    this.selectionChanged();
    return true;
  }

  private undo(): void {
    this.selected.pop();
    this.selectionChanged();
  }

  private clear(): void {
    this.selected = [];
    this.selectionChanged();
  }

  private selectionChanged(): void {
    this.submitted = false;
    this.feedbackText.text("");
    this.updateSelection();
  }

  private submit(): void {
    if (!this.playing || this.submitted || this.selected.length === 0) return;
    this.submitted = true;
    this.updateSelection();
    this.onSubmit(this.selectedTotal());
  }

  private selectedTotal(): number {
    return this.selected.reduce((sum, cents) => sum + cents, 0);
  }

  private updateSelection(): void {
    this.selectedText.text(`Your change: ${formatMoney(this.selectedTotal())}`);
    for (const [cents, badge] of this.badges) {
      const count = this.selected.filter(c => c === cents).length;
      badge.group.visible(count > 0);
      badge.text.text(`×${count}`);
    }
    const hasSelection = this.selected.length > 0;
    this.undoButton.setEnabled(hasSelection);
    this.clearButton.setEnabled(hasSelection);
    this.submitButton.setEnabled(hasSelection && !this.submitted);
    this.group.getLayer()?.batchDraw();
  }

  render(snapshot: CashierSnapshot, feedback?: Feedback): void {
    const q = snapshot.question;
    const id = q ? `${q.item}:${q.subtotalCents}:${q.discountPercent}:${q.paidCents}:${snapshot.correctAnswers}` : "";
    if (id !== this.questionId) {
      this.questionId = id;
      this.selected = [];
      this.submitted = false;
    }
    if (feedback) {
      this.feedbackText.text(feedback.message);
      this.feedbackText.fill(feedback.correct ? GREEN : RED);
    }

    const seconds = snapshot.timeLeftSeconds;
    this.timeText.text(`Time: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
    this.timeText.fill(snapshot.active && seconds <= 10 ? RED : TEXT_COLOR);
    this.scoreText.text(`Score: ${snapshot.score}`);
    this.streakText.text(`Streak: ${snapshot.streak}`);
    this.correctText.text(`Correct: ${snapshot.correctAnswers}`);

    this.playing = snapshot.active && q !== null;
    this.playGroup.visible(this.playing);
    this.idleGroup.visible(!this.playing);

    if (!q || !this.playing) {
      const over = seconds === 0;
      this.idleTitle.text(over ? `Time's up! Final score: ${snapshot.score}` : "Serve customers for two minutes!");
      this.idleDetails.text(over
        ? `You served ${snapshot.correctAnswers} customer${snapshot.correctAnswers === 1 ? "" : "s"}.`
        : "Work out each customer's change, then click the bills and coins to hand it back.");
      this.startButton.getGroup().visible(!over);
      this.playAgainButton.getGroup().visible(over);
      this.feedbackText.text("");
      this.setCursor("default");
      this.group.getLayer()?.batchDraw();
      return;
    }

    this.orderText.text(`Customer orders: ${q.item}`);
    this.subtotalText.text(`Subtotal: ${formatMoney(q.subtotalCents)}`);
    this.discountText.text(q.discountPercent ? `Discount: ${q.discountPercent}%` : "Discount: none");
    this.difficultyText.text(`Difficulty: ${q.difficulty}/4`);
    this.totalText.text(`Total: ${formatMoney(q.totalCents)}`);
    this.paidText.text(`Customer pays: ${formatMoney(q.paidCents)}`);
    this.updateSelection();
  }

  getGroup(): Konva.Group { return this.group; }
  show(): void { this.group.show(); this.group.getLayer()?.batchDraw(); }
  hide(): void { this.setCursor("default"); this.group.hide(); this.group.getLayer()?.batchDraw(); }
}
