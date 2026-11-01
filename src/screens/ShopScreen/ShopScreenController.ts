import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import type { SaveManager } from "../../saveManager.ts";
import { SHOP_ITEMS, ITEMS_PER_PAGE } from "../../ShopItems.ts";
import type { ShopItem } from "../../ShopItems.ts";
import { ShopScreenView } from "./ShopScreenView.ts";

// ShopScreenController - owns the cart and the current page, decides whether the player can buy, and spends their money
export class ShopScreenController extends ScreenController {
	private view: ShopScreenView;
	private screenSwitcher: ScreenSwitcher;
	private saveManager: SaveManager;

	// Items currently in the cart
	private cart: ShopItem[] = [];
	// Which page of shop you are currently on
	private page = 0;

	constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.saveManager = saveManager;
		this.view = new ShopScreenView({
			onHelp: () => this.handleHelp(),
			onItemClick: (item) => this.handleItemClick(item),
			onPurchase: () => this.handlePurchase(),
			onEmptyCart: () => this.handleEmptyCart(),
			onPrevPage: () => this.handlePrevPage(),
			onNextPage: () => this.handleNextPage(),
		}, this.screenSwitcher);
	}

	override show(): void {
		this.cart = [];
		this.page = 0;
		this.refresh();
		super.show();
	}

	// ---------- Button Handlers ----------

	private handleHelp(): void {
		// TODO: show how the shop works (skipped for now)
	}

	private handleItemClick(item: ShopItem): void {
		// Checks if the item is already in cart and if the item is not already owned
		const inCart = this.cart.some((c) => c.id === item.id);
		const owned = this.getOwnedIds().includes(item.id);
		if (!inCart && !owned) {
			this.cart.push(item);
		}
		this.refresh();
	}

	// Conducts the purchase or does not allow it if you do not have enough money
	private handlePurchase(): void {
		const save = this.saveManager.getCurrent();
		const total = this.getCartTotal();
		// Denies purchase if no save data, nothing is in cart, or money is less than cart total
		if (!save || total === 0 || save.money < total) return;

		this.saveManager.update({
			money: save.money - total,
			customizations: [...save.customizations, ...this.cart.map((i) => i.id)],
		});
		this.saveManager.save();

		// Clears cart to be empty after purchase
		this.handleEmptyCart();
	}

	// Clears the cart
	private handleEmptyCart(): void {
		this.cart = [];
		this.refresh();
	}

	// Goes to previous items page if possible
	private handlePrevPage(): void {
		if (this.page > 0) {
			this.page--;
			this.refresh();
		}
	}

	// Goes to next items page if possible
	private handleNextPage(): void {
		if (this.page < this.getPageCount() - 1) {
			this.page++;
			this.refresh();
		}
	}

	// ---------- Helpers ----------

	// Refreshes and push all details to the screen
	private refresh(): void {
		const save = this.saveManager.getCurrent();
		const money = save ? save.money : 0;
		const total = this.getCartTotal();

		this.view.setBalance(money);
		this.view.setCartTotal(total);
		this.view.setCart(this.cart);
		this.view.setPage(this.getPageItems(), this.getOwnedIds());
		this.view.setPageArrows(this.page > 0, this.page < this.getPageCount() - 1);
		this.view.setPurchaseEnabled(save !== null && total > 0 && money >= total);
	}

	// Total price of everything in the cart
	private getCartTotal(): number {
		let cartTotal = 0;
		for (let i = 0; i < this.cart.length; i++) {
			cartTotal += this.cart[i]?.price ?? 0;
		}
		return cartTotal;
	}

	// Up to 6 items on the current page
	private getPageItems(): ShopItem[] {
		const start = this.page * ITEMS_PER_PAGE;
		return SHOP_ITEMS.slice(start, start + ITEMS_PER_PAGE);
	}

	// Returns num pages the shop has for items
	private getPageCount(): number {
		return Math.max(1, Math.ceil(SHOP_ITEMS.length / ITEMS_PER_PAGE));
	}

	// Returns item IDs that are already bought/owned
	private getOwnedIds(): string[] {
		return this.saveManager.getCurrent()?.customizations ?? [];
	}

	getView(): ShopScreenView {
		return this.view;
	}
}