
import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
 
export interface NewGameCheckScreenHandlers {
	onYes: () => void;
	onNo: () => void;
}
 
// Layout as fractions of the stage, taken from the low-fi design
const CARD_X = STAGE_WIDTH * 0.081;
const CARD_Y = STAGE_HEIGHT * 0.146;
const CARD_WIDTH = STAGE_WIDTH * 0.84;
const CARD_HEIGHT = STAGE_HEIGHT * 0.688;
const BUTTON_WIDTH = CARD_WIDTH * 0.9;
const BUTTON_X = CARD_X + (CARD_WIDTH - BUTTON_WIDTH) / 2;
const BUTTON_HEIGHT = STAGE_HEIGHT * 0.1;
const FILL = "#d9d9d9";
const HOVER_FILL = "#c4c4c4";
const TEXT_Y = STAGE_HEIGHT * 0.25;
const YES_Y = STAGE_HEIGHT * 0.4;
const NO_Y = STAGE_HEIGHT * 0.6;

// New game check screen view with the reset? question and yes and no buttons to confirm/deny reset
export class NewGameCheckScreenView implements View {
	private group = new Konva.Group({ visible: false });
 
	constructor(handlers: NewGameCheckScreenHandlers) {
		this.group.add(
			new Konva.Rect({ 
				width: STAGE_WIDTH, 
				height: STAGE_HEIGHT, 
				fill: FILL 
			}),
		
			// White Card
			new Konva.Rect({ 
				x: CARD_X, 
				y: CARD_Y, 
				width: CARD_WIDTH, 
				height: CARD_HEIGHT, 
				fill: "white", 
				stroke: "black", 
				strokeWidth: 3, 
				cornerRadius: 24 
			}),

			// Question in White Card
			new Konva.Text({ 
				x: CARD_X, 
				y: TEXT_Y, 
				width: CARD_WIDTH, 
				text: "Are you sure? Your progress will be reset.", 
				fontSize: 44, 
				align: "center"
			}),
			makeButton("Yes", YES_Y, handlers.onYes).getGroup(),
			makeButton("No", NO_Y, handlers.onNo).getGroup(),

		);
 
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
}
 
// Gray button inside card
function makeButton(label: string, y: number, onClick?: () => void): Button {
	return new Button({
		x: BUTTON_X,
		y,
		width: BUTTON_WIDTH,
		height: BUTTON_HEIGHT,
		label,
		onClick,
		fontSize: 26,
		fill: FILL,
		hoverFill: HOVER_FILL,
	});
}