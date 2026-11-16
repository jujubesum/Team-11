import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import type { ShopItem } from "../../ShopItems.ts";
import { TopBar } from "../../components/TopBar.ts";
import { makeCircleButton, addPointerCursor, setCursor, setArrowEnabled } from "../../components/CircleButton.ts";

export interface ShopScreenHandlers {
	onHome: () => void;
	onHelp: () => void;
	onItemClick: (item: ShopItem) => void;
	onPurchase: () => void;
	onEmptyCart: () => void;
	onPrevPage: () => void;
	onNextPage: () => void;
}

// "Balance:" and "Price (of items in cart):" text row
const INFO_Y = STAGE_HEIGHT * 0.2;
const PRICE_X = STAGE_WIDTH * 0.05;
const BALANCE_X = STAGE_WIDTH * 0.8;
const INFO_FONT_SIZE = 40;

// Cart box (left side)
const CART_X = STAGE_WIDTH * 0.05;
const CART_Y = STAGE_HEIGHT * 0.3;
const CART_WIDTH = STAGE_WIDTH * 0.45;
const CART_HEIGHT = STAGE_HEIGHT * 0.5;

// Small kitchen pictures inside the cart
const CART_ITEM_X = CART_X + STAGE_WIDTH * 0.0375;
const CART_ITEM_Y = STAGE_HEIGHT * 0.4125;
const CART_ITEM_WIDTH = STAGE_WIDTH * 0.085;
const CART_ITEM_HEIGHT = STAGE_HEIGHT * 0.15;
const CART_ITEM_GAP = STAGE_WIDTH * 0.01;
const CART_ITEMS_PER_ROW = Math.floor(
	(CART_WIDTH - 2 * (CART_ITEM_X - CART_X) + CART_ITEM_GAP) / (CART_ITEM_WIDTH + CART_ITEM_GAP),
);
const CART_ROWS = 2;

// Purchase / Empty Cart buttons (under the cart)
const ACTION_Y = STAGE_HEIGHT * 0.85;
const ACTION_HEIGHT = STAGE_HEIGHT * 0.08;
const ACTION_WIDTH = STAGE_WIDTH * 0.2;
const PURCHASE_X = STAGE_WIDTH * 0.05;
const EMPTY_CART_X = STAGE_WIDTH * 0.3;

// Item grid (right side, 2 rows x 3 columns)
const GRID_X = STAGE_WIDTH * 0.525;
const GRID_Y = STAGE_HEIGHT * 0.3;
const GRID_COLUMNS = 3;
const TILE_WIDTH = STAGE_WIDTH * 0.1375;
const TILE_HEIGHT = STAGE_HEIGHT * 0.25;
const TILE_GAP_X = STAGE_WIDTH * 0.01;
const TILE_GAP_Y = STAGE_HEIGHT * 0.02;
const TILE_PAD = TILE_WIDTH * 0.06;
const PREVIEW_HEIGHT = TILE_HEIGHT * 0.55;

// Page arrows (under the grid)
const ARROW_Y = STAGE_HEIGHT * 0.89;
const ARROW_RADIUS = STAGE_HEIGHT * 0.04;
const PREV_ARROW_X = STAGE_WIDTH * 0.55;
const NEXT_ARROW_X = STAGE_WIDTH * 0.935;

// Colors
const FILL = "#d9d9d9";
const TILE_FILL = "#8c8c8c";
const ACTION_FILL = "#bfbfbf";
const ACTION_HOVER_FILL = "#a9a9a9";
const FONT = "Arial";

// Shop screen: cart on the left, pages of kitchens on the right
export class ShopScreenView implements View {
	private group = new Konva.Group({ visible: false });
	private handlers: ShopScreenHandlers;

	private balanceText!: Konva.Text;
	private priceText!: Konva.Text;
	private purchaseButton!: Button;
	private prevArrow!: Konva.Group;
	private nextArrow!: Konva.Group;

	private cartItemsGroup = new Konva.Group();
	private gridGroup = new Konva.Group();

	constructor(handlers: ShopScreenHandlers) {
		this.handlers = handlers;

		this.group.add(new Konva.Rect({ width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: FILL }));

		// Top Bar
		this.group.add(new TopBar({ title: "Shop", onHome: handlers.onHome, onHelp: handlers.onHelp }).getGroup());

		this.buildInfoRow();
		this.buildCart();
		this.buildActionButtons();
		this.buildPageArrows();

		this.group.add(this.cartItemsGroup, this.gridGroup);
	}

	// ---------- Building Parts ----------

	// Balance on the right and Price on the left
	private buildInfoRow(): void {
		this.balanceText = new Konva.Text({
			x: BALANCE_X,
			y: INFO_Y,
			fontSize: INFO_FONT_SIZE,
			fontFamily: FONT,
		});
		this.priceText = new Konva.Text({
			x: PRICE_X,
			y: INFO_Y,
			fontSize: INFO_FONT_SIZE,
			fontFamily: FONT,
		});
		this.group.add(this.balanceText, this.priceText);
		this.setBalance(0);
		this.setCartTotal(0);
	}

	// White box with the "Cart:" label and items go inside cartItemsGroup
	private buildCart(): void {
		this.group.add(
			new Konva.Rect({
				x: CART_X,
				y: CART_Y,
				width: CART_WIDTH,
				height: CART_HEIGHT,
				fill: "white",
				stroke: "black",
				strokeWidth: 3,
				cornerRadius: 12,
			}),
			new Konva.Text({
				x: CART_X,
				y: CART_Y + STAGE_HEIGHT * 0.03,
				width: CART_WIDTH,
				text: "Cart:",
				fontSize: 36,
				fontFamily: FONT,
				align: "center",
			}),
		);
	}

	// Purchase and Empty Cart buttons under the cart white box
	private buildActionButtons(): void {
		this.purchaseButton = new Button({
			x: PURCHASE_X,
			y: ACTION_Y,
			width: ACTION_WIDTH,
			height: ACTION_HEIGHT,
			label: "Purchase",
			onClick: this.handlers.onPurchase,
			fontSize: 26,
			fill: ACTION_FILL,
			hoverFill: ACTION_HOVER_FILL,
			disabled: true, // Controller turns buttons to enabled when the player can afford the cart
			disabledFill: ACTION_FILL,
		});

		const emptyCartButton = new Button({
			x: EMPTY_CART_X,
			y: ACTION_Y,
			width: ACTION_WIDTH,
			height: ACTION_HEIGHT,
			label: "Empty Cart",
			onClick: this.handlers.onEmptyCart,
			fontSize: 26,
			fill: ACTION_FILL,
			hoverFill: ACTION_HOVER_FILL,
		});

		this.group.add(this.purchaseButton.getGroup(), emptyCartButton.getGroup());
	}

	// Left and right circle arrows under the grid.
	private buildPageArrows(): void {
		this.prevArrow = makeCircleButton("<", PREV_ARROW_X, ARROW_Y, ARROW_RADIUS, "white", this.handlers.onPrevPage);
		this.nextArrow = makeCircleButton(">", NEXT_ARROW_X, ARROW_Y, ARROW_RADIUS, "white", this.handlers.onNextPage);
		this.group.add(this.prevArrow, this.nextArrow);
	}

	// ---------- Updating Values ----------

	// Show the player's money
	setBalance(money: number): void {
		this.balanceText.text(`Balance: $${money}`);
		this.group.getLayer()?.batchDraw();
	}

	// Show total price of everything in the cart
	setCartTotal(total: number): void {
		this.priceText.text(`Price (of items in cart): $${total}`);
		this.group.getLayer()?.batchDraw();
	}

	// Redraw small kitchen pictures inside the cart box
	setCart(items: ShopItem[]): void {
		this.cartItemsGroup.destroyChildren();

		const maxShown = CART_ITEMS_PER_ROW * CART_ROWS;
		const shown = items.length > maxShown ? items.slice(0, maxShown - 1) : items;

		shown.forEach((item, i) => {
			const { x, y } = cartSlot(i);
			this.cartItemsGroup.add(makeKitchenPreview(item, x, y, CART_ITEM_WIDTH, CART_ITEM_HEIGHT));
		});

		// Too many to fit: the last slot says how many more
		if (items.length > maxShown) {
			const { x, y } = cartSlot(maxShown - 1);
			this.cartItemsGroup.add(
				new Konva.Text({
					x,
					y,
					width: CART_ITEM_WIDTH,
					height: CART_ITEM_HEIGHT,
					text: `+${items.length - shown.length} more`,
					fontSize: 24,
					fontFamily: FONT,
					align: "center",
					verticalAlign: "middle",
				}),
			);
		}

		this.group.getLayer()?.batchDraw();
	}

	setPage(items: ShopItem[], ownedIds: string[]): void {
		this.gridGroup.destroyChildren();

		items.forEach((item, i) => {
			const col = i % GRID_COLUMNS;
			const row = Math.floor(i / GRID_COLUMNS);
			const x = GRID_X + col * (TILE_WIDTH + TILE_GAP_X);
			const y = GRID_Y + row * (TILE_HEIGHT + TILE_GAP_Y);

			const owned = ownedIds.includes(item.id);
			this.gridGroup.add(this.makeTile(item, x, y, owned));
		});

		this.group.getLayer()?.batchDraw();
	}

	// Dim the arrows when there's no page to go to
	setPageArrows(canGoPrev: boolean, canGoNext: boolean): void {
		setArrowEnabled(this.prevArrow, canGoPrev);
		setArrowEnabled(this.nextArrow, canGoNext);
		this.group.getLayer()?.batchDraw();
	}

	// Grey out Purchase when the player can't afford the cart (or empty)
	setPurchaseEnabled(enabled: boolean): void {
		this.purchaseButton.setEnabled(enabled);
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.batchDraw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	// ---------- Helpers ----------

	// One grid tile containing the kitchen picture, name, and price (or "Owned" after purchased)
	private makeTile(item: ShopItem, x: number, y: number, owned: boolean): Konva.Group {
		const tile = new Konva.Group({ x, y });
		const previewWidth = TILE_WIDTH - 2 * TILE_PAD;

		tile.add(
			new Konva.Rect({
				width: TILE_WIDTH,
				height: TILE_HEIGHT,
				fill: TILE_FILL,
				stroke: "black",
				strokeWidth: 3,
				cornerRadius: 12,
			}),
			makeKitchenPreview(item, TILE_PAD, TILE_PAD, previewWidth, PREVIEW_HEIGHT),
			new Konva.Text({
				y: TILE_PAD + PREVIEW_HEIGHT + 10,
				width: TILE_WIDTH,
				text: item.name,
				fontSize: 25,
				fontFamily: FONT,
				fill: "white",
				align: "center",
				listening: false,
			}),
			new Konva.Text({
				y: TILE_PAD + PREVIEW_HEIGHT + 40,
				width: TILE_WIDTH,
				text: owned ? "Owned ✓" : `$${item.price}`,
				fontSize: 25,
				fontStyle: "bold",
				fontFamily: FONT,
				fill: "white",
				align: "center",
				listening: false,
			}),
		);

		if (owned) {
			// Already bought makes the tile faded and not clickable
			tile.opacity(0.55);
		} else {
			tile.on("click tap", () => this.handlers.onItemClick(item));
			addPointerCursor(tile);
		}

		return tile;
	}
}

// Top-left corner of cart slot number i (fills left to right, then the next row)
function cartSlot(i: number): { x: number; y: number } {
	const col = i % CART_ITEMS_PER_ROW;
	const row = Math.floor(i / CART_ITEMS_PER_ROW);
	return {
		x: CART_ITEM_X + col * (CART_ITEM_WIDTH + CART_ITEM_GAP),
		y: CART_ITEM_Y + row * (CART_ITEM_HEIGHT + CART_ITEM_GAP),
	};
}

// Preview
export function makeKitchenPreview(
	item: ShopItem,
	x: number,
	y: number,
	width: number,
	height: number,
): Konva.Shape {
	return new Konva.Rect({
		x,
		y,
		width,
		height,
		fill: item.color,
		stroke: "black",
		strokeWidth: 2,
		cornerRadius: 8,
		listening: false,
	});
}