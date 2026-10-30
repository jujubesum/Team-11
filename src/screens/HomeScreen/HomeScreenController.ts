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
        });
	}

	// Handle start button click
	private handleSaveExit(): void {
		this.saveManager.save();
		this.screenSwitcher.switchToScreen({type:"title"});
	}

	// Return the view
	getView(): HomeScreenView {
		return this.view;
	}
}