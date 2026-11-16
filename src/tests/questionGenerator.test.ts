import { generateQuestion } from "../questions/questionGenerator.ts";
import type { Operation, Question, QuestionConfig } from "../questions/questionTypes.ts";
 
const LIMITS: Record<Operation, number> = { "+": 50, "-": 50, "×": 10, "÷": 10 };
const MAX_NUMBER = 100;
const RUNS = 1000;
 
function configFor(...ops: Operation[]): QuestionConfig {
	return { allowedOperations: ops, operandLimits: LIMITS, maxNumber: MAX_NUMBER };
}
 
// work out answer independently, to dcheck generator
function solve(q: Question): number {
	switch (q.operation) {
		case "+":
			return q.left + q.right;
		case "-":
			return q.left - q.right;
		case "×":
			return q.left * q.right;
		case "÷":
			return q.left / q.right;
	}
}
 
afterEach(() => {
	jest.restoreAllMocks();
});
 
describe("generateQuestion", () => {
	describe.each<Operation>(["+", "-", "×", "÷"])("with only %s allowed", (op) => {
		const questions = Array.from({ length: RUNS }, () => generateQuestion(configFor(op)));
 
		it("always uses that operation", () => {
			for (const q of questions) expect(q.operation).toBe(op);
		});
 
		it("stores the right answer", () => {
			for (const q of questions) expect(q.answer).toBe(solve(q));
		});
 
		it("only uses whole numbers", () => {
			for (const q of questions) {
				expect(Number.isInteger(q.left)).toBe(true);
				expect(Number.isInteger(q.right)).toBe(true);
				expect(Number.isInteger(q.answer)).toBe(true);
			}
		});
 
		it("never has negative numbers", () => {
			for (const q of questions) {
				expect(q.left).toBeGreaterThanOrEqual(0);
				expect(q.right).toBeGreaterThanOrEqual(0);
				expect(q.answer).toBeGreaterThanOrEqual(0);
			}
		});
 
		it("keeps everything within maxNumber", () => {
			for (const q of questions) {
				expect(q.left).toBeLessThanOrEqual(MAX_NUMBER);
				expect(q.right).toBeLessThanOrEqual(MAX_NUMBER);
				expect(q.answer).toBeLessThanOrEqual(MAX_NUMBER);
			}
		});
 
		it("keeps the right side within the operation's limit", () => {
			for (const q of questions) {
				expect(q.right).toBeGreaterThanOrEqual(1);
				expect(q.right).toBeLessThanOrEqual(LIMITS[op]);
			}
		});
 
		it("builds the prompt from the numbers", () => {
			for (const q of questions) expect(q.prompt).toBe(`${q.left} ${op} ${q.right} = ?`);
		});
	});
 
	it("never divides by zero and always divides evenly", () => {
		for (let i = 0; i < RUNS; i++) {
			const q = generateQuestion(configFor("÷"));
			expect(q.right).not.toBe(0);
			expect(q.left % q.right).toBe(0);
		}
	});
 
	it("only picks operations from the allowed list", () => {
		for (let i = 0; i < RUNS; i++) {
			expect(["+", "-"]).toContain(generateQuestion(configFor("+", "-")).operation);
		}
	});
 
	it("picks every allowed operation eventually", () => {
		const seen = new Set<Operation>();
		for (let i = 0; i < RUNS; i++) seen.add(generateQuestion(configFor("+", "-", "×", "÷")).operation);
		expect(seen.size).toBe(4);
	});
 
	it("throws if no operations are allowed", () => {
		expect(() => generateQuestion(configFor())).toThrow();
	});
 
	it("gives a predictable question when Math.random is mocked", () => {
		// 0 always picks the smallest option: left = 1, right = 1
		jest.spyOn(Math, "random").mockReturnValue(0);
		expect(generateQuestion(configFor("+"))).toEqual({
			left: 1,
			right: 1,
			operation: "+",
			answer: 2,
			prompt: "1 + 1 = ?",
		});
	});
 
	it("generates questions quickly", () => {
		const start = performance.now();
		for (let i = 0; i < 10_000; i++) generateQuestion(configFor("+", "-", "×", "÷"));
		expect(performance.now() - start).toBeLessThan(1000);
	});
});