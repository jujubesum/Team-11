import { getHint } from "../questions/hintProvider.ts";
 
describe("getHint", () => {
	it("gives the distance when the guess is too high", () => {
		expect(getHint(17, 20)).toBe("You are 3 away from the right answer!");
	});
 
	it("gives the distance when the guess is too low", () => {
		expect(getHint(17, 14)).toBe("You are 3 away from the right answer!");
	});
 
	it("never shows a negative distance", () => {
		expect(getHint(5, 50)).not.toContain("-");
	});
 
	it("does not say whether the guess is too high or too low", () => {
		//same distance in both directions gives the same hint, so the answer isn't given away
		expect(getHint(17, 20)).toBe(getHint(17, 14));
	});
});