import { checkAnswer } from "../questions/answerChecker.ts";
 
describe("checkAnswer", () => {
	test.each([
		["17", 17],
		[" 17 ", 17], // surrounding spaces are ignored
		["017", 17], // leading zeros are fine
		["0", 0], // 0 is a real answer (e.g. 5 - 5)
	])('"%s" is correct for %i', (input, answer) => {
		expect(checkAnswer(input, answer)).toBe("correct");
	});
 
	test.each([
		["16", 17],
		["18", 17],
		["0", 17],
	])('"%s" is incorrect for %i', (input, answer) => {
		expect(checkAnswer(input, answer)).toBe("incorrect");
	});
 
	test.each([
		[""], // empty must not count as 0
		["   "],
		["abc"],
		["12abc"],
		["3.5"], // no decimals
		["17.0"],
		["-5"], // no negatives
		["1e1"], // scientific notation (Number("1e1") === 10)
		["0x11"], // hexadecimal (Number("0x11") === 17)
	])('"%s" is invalid', (input) => {
		expect(checkAnswer(input, 17)).toBe("invalid");
	});
 
	it("does not treat empty input as a correct answer of 0", () => {
		expect(checkAnswer("", 0)).toBe("invalid");
	});
});
 