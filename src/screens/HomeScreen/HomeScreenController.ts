//New Game, Continue, and Back actions
import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { HomeScreenView } from "./HomeScreenView";

//HomeScreenController - Handles home interactions
export class HomeScreenController extends ScreenController {
	private view: HomeScreenView;
	private screenSwitcher: ScreenSwitcher;
	private saveManager: SaveManager;

	constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.saveManager = saveManager;
		this.view = new HomeScreenView({
			onSaveExit: () => this.handleSaveExit(),
			onRecipeTutorials: () => this.handleRecipeTutorials(),
			onPieFractions: () => this.handlePieFractions(),
		});
	}

	// Handle Save & Exit button click
	private handleSaveExit(): void {
		this.saveManager.save();
		this.screenSwitcher.switchToScreen({ type: "title" });
	}

	// Handle Recipe Tutorials button click
	private handleRecipeTutorials(): void {
		this.screenSwitcher.switchToScreen({ type: "recipeTutorial" });
	}

	// Handle Pie Fraction Minigame button click
	private handlePieFractions(): void {
		this.screenSwitcher.switchToScreen({ type: "pieMinigame"});
	}

	// Return the view
	getView(): HomeScreenView {
		return this.view;
	}
}