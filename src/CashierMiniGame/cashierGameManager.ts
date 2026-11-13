export type Difficulty = 1 | 2 | 3 | 4;
export interface CustomerQuestion {
  item: string;
  subtotalCents: number;
  discountPercent: number;
  totalCents: number;
  paidCents: number;
  changeCents: number;
  difficulty: Difficulty;
}
export interface CashierSnapshot {
  score: number;
  streak: number;
  correctAnswers: number;
  timeLeftSeconds: number;
  active: boolean;
  question: CustomerQuestion | null;
}
const ITEMS = ["Cupcake", "Cookie", "Croissant", "Muffin", "Slice of cake", "Donut"];
export const formatMoney = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
export function parseMoney(value: string): number | null {
  const cleaned = value.trim().replace(/^\$/, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned) * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}
export function calculateTotal(subtotalCents: number, discountPercent: number): number {
  return Math.round(subtotalCents * (100 - discountPercent) / 100);
}
export function generateQuestion(difficulty: Difficulty, random: () => number = Math.random): CustomerQuestion {
  const pick = (max: number) => Math.floor(random() * max);
  const item = ITEMS[pick(ITEMS.length)]!;
  let subtotalCents: number;
  let discountPercent = 0;
  if (difficulty === 1) subtotalCents = (2 + pick(8)) * 100;
  else if (difficulty === 2) subtotalCents = 200 + pick(36) * 25;
  else if (difficulty === 3) subtotalCents = 250 + pick(80) * 5;
  else {
    subtotalCents = (5 + pick(16)) * 100;
    discountPercent = [10, 20, 25, 50][pick(4)]!;
  }
  const totalCents = calculateTotal(subtotalCents, discountPercent);
  const bills = [500, 1000, 2000, 5000];
  const paidCents = bills.find(bill => bill > totalCents) ?? Math.ceil((totalCents + 1) / 1000) * 1000;
  return { item, subtotalCents, discountPercent, totalCents, paidCents, changeCents: paidCents - totalCents, difficulty };
}
export class CashierGameManager {
  private score = 0;
  private streak = 0;
  private correctAnswers = 0;
  private timeLeftSeconds = 120;
  private active = false;
  private question: CustomerQuestion | null = null;
  private questionStartedAt = 0;
  constructor(private readonly now: () => number = Date.now, private readonly random: () => number = Math.random) {}
  start(): void {
    this.score = 0;
    this.streak = 0;
    this.correctAnswers = 0;
    this.timeLeftSeconds = 120;
    this.active = true;
    this.nextQuestion();
  }
  private getDifficulty(): Difficulty {
    if (this.correctAnswers >= 12) return 4;
    if (this.correctAnswers >= 7) return 3;
    if (this.correctAnswers >= 3) return 2;
    return 1;
  }
  private nextQuestion(): void {
    this.question = generateQuestion(this.getDifficulty(), this.random);
    this.questionStartedAt = this.now();
  }
  tick(seconds = 1): void {
    if (!this.active) return;
    this.timeLeftSeconds = Math.max(0, this.timeLeftSeconds - seconds);
    if (this.timeLeftSeconds === 0) {
      this.active = false;
      this.question = null;
    }
  }
  submitAnswer(input: string): { correct: boolean; points: number; message: string } {
    if (!this.active || !this.question) return { correct: false, points: 0, message: "Game is not active." };
    const cents = parseMoney(input);
    if (cents === null) return { correct: false, points: 0, message: "Enter a dollar amount, such as 1.50." };
    if (cents !== this.question.changeCents) {
      this.streak = 0;
      return { correct: false, points: 0, message: "Not quite! Try again." };
    }
    this.streak++;
    this.correctAnswers++;
    const elapsedSeconds = Math.max(0, (this.now() - this.questionStartedAt) / 1000);
    const speedBonus = Math.max(0, 20 - Math.floor(elapsedSeconds));
    const multiplier = Math.min(5, 1 + Math.floor((this.streak - 1) / 3));
    const points = (100 + speedBonus * 5) * multiplier;
    this.score += points;
    this.nextQuestion();
    return { correct: true, points, message: `Correct! +${points} points` };
  }
  getSnapshot(): CashierSnapshot {
    return { score: this.score, streak: this.streak, correctAnswers: this.correctAnswers,
      timeLeftSeconds: this.timeLeftSeconds, active: this.active, question: this.question };
  }
}
