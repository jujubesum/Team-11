import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { TitleScreenView } from "./TitleScreenView.ts";
 
// TitleScreenController - decides which title screen state to show (new game vs continue)
// and handles the New Game / Continue buttons.
export class TitleScreenController extends ScreenController {
	private view: TitleScreenView;
	private screenSwitcher: ScreenSwitcher;
 
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new TitleScreenView({
			onContinue: () => this.handleContinue(),
			onNewGame: () => this.handleNewGame(),
		});
	}
 
	// Runs every time the screen opens, so the Continue button stays up to date after the player saves.
	override show(): void {
		// TODO (save system): pass the saved level, or null if there is no save.
		this.view.setSaveInfo(null);
		super.show();
	}
 
	// Continue the existing game.
	private handleContinue(): void {
		// TODO (save system): load the existing save here
		this.screenSwitcher.switchToScreen({ type: "home" });
	}
 
	// Start a new game, replacing any existing save. 
	private handleNewGame(): void {
		// TODO add save system logic
		this.screenSwitcher.switchToScreen({ type: "home" });
	}
 
	getView(): TitleScreenView {
		return this.view;
	}
}
 