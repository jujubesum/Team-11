import { QuestionSession } from "../questions/questionSession.ts";
import type { Question } from "../questions/questionTypes.ts";
 
//fixed question, so tests don't depend on randomness
const QUESTION: Question = { left: 12, right: 5, operation: "+", answer: 17, prompt: "12 + 5 = ?" };
 
let session: QuestionSession;
 
beforeEach(() => {
	session = new QuestionSession(QUESTION);
});
 
describe("QuestionSession", () => {
	it("starts unfinished and shows the question's prompt", () => {
		expect(session.isFinished()).toBe(false);
		expect(session.getPrompt()).toBe("12 + 5 = ?");
	});
 
	it("finishes on a correct answer", () => {
		const result = session.submit("17");
		expect(result.status).toBe("correct");
		expect(result.finished).toBe(true);
		expect(result.attemptsRemaining).toBe(3);
		expect(session.isFinished()).toBe(true);
	});
 
	it("takes away an attempt on a wrong answer, leaving 2", () => {
		//tests one wrong answer, error message, 2 attempts left
		const result = session.submit("20");
		expect(result.status).toBe("incorrect");
		expect(result.message).toBe("That is incorrect. Please try again!");
		expect(result.attemptsRemaining).toBe(2);
		expect(result.finished).toBe(false);
	});
 
	it("gives a hint after the second wrong answer", () => {
		session.submit("20");
		const result = session.submit("14");
		expect(result.attemptsRemaining).toBe(1);
		expect(result.message).toBe("You are 3 away from the right answer!");
		expect(result.finished).toBe(false);
	});
 
	it("finishes after three wrong answers", () => {
		session.submit("1");
		session.submit("2");
		const result = session.submit("3");
		expect(result.attemptsRemaining).toBe(0);
		expect(result.finished).toBe(true);
		expect(result.message).toBe("You are out of attempts. Please try a new problem.");
	});
 
	it("does not take away an attempt for invalid input", () => {
		const result = session.submit("abc");
		expect(result.status).toBe("invalid");
		expect(result.attemptsRemaining).toBe(3);
		expect(result.finished).toBe(false);
	});
 
	it("still accepts the right answer after wrong ones", () => {
		session.submit("20");
		const result = session.submit("17");
		expect(result.status).toBe("correct");
		expect(result.finished).toBe(true);
	});
 
	it("throws if submitted to after finishing", () => {
		session.submit("17");
		expect(() => session.submit("17")).toThrow();
	});
 
	it("keeps each session's attempts separate", () => {
		const other = new QuestionSession(QUESTION);
		session.submit("20");
		expect(other.submit("20").attemptsRemaining).toBe(2);
	}); 
});