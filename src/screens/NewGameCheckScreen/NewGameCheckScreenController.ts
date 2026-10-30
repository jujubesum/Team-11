import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import type { SaveManager } from "../../saveManager.ts";
import { NewGameCheckScreenView } from "./NewGameCheckScreenView.ts";
 
//  NewGameCheckScreenController - Double checks the person wants to make a new game
export class NewGameCheckScreenController extends ScreenController {
	private view: NewGameCheckScreenView;
	private screenSwitcher: ScreenSwitcher;
	private saveManager: SaveManager;
 
	constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.saveManager = saveManager;
		this.view = new NewGameCheckScreenView({
			onYes: () => this.handleYes(),
			onNo: () => this.handleNo(),
		});
	}

 
	// Start a new game, replacing any existing save
	private handleYes(): void {
		this.saveManager.startNewGame();
		this.screenSwitcher.switchToScreen({ type: "home" });

	}

	// Dont start a new game, go back to title screen
	private handleNo(): void {
		this.screenSwitcher.switchToScreen({ type: "title" });

	}
 
	getView(): NewGameCheckScreenView {
		return this.view;
	}
}
 