import "jest-canvas-mock";
import type { ScreenSwitcher } from "../types.ts";
import { clickButton, hasVisibleText } from "./konvaHelpers.ts";
import { ShopScreenController } from "../screens/ShopScreen/ShopScreenController.ts";
import { SaveManager, STARTING_MONEY } from "../saveManager.ts";
import { SHOP_ITEMS, ITEMS_PER_PAGE } from "../ShopItems.ts";

// Tests the cart, purchasing, paging, and that purchases are saved
describe("ShopScreenController", () => {
	let screenSwitcher: ScreenSwitcher;
	let saveManager: SaveManager;
	let controller: ShopScreenController;

	const yellow = SHOP_ITEMS[0]!;
	const mint = SHOP_ITEMS[1]!;
	const firstOnPageTwo = SHOP_ITEMS[ITEMS_PER_PAGE]!;

	beforeEach(() => {
		localStorage.clear();
		screenSwitcher = { switchToScreen: jest.fn() };
		saveManager = new SaveManager();
		saveManager.startNewGame();
		controller = new ShopScreenController(screenSwitcher, saveManager);
		controller.show();
	});

	function root() {
		return controller.getView().getGroup();
	}

	function showsCartTotal(total: number): boolean {
		return hasVisibleText(root(), `Price (of items in cart): $${total}`);
	}

	function showsBalance(money: number): boolean {
		return hasVisibleText(root(), `Balance: $${money}`);
	}

	describe("opening the shop", () => {
		it("shows the player's balance and an empty cart", () => {
			expect(showsBalance(STARTING_MONEY)).toBe(true);
			expect(showsCartTotal(0)).toBe(true);
		});

		it("shows the first page of kitchens only", () => {
			expect(hasVisibleText(root(), yellow.name)).toBe(true);
			expect(hasVisibleText(root(), firstOnPageTwo.name)).toBe(false);
		});

		it("goes to the home screen when the home button is clicked", () => {
			clickButton(root(), "⌂");

			expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "home" });
		});
	});

	describe("adding to the cart", () => {
		it("adds a clicked kitchen and updates the price", () => {
			clickButton(root(), yellow.name);

			expect(showsCartTotal(yellow.price)).toBe(true);
		});

		it("only adds the same kitchen once", () => {
			clickButton(root(), yellow.name);
			clickButton(root(), yellow.name);

			expect(showsCartTotal(yellow.price)).toBe(true);
		});

		it("does not add a kitchen the player already owns", () => {
			saveManager.update({ customizations: [yellow.id] });
			controller.show();

			clickButton(root(), yellow.name);

			expect(hasVisibleText(root(), "Owned ✓")).toBe(true);
			expect(showsCartTotal(0)).toBe(true);
		});

		it("empties the cart when Empty Cart is clicked", () => {
			clickButton(root(), yellow.name);
			clickButton(root(), mint.name);

			clickButton(root(), "Empty Cart");

			expect(showsCartTotal(0)).toBe(true);
		});
	});

	describe("purchasing", () => {
		it("takes the money, marks the kitchen owned, and empties the cart", () => {
			clickButton(root(), yellow.name);

			clickButton(root(), "Purchase");

			expect(showsBalance(STARTING_MONEY - yellow.price)).toBe(true);
			expect(showsCartTotal(0)).toBe(true);
			expect(hasVisibleText(root(), "Owned ✓")).toBe(true);
		});

		it("keeps a purchased kitchen after reopening the game", () => {
			clickButton(root(), yellow.name);
			clickButton(root(), "Purchase");

			const reopened = new SaveManager().load();
			expect(reopened!.customizations).toContain(yellow.id);
			expect(reopened!.money).toBe(STARTING_MONEY - yellow.price);
		});

		it("does nothing when the player cannot afford the cart", () => {
			saveManager.update({ money: yellow.price - 1 });
			controller.show();
			clickButton(root(), yellow.name);

			clickButton(root(), "Purchase");

			expect(showsBalance(yellow.price - 1)).toBe(true);
			expect(showsCartTotal(yellow.price)).toBe(true);
			expect(saveManager.getCurrent()!.customizations).not.toContain(yellow.id);
		});

		it("does nothing when the cart is empty", () => {
			clickButton(root(), "Purchase");

			expect(showsBalance(STARTING_MONEY)).toBe(true);
			expect(saveManager.getCurrent()!.customizations).toEqual([]);
		});
	});

	describe("pages", () => {
		it("shows the next page of kitchens when > is clicked", () => {
			clickButton(root(), ">");

			expect(hasVisibleText(root(), firstOnPageTwo.name)).toBe(true);
			expect(hasVisibleText(root(), yellow.name)).toBe(false);
		});

		it("stays on the first page when < is clicked on page 1", () => {
			clickButton(root(), "<");

			expect(hasVisibleText(root(), yellow.name)).toBe(true);
		});

		it("stays on the last page when > is clicked again", () => {
			const pageCount = Math.ceil(SHOP_ITEMS.length / ITEMS_PER_PAGE);
			for (let i = 0; i < pageCount + 2; i++) {
				clickButton(root(), ">");
			}

			expect(hasVisibleText(root(), SHOP_ITEMS[SHOP_ITEMS.length - 1]!.name)).toBe(true);
		});

		it("keeps the cart when changing pages", () => {
			clickButton(root(), yellow.name);

			clickButton(root(), ">");

			expect(showsCartTotal(yellow.price)).toBe(true);
		});
	});

	describe("reopening the shop", () => {
		it("starts with an empty cart on page 1", () => {
			clickButton(root(), yellow.name);
			clickButton(root(), ">");

			controller.show();

			expect(showsCartTotal(0)).toBe(true);
			expect(hasVisibleText(root(), yellow.name)).toBe(true);
		});
	});
});