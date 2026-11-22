import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { TopBarNoHelp } from "../../components/TopBarNoHelp.ts";
import { makeKitchenPreview } from "../ShopScreen/ShopScreenView.ts";
import type { ShopItem } from "../../ShopItems.ts";

export interface CustomizeScreenHandlers {
	onHome: () => void;
	onApply: (kitchenId: string) => void;
	onDefault: () => void;
}

// "Now using:" text under the top bar
const INFO_X = STAGE_WIDTH * 0.05;
const INFO_Y = STAGE_HEIGHT * 0.175;
const INFO_FONT_SIZE = 35;

// Grid of owned kitchens: 6 columns x 2 rows = room for all 12
const GRID_COLUMNS = 6;
const GRID_SLOTS = 12;
const TILE_WIDTH = STAGE_WIDTH * 0.1375;
const TILE_HEIGHT = STAGE_HEIGHT * 0.3;
const TILE_GAP_X = STAGE_WIDTH * 0.015;
const TILE_GAP_Y = STAGE_HEIGHT * 0.03;
const GRID_WIDTH = GRID_COLUMNS * TILE_WIDTH + (GRID_COLUMNS - 1) * TILE_GAP_X;
const GRID_X = (STAGE_WIDTH - GRID_WIDTH) / 2;
const GRID_Y = STAGE_HEIGHT * 0.28;
const TILE_PAD = TILE_WIDTH * 0.06;
const PREVIEW_HEIGHT = TILE_HEIGHT * 0.45;

// Apply button inside each tile (along the bottom)
const TILE_BUTTON_HEIGHT = TILE_HEIGHT * 0.19;
const TILE_BUTTON_Y = TILE_HEIGHT - TILE_BUTTON_HEIGHT - TILE_PAD;

// Use Default button on the right, same row as "Now using:"
const DEFAULT_WIDTH = STAGE_WIDTH * 0.175;
const DEFAULT_HEIGHT = STAGE_HEIGHT * 0.07;
const DEFAULT_X = STAGE_WIDTH * 0.95 - DEFAULT_WIDTH;
const DEFAULT_Y = INFO_Y;

// Colors
const TILE_FILL = "#8c8c8c";
const EMPTY_STROKE = "#9e9e9e";
const ACTION_FILL = "#bfbfbf";
const ACTION_HOVER_FILL = "#a9a9a9";
const FONT = "Arial";

// Customize screen: cart on the left, pages of kitchens on the right
export class CustomizeScreenView implements View {
	private group = new Konva.Group({ visible: false });
	private handlers: CustomizeScreenHandlers;

	private infoText!: Konva.Text;
	private defaultButton!: Button;

	private gridGroup = new Konva.Group();

	constructor(handlers: CustomizeScreenHandlers) {
		this.handlers = handlers;

		// Top Bar
		this.group.add(new TopBarNoHelp({ title: "Customize", onHome: handlers.onHome }).getGroup());

		this.buildInfo();
		this.buildDefaultButton();

		this.group.add(this.gridGroup);
	}

	// ---------- Building Parts ----------

	// Now using text
	private buildInfo(): void {
		this.infoText = new Konva.Text({
			x: INFO_X,
			y: INFO_Y,
			height: DEFAULT_HEIGHT,
			verticalAlign: "middle",
			fontSize: INFO_FONT_SIZE,
			fontFamily: FONT,
		});
		this.group.add(this.infoText);
	}

	// Use Default button under the grid
	private buildDefaultButton(): void {
		this.defaultButton = new Button({
			x: DEFAULT_X,
			y: DEFAULT_Y,
			width: DEFAULT_WIDTH,
			height: DEFAULT_HEIGHT,
			label: "Use Default",
			onClick: this.handlers.onDefault,
			fontSize: 24,
			fill: ACTION_FILL,
			hoverFill: ACTION_HOVER_FILL,
			disabled: true, // Controller turns it on when a kitchen is applied
			disabledFill: ACTION_FILL,
		});
		this.group.add(this.defaultButton.getGroup());
	}

	// ---------- Updating Values ----------

	// Show which background is in use
	setCurrent(name: string): void {
		this.infoText.text(`Now using: ${name}`);
		this.group.getLayer()?.batchDraw();
	}

	// Redraw the grid: owned kitchens first, then empty slots for the rest
	setKitchens(owned: ShopItem[], activeId: string | null): void {
		this.gridGroup.destroyChildren();

		for (let i = 0; i < GRID_SLOTS; i++) {
			const { x, y } = gridSlot(i);
			const item = owned[i];
			if (item) {
				this.gridGroup.add(this.makeTile(item, x, y, item.id === activeId));
			}
		}

		// Nothing bought yet
		if (owned.length === 0) {
			this.gridGroup.add(
				new Konva.Text({
					x: GRID_X,
					y: GRID_Y + TILE_HEIGHT - 20,
					width: GRID_WIDTH,
					text: "Buy kitchens in the Shop to customize your bakery!",
					fontSize: 36,
					fontFamily: FONT,
					align: "center",
				}),
			);
		}

		this.group.getLayer()?.batchDraw();
	}

	// Grey out Use Default when the default is already in use
	setDefaultEnabled(enabled: boolean): void {
		this.defaultButton.setEnabled(enabled);
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

	// One grid tile containing the kitchen picture, name, and apply button
	private makeTile(item: ShopItem, x: number, y: number, isActive: boolean): Konva.Group {
		const tile = new Konva.Group({ x, y });
		const previewWidth = TILE_WIDTH - 2 * TILE_PAD;

		const applyButton = new Button({
			x: TILE_PAD,
			y: TILE_BUTTON_Y,
			width: previewWidth,
			height: TILE_BUTTON_HEIGHT,
			label: isActive ? "Applied ✓" : "Apply",
			onClick: () => this.handlers.onApply(item.id),
			fontSize: 20,
			fill: ACTION_FILL,
			hoverFill: ACTION_HOVER_FILL,
			disabled: isActive,
			disabledFill: ACTION_FILL,
		});

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
				fontSize: 20,
				fontFamily: FONT,
				fill: "white",
				align: "center",
				listening: false,
			}),
			applyButton.getGroup(),
		);

		return tile;
	}
}

// Top-left corner of cart slot number i (fills left to right, then the next row)
function gridSlot(i: number): { x: number; y: number } {
	const col = i % GRID_COLUMNS;
	const row = Math.floor(i / GRID_COLUMNS);
	return {
		x: GRID_X + col * (TILE_WIDTH + TILE_GAP_X),
		y: GRID_Y + row * (TILE_HEIGHT + TILE_GAP_Y),
	};
}
