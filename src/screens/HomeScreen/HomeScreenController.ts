//New Game, continue, and back actions
import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { HomeScreenView } from "./HomeScreenView";

//HomeScreenController - Handles home interactions
export class HomeScreenController extends ScreenController {
	private view: HomeScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new HomeScreenView({
            onSaveExit: () => this.handleSaveExit()
        });
	}

	// Handle start button click
	private handleSaveExit(): void {
		this.screenSwitcher.switchToScreen({type:"title"});
	}

	// Return the view
	getView(): HomeScreenView {
		return this.view;
	}
}