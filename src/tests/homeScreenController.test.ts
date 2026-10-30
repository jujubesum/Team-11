import "jest-canvas-mock";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { HomeScreenController } from "../screens/HomeScreen/HomeScreenController.ts";
 
// Tests screen switching and that the homescreen has the correct display
const HOME_BUTTON_LABELS = [
	"Start Baking!",
	"Minigame: Change Counting",
	"Math Tutorials",
	"Minigame: Order Dividing",
	"Recipe Book",
	"Shop",
	"Save & Exit",
];
 
const NOT_YET_WIRED_LABELS = HOME_BUTTON_LABELS.filter((label) => label !== "Save & Exit");
 
describe("HomeScreenController", () => {
	let screenSwitcher: ScreenSwitcher;
	let controller: HomeScreenController;
 
	beforeEach(() => {
		screenSwitcher = { switchToScreen: jest.fn() };
		controller = new HomeScreenController(screenSwitcher);
		controller.show();
	});
 
	it("displays every home screen button", () => {
		const root = controller.getView().getGroup();
 
		for (const label of HOME_BUTTON_LABELS) {
			expect(hasVisibleText(root, label), ).toBe(true);
		}
	});
 
	it("returns to the title screen when Save & Exit is clicked", () => {
		clickButton(controller.getView().getGroup(), "Save & Exit");
 
		expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(1);
		expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "title" });
	});
 
	it.each(NOT_YET_WIRED_LABELS)("does not navigate when '%s' is clicked (not built yet)", (label) => {
		clickButton(controller.getView().getGroup(), label);
 
		expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
	});
 
	it("is hidden until shown and hidden again by hide()", () => {
		const freshController = new HomeScreenController(screenSwitcher);
		const group = freshController.getView().getGroup();
		expect(group.visible()).toBe(false);
 
		freshController.getView().show();
		expect(group.visible()).toBe(true);
 
		freshController.getView().hide();
		expect(group.visible()).toBe(false);
	});
});
 