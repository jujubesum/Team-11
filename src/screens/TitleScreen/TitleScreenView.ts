
import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
 
export interface TitleScreenHandlers {
	onContinue: () => void;
	onNewGame: () => void;
}
 

const CARD_X = STAGE_WIDTH * 0.081;
const CARD_Y = STAGE_HEIGHT * 0.146;
const CARD_WIDTH = STAGE_WIDTH * 0.398;
const CARD_HEIGHT = STAGE_HEIGHT * 0.688;
const BUTTON_WIDTH = CARD_WIDTH * 0.756;
const BUTTON_X = CARD_X + (CARD_WIDTH - BUTTON_WIDTH) / 2;
const BUTTON_HEIGHT = STAGE_HEIGHT * 0.105;
const FILL = "#d9d9d9";
const HOVER_FILL = "#c4c4c4";
 
// Title screen view with two prebuilt cards for new game (when no save) and
// continue game (when there is a save)
export class TitleScreenView implements View {
	private group = new Konva.Group({ visible: false });
	private newGameCard: Konva.Group;
	private continueCard: Konva.Group;
	private continueButton: Button;
 
	constructor(handlers: TitleScreenHandlers) {
		this.group.add(new Konva.Rect({ width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: FILL }));
 
		// Card 1: no save
		this.newGameCard = makeCard(0.315);
		this.newGameCard.add(
			makeButton("New Game", 0.42, BUTTON_HEIGHT, handlers.onNewGame).getGroup(),
			makeButton("How to Play", 0.55, BUTTON_HEIGHT).getGroup(),
		);
 
		// Card 2: save exists
		this.continueCard = makeCard(0.23);
		this.continueButton = makeButton("Continue", 0.34, STAGE_HEIGHT * 0.15, handlers.onContinue);
		this.continueCard.add(
			this.continueButton.getGroup(),
			makeButton("New Game", 0.51, BUTTON_HEIGHT, handlers.onNewGame).getGroup(),
			makeButton("How to Play", 0.64, BUTTON_HEIGHT).getGroup(),
		);
 
		this.group.add(this.newGameCard, this.continueCard);
		this.setSaveInfo(null);
	}
 
	// Show the no-save card (null) or the continue card with the given level.
	setSaveInfo(level: number | null): void {
		this.newGameCard.visible(level === null);
		this.continueCard.visible(level !== null);
		if (level !== null) {
			this.continueButton.setSubtitle(`Level ${level}`);
		}
		this.group.getLayer()?.batchDraw();
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
 
// White card with the "Welcome!" title 
function makeCard(titleY: number): Konva.Group {
	const card = new Konva.Group();
	card.add(
		new Konva.Rect({
			x: CARD_X,
			y: CARD_Y,
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
			fill: "white",
			stroke: "black",
			strokeWidth: 3,
			cornerRadius: 24,
		}),
		new Konva.Text({
			x: CARD_X,
			y: STAGE_HEIGHT * titleY,
			width: CARD_WIDTH,
			text: "Welcome!",
			fontSize: 40,
			fontFamily: "Arial",
			align: "center",
		}),
	);
	return card;
}
 
// Gray button inside the card
function makeButton(label: string, y: number, height: number, onClick?: () => void): Button {
	return new Button({
		x: BUTTON_X,
		y: STAGE_HEIGHT * y,
		width: BUTTON_WIDTH,
		height,
		label,
		onClick,
		fill: FILL,
		hoverFill: HOVER_FILL,
	});
}