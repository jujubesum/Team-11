import "jest-canvas-mock";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { TitleScreenController } from "../screens/TitleScreen/TitleScreenController.ts";

// Tests correct display for title screen and screen switching
describe("TitleScreenController", () => {
	let screenSwitcher: ScreenSwitcher;
	let controller: TitleScreenController;
 
	beforeEach(() => {
		screenSwitcher = { switchToScreen: jest.fn() };
		controller = new TitleScreenController(screenSwitcher);
		controller.show();
	});
 
	function root() {
		return controller.getView().getGroup();
	}
 
	describe("new game layout (no save)", () => {
		it("shows New Game and How to Play but no Continue button", () => {
			expect(hasVisibleText(root(), "New Game")).toBe(true);
			expect(hasVisibleText(root(), "How to Play")).toBe(true);
			expect(hasVisibleText(root(), "Continue")).toBe(false);
		});
 
		it("goes to the home screen when New Game is clicked", () => {
			clickButton(root(), "New Game");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
		});
 
		it("does not navigate when How to Play is clicked (not built yet)", () => {
			clickButton(root(), "How to Play");
 
			expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
		});
	});
 
	describe("continue layout (a saved level is passed in)", () => {
		beforeEach(() => {
			controller.getView().setSaveInfo(3);
		});
 
		it("shows Continue with the level, alongside New Game and How to Play", () => {
			expect(hasVisibleText(root(), "Continue")).toBe(true);
			expect(hasVisibleText(root(), "Level 3")).toBe(true);
			expect(hasVisibleText(root(), "New Game")).toBe(true);
			expect(hasVisibleText(root(), "How to Play")).toBe(true);
		});
 
		it("displays whatever level it is given", () => {
			controller.getView().setSaveInfo(7);
 
			expect(hasVisibleText(root(), "Level 7")).toBe(true);
			expect(hasVisibleText(root(), "Level 3")).toBe(false);
		});
 
		it("still shows Continue for level 0 (0 is a valid level, not 'no save')", () => {
			controller.getView().setSaveInfo(0);
 
			expect(hasVisibleText(root(), "Continue")).toBe(true);
			expect(hasVisibleText(root(), "Level 0")).toBe(true);
		});
 
		it("goes to the home screen when Continue is clicked", () => {
			clickButton(root(), "Continue");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
		});
 
		it("goes to the home screen when New Game is clicked", () => {
			clickButton(root(), "New Game");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
		});
 
		it("goes back to the new game layout when the level is cleared (null)", () => {
			controller.getView().setSaveInfo(null);
 
			expect(hasVisibleText(root(), "Continue")).toBe(false);
			expect(hasVisibleText(root(), "New Game")).toBe(true);
		});
	});
 
	describe("showing the screen", () => {
		it("makes the title screen visible", () => {
			expect(root().visible()).toBe(true);
		});
 
		// TODO (save system): once show() reads the real save, replace this with
		// tests that a save shows Continue and that no save shows New Game only.
		it("currently resets to the new game layout every time it is shown", () => {
			controller.getView().setSaveInfo(3);
 
			controller.show();
 
			expect(hasVisibleText(root(), "Continue")).toBe(false);
		});
	});
});
 