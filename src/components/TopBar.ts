import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";
import { makeCircleButton } from "./CircleButton.ts";

// Height of the bar, so pages know where their own content can start
export const TOP_BAR_HEIGHT = STAGE_HEIGHT * 0.15;

const BAR_FILL = "#a6a6a6";
const ICON_RADIUS = TOP_BAR_HEIGHT * 0.3;

export interface TopBarConfig {
	// Page name
	title: string;
	// For the home button, will be unique to the page. Ex. tutorials will bring you back to title, and games will check before exiting
	onHome: () => void;
	// For the help button, unique to every page
	onHelp: () => void;
}

// Home button on the left, help button on the right
export class TopBar {
	private group = new Konva.Group();

	constructor({ title, onHome, onHelp }: TopBarConfig) {
		this.group.add(
			new Konva.Rect({ width: STAGE_WIDTH, height: TOP_BAR_HEIGHT, fill: BAR_FILL }),
			new Konva.Text({
				width: STAGE_WIDTH,
				height: TOP_BAR_HEIGHT,
				text: title,
				fontSize: 56,
				fontFamily: "Arial",
				align: "center",
				verticalAlign: "middle",
			}),
			makeCircleButton("⌂", STAGE_WIDTH * 0.04, TOP_BAR_HEIGHT / 2, ICON_RADIUS, BAR_FILL, onHome),
			makeCircleButton("?", STAGE_WIDTH * 0.96, TOP_BAR_HEIGHT / 2, ICON_RADIUS, BAR_FILL, onHelp),
		);
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}