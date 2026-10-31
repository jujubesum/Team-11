import "jest-canvas-mock";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { TitleScreenController } from "../screens/TitleScreen/TitleScreenController.ts";
import { SaveManager } from "../saveManager";

// Tests correct display for title screen and screen switching
describe("TitleScreenController", () => {
	let screenSwitcher: ScreenSwitcher;
	let saveManager: SaveManager;
	let controller: TitleScreenController;
 
	beforeEach(() => {
		localStorage.clear();
		screenSwitcher = { switchToScreen: jest.fn() };
		saveManager = new SaveManager();
		controller = new TitleScreenController(screenSwitcher, saveManager);
		controller.show();
	});
 
	function root() {
		return controller.getView().getGroup();
	}

	// Puts a save in storage
	function createSave(level: number): void {
		const previous = new SaveManager();
		previous.startNewGame();
		previous.update({ level });
		previous.save();
	}
 
	describe("new game layout (no save)", () => {
		it("shows New Game and How to Play but no Continue button", () => {
			expect(hasVisibleText(root(), "New Game")).toBe(true);
			expect(hasVisibleText(root(), "How to Play")).toBe(true);
			expect(hasVisibleText(root(), "Continue")).toBe(false);
		});
 
		it("starts a new game and goes to the home screen when New Game is clicked", () => {
			clickButton(root(), "New Game");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
			expect(saveManager.hasSave()).toBe(true);
		});
 
		it("goes to the tutorials screen when How to Play is clicked", () => {
			clickButton(root(), "How to Play");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
      expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "gameTutorial"});
		});
	});
 
	describe("continue layout (a save exists)", () => {
		beforeEach(() => {
			createSave(3);
			controller.show();
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
 
		it("loads the save and goes to the home screen when Continue is clicked", () => {
			clickButton(root(), "Continue");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
			expect(saveManager.getCurrent()!.level).toBe(3);
		});
 
		it("asks for confirmation when New Game is clicked, without wiping the save", () => {
			clickButton(root(), "New Game");
 
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "newGameCheck" });
			expect(new SaveManager().load()!.level).toBe(3);
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
 
		it("shows Continue when it is re-opened after a save is created", () => {
			expect(hasVisibleText(root(), "Continue")).toBe(false);

			createSave(2);
			controller.show();
 
			expect(hasVisibleText(root(), "Continue")).toBe(true);
			expect(hasVisibleText(root(), "Level 2")).toBe(true);
		});

		it("shows the New Game layout when there is no save", () => {
			controller.getView().setSaveInfo(3);

			controller.show();

			expect(hasVisibleText(root(), "Continue")).toBe(false);
		});
	});
});
