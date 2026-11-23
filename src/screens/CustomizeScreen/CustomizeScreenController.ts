
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import type { SaveManager } from "../../saveManager.ts";
import { SHOP_ITEMS } from "../../ShopItems.ts";
import type { ShopItem } from "../../ShopItems.ts";
import { CustomizeScreenView } from "./CustomizeScreenView.ts";

// CustomizeScreenController - owns the cart and the current page, decides whether the player can buy, and spends their money
export class CustomizeScreenController extends ScreenController {
	private view: CustomizeScreenView;
	private screenSwitcher: ScreenSwitcher;
	private saveManager: SaveManager;

	private onBackgroundChange: () => void;
	
	constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager, onBackgroundChange: () => void) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.saveManager = saveManager;
		this.onBackgroundChange = onBackgroundChange;
		this.view = new CustomizeScreenView({
			onHome: () => this.handleHome(),
			onApply: (kitchenId) => this.handleApply(kitchenId),
			onDefault: () => this.handleDefault(),
		});
	}

	override show(): void {
		this.refresh();
		super.show();
	}

	// ---------- Button Handlers ----------

	private handleHome(): void {
		this.screenSwitcher.switchToScreen({ type: "home" });
	}

	// Applies a kitchen as the background (only if owned and not already applied)
	private handleApply(kitchenId: string): void {
		if (!this.getOwnedIds().includes(kitchenId)) return;
		if (kitchenId === this.getActiveId()) return;
		this.setActive(kitchenId);
	}

	// Conducts the purchase or does not allow it if you do not have enough money
	private handleDefault(): void {
		if (this.getActiveId() === null) return;
		this.setActive(null);

	}

	// ---------- Helpers ----------

	private setActive(kitchenId: string | null): void {
		this.saveManager.update({ activeKitchenId: kitchenId });
		this.saveManager.save();
		this.onBackgroundChange();
		this.refresh();
	}

	// Refreshes and push all details to the screen
	private refresh(): void {
		const activeId = this.getActiveId();
		const active = SHOP_ITEMS.find((item) => item.id === activeId);

		this.view.setCurrent(active ? active.name : "Default");
		this.view.setKitchens(this.getOwnedKitchens(), activeId);
		this.view.setDefaultEnabled(activeId !== null);
	}

	// Kitchen currently used as the background (null = default)
	private getActiveId(): string | null {
		return this.saveManager.getCurrent()?.activeKitchenId ?? null;
	}

	// Full kitchen info for each owned id, in the shop's order
	private getOwnedKitchens(): ShopItem[] {
		const ownedIds = this.getOwnedIds();
		return SHOP_ITEMS.filter((item) => ownedIds.includes(item.id));
	}

	// Ids of the kitchens the player has bought
	private getOwnedIds(): string[] {
		return this.saveManager.getCurrent()?.customizations ?? [];
	}

	getView(): CustomizeScreenView {
		return this.view;
	}
}