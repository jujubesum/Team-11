import type { Operation, Question, QuestionConfig } from "./questionTypes.ts";

/* Generates questions
 * Ensures no negative numbers, has whole numbers, and division is all actually divisible.
 */

export function generateQuestion(config: QuestionConfig): Question {
	const op: Operation = pickOperation(config);
	let left: number;
	if (op === "÷"){
		const divisor = randomInt(1, config.operandLimits["÷"]);
		const quotient = randomInt(1, Math.floor(config.maxNumber / divisor));
		left = divisor * quotient;
	}else{
		left = randomInt(1, config.operandLimits[op]);
	}

	const right: number = pickNextNumber(left, op, config);
	const answer: number = applyOperation(left, op, right);
	return {
		left,
		right,
		operation: op,
		answer,
		prompt: buildPrompt(left, right, op),
	};
}

//calculate the answer
function applyOperation(left: number, operation: Operation, right: number): number {
	// one case per operation
	switch (operation){
		case "+":
		 return left + right;
		case "-":
			return left - right;
		case "×":
			return left * right;
		case "÷":
			return left / right;
	}
}

/* choose number on the right side that keeps the question valid
 * i.e. numbers must divide evenly
 */
function pickNextNumber(left: number, operation: Operation, config: QuestionConfig): number {
	const limit = config.operandLimits[operation];
	switch (operation){
		case "+" :
			return randomInt(1, Math.min(limit, config.maxNumber - left));
		case "-" :
			return randomInt(1, Math.min(limit, left));
		case "×" :
			return randomInt(1, Math.min(limit, Math.floor(config.maxNumber / left)));
		case "÷" :
			const divisors: number[] = [];
			for (let d = 1; d <= limit; d++) {
				if (left % d === 0) {
					divisors.push(d);
				}
			}
			return divisors[randomInt(0, divisors.length - 1)]!;
	}
}

//pick which operation
function pickOperation(config: QuestionConfig): Operation {
	const ops = config.allowedOperations;
	if(ops.length === 0){
		throw new Error("QuestionConfig.allowedOperations must not be empty");
	}
	return ops[randomInt(0, ops.length - 1)]!;
}

//builds problem into string to be displayed
function buildPrompt(left: number, right: number, operation: Operation): string {
	return `${left} ${operation} ${right} = ?`;
}

//random whole number min to max inclusive
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}