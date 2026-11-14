import "jest-canvas-mock";
import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { MathTutorialController } from "../screens/MathTutorialScreen/MathTutorialController.ts";
import { MATH_OPERATIONS, getMathTutorial } from "../mathTutorials.ts";

// Tests the Math Tutorials screen through its rendered Konva buttons
describe("MathTutorialController", () => {
	let screenSwitcher: ScreenSwitcher;
	let controller: MathTutorialController;
	let root: Konva.Group;

	beforeEach(() => {
		screenSwitcher = { switchToScreen: jest.fn() };
		controller = new MathTutorialController(screenSwitcher);
		controller.show();
		root = controller.getView().getGroup();
	});

	it("is hidden until shown", () => {
		const fresh = new MathTutorialController(screenSwitcher);
		expect(fresh.getView().getGroup().visible()).toBe(false);

		fresh.show();
		expect(fresh.getView().getGroup().visible()).toBe(true);

		fresh.hide();
		expect(fresh.getView().getGroup().visible()).toBe(false);
	});

	it("shows the header and starts on the first addition step", () => {
		const addition = getMathTutorial("addition");

		expect(hasVisibleText(root, "Math Tutorials")).toBe(true);
		expect(hasVisibleText(root, "Operation: Addition")).toBe(true);
		expect(hasVisibleText(root, `Step 1 of ${addition.steps.length}`)).toBe(true);
		expect(hasVisibleText(root, addition.steps[0]!)).toBe(true);
	});

	it("offers a button for every supported math operation", () => {
		for (const operation of MATH_OPERATIONS) {
			expect(hasVisibleText(root, getMathTutorial(operation).title)).toBe(true);
		}
	});

	it("moves forward with Next and back with Previous", () => {
		const addition = getMathTutorial("addition");

		clickButton(root, "Next");
		expect(hasVisibleText(root, `Step 2 of ${addition.steps.length}`)).toBe(true);
		expect(hasVisibleText(root, addition.steps[1]!)).toBe(true);

		clickButton(root, "Previous");
		expect(hasVisibleText(root, `Step 1 of ${addition.steps.length}`)).toBe(true);
		expect(hasVisibleText(root, addition.steps[0]!)).toBe(true);
	});

	it("does not move past the first or last step", () => {
		const addition = getMathTutorial("addition");
		const total = addition.steps.length;

		clickButton(root, "Previous");
		expect(hasVisibleText(root, `Step 1 of ${total}`)).toBe(true);

		for (let i = 0; i < total + 2; i++) {
			clickButton(root, "Next");
		}
		expect(hasVisibleText(root, `Step ${total} of ${total}`)).toBe(true);
		expect(hasVisibleText(root, addition.steps[total - 1]!)).toBe(true);
	});

	it("switches operations and restarts at step 1", () => {
		const division = getMathTutorial("division");

		clickButton(root, "Next");
		clickButton(root, "Division");

		expect(hasVisibleText(root, "Operation: Division")).toBe(true);
		expect(hasVisibleText(root, `Step 1 of ${division.steps.length}`)).toBe(true);
		expect(hasVisibleText(root, division.steps[0]!)).toBe(true);
	});

	it("returns to the home screen when Back is clicked", () => {
		clickButton(root, "Back");

		expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
	});
});
