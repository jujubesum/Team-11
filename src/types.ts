import type { Group } from "konva/lib/Group";

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

//Screen types for navigating between screens

export type Screen =
	| { type: "title" }
	| { type: "home" }
	| { type: "game" }
  | {type: "gameTutorial"};

export abstract class ScreenController {
abstract getView(): View;

show(): void {
    this.getView().show();
}

hide(): void {
    this.getView().hide();
}
}

export interface ScreenSwitcher {
switchToScreen(screen: Screen): void;
}