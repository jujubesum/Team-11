import "jest-canvas-mock";
import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { CustomizeScreenController } from "../screens/CustomizeScreen/CustomizeScreenController.ts";
import { SaveManager } from "../saveManager.ts";
import { SHOP_ITEMS } from "../ShopItems.ts";

// Tests which kitchens show up, applying them, going back to default, and that the choice is saved
describe("CustomizeScreenController", () => {
	let screenSwitcher: ScreenSwitcher;
	let saveManager: SaveManager;
	let onBackgroundChange: jest.Mock;
	let controller: CustomizeScreenController;

	const yellow = SHOP_ITEMS[0]!;
	const mint = SHOP_ITEMS[1]!;
	const pink = SHOP_ITEMS[2]!;

	beforeEach(() => {
		localStorage.clear();
		screenSwitcher = { switchToScreen: jest.fn() };
		onBackgroundChange = jest.fn();
		saveManager = new SaveManager();
		saveManager.startNewGame();
		
        // Player owns yellow and pink, but not mint
		saveManager.update({ customizations: [yellow.id, pink.id] });
		controller = new CustomizeScreenController(screenSwitcher, saveManager, onBackgroundChange);
		controller.show();
	});

	function root() {
		return controller.getView().getGroup();
	}

	function getTile(name: string): Konva.Group {
		const nameText = root().findOne((n: Konva.Node) => n instanceof Konva.Text && n.text() === name);
		return nameText!.getParent() as Konva.Group;
	}

	function applyKitchen(name: string): void {
		clickButton(getTile(name), "Apply");
	}

	// Clicks the "Applied ✓" button in this kitchen's tile (it should do nothing)
	function clickApplied(name: string): void {
		clickButton(getTile(name), "Applied ✓");
	}

	describe("opening the page", () => {
		it("starts on the default background", () => {
			expect(hasVisibleText(root(), "Now using: Default")).toBe(true);
			expect(saveManager.getCurrent()!.activeKitchenId).toBeNull();
		});

		it("shows only the kitchens the player owns", () => {
			expect(hasVisibleText(root(), yellow.name)).toBe(true);
			expect(hasVisibleText(root(), pink.name)).toBe(true);
			expect(hasVisibleText(root(), mint.name)).toBe(false);
		});

		it("shows a message when the player owns no kitchens", () => {
			saveManager.update({ customizations: [] });
			controller.show();

			expect(hasVisibleText(root(), "Buy kitchens in the Shop to customize your bakery!")).toBe(true);
		});

		it("shows kitchens bought after the page was first opened", () => {
			saveManager.update({ customizations: [yellow.id, pink.id, mint.id] });
			controller.show();

			expect(hasVisibleText(root(), mint.name)).toBe(true);
		});

		it("goes to the home screen when the home button is clicked", () => {
			clickButton(root(), "⌂");

			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
		});
	});

	describe("applying a kitchen", () => {
		it("applies the kitchen and changes the background", () => {
			applyKitchen(pink.name);

			expect(saveManager.getCurrent()!.activeKitchenId).toBe(pink.id);
			expect(onBackgroundChange).toHaveBeenCalledTimes(1);
			expect(hasVisibleText(root(), `Now using: ${pink.name}`)).toBe(true);
			expect(hasVisibleText(root(), "Applied ✓")).toBe(true);
		});

		it("keeps the applied kitchen after reopening the game", () => {
			applyKitchen(pink.name);

			const reopened = new SaveManager().load();
			expect(reopened!.activeKitchenId).toBe(pink.id);
		});

		it("does nothing when the applied kitchen's button is clicked again", () => {
			applyKitchen(pink.name);

			clickApplied(pink.name);

			expect(onBackgroundChange).toHaveBeenCalledTimes(1);
			expect(saveManager.getCurrent()!.activeKitchenId).toBe(pink.id);
		});

		it("switches to another owned kitchen", () => {
			applyKitchen(pink.name);

			applyKitchen(yellow.name);

			expect(saveManager.getCurrent()!.activeKitchenId).toBe(yellow.id);
			expect(hasVisibleText(root(), `Now using: ${yellow.name}`)).toBe(true);
			expect(onBackgroundChange).toHaveBeenCalledTimes(2);
		});
	});

	describe("using the default", () => {
		it("goes back to the default background", () => {
			applyKitchen(pink.name);

			clickButton(root(), "Use Default");

			expect(saveManager.getCurrent()!.activeKitchenId).toBeNull();
			expect(hasVisibleText(root(), "Now using: Default")).toBe(true);
			expect(onBackgroundChange).toHaveBeenCalledTimes(2);
		});

		it("does nothing when the default is already in use", () => {
			clickButton(root(), "Use Default");

			expect(onBackgroundChange).not.toHaveBeenCalled();
			expect(saveManager.getCurrent()!.activeKitchenId).toBeNull();
		});
	});
});