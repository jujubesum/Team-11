import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
 
// Callbacks the controller provides. Subject to more.
export interface HomeScreenHandlers {
	onSaveExit: () => void;
}
 
// Layout as fractions of the stage for future scalability.
const PAD_X = STAGE_WIDTH * 0.064;
const COL_GAP = STAGE_WIDTH * 0.031;
const TOP_Y = STAGE_HEIGHT * 0.104;
const ROW_HEIGHT = STAGE_HEIGHT * 0.163;
const ROW_GAP = STAGE_HEIGHT * 0.046;
 
const FULL_WIDTH = STAGE_WIDTH - 2 * PAD_X;
const COL_WIDTH = (FULL_WIDTH - COL_GAP) / 2;
 
// Renders the Home Screen view
 
export class HomeScreenView implements View {
	private group: Konva.Group;
 
	constructor(handlers: HomeScreenHandlers) {
		this.group = new Konva.Group({ visible: false });
 
		this.group.add(
			new Konva.Rect({
				width: STAGE_WIDTH,
				height: STAGE_HEIGHT,
				fill: "#d9d9d9",
			}),
		);
 
		const leftX = PAD_X;
		const rightX = PAD_X + COL_WIDTH + COL_GAP;
 
		// Adding home screen buttons
		this.addButton("Start Baking!", leftX, rowY(0), FULL_WIDTH);
 

		this.addButton("Minigame: Change Counting", leftX, rowY(1), COL_WIDTH);
		this.addButton("Math Tutorials", rightX, rowY(1), COL_WIDTH);
 
		this.addButton("Minigame: Order Dividing", leftX, rowY(2), COL_WIDTH);
		this.addButton("Recipe Book", rightX, rowY(2), COL_WIDTH);
 
		this.addButton("Shop", leftX, rowY(3), COL_WIDTH);
		this.addButton("Save & Exit", rightX, rowY(3), COL_WIDTH, handlers.onSaveExit);
	}
 
	private addButton(
		label: string,
		x: number,
		y: number,
		width: number,
		onClick?: () => void,
	): void {
		const button = new Button({ x, y, width, height: ROW_HEIGHT, label, onClick });
		this.group.add(button.getGroup());
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
 
function rowY(index: number): number {
	return TOP_Y + index * (ROW_HEIGHT + ROW_GAP);
}
 
