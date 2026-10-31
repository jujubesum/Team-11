import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import type { SaveManager } from "../../saveManager.ts";
import { TitleScreenView } from "./TitleScreenView.ts";
 
// TitleScreenController - decides which title screen state to show (new game vs continue)
// and handles the New Game / Continue buttons.
export class TitleScreenController extends ScreenController {
	private view: TitleScreenView;
	private screenSwitcher: ScreenSwitcher;
  private saveManager: SaveManager;
 
	constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager) {
		super();
		this.screenSwitcher = screenSwitcher;
    this.saveManager = saveManager;
		this.view = new TitleScreenView({
			onContinue: () => this.handleContinue(),
			onNewGame: () => this.handleNewGame(),
      onTutorial: () => this.handleTutorial(),
  });
  }
 
	// Runs every time the screen opens, so the Continue button stays up to date after the player saves.
	override show(): void {
		const save = this.saveManager.load();
		this.view.setSaveInfo(save ? save.level : null);
		super.show();
	}
 
	// Continue the existing game.
	private handleContinue(): void {
		if (!this.saveManager.getCurrent()) {
			this.saveManager.load();
		}
		this.screenSwitcher.switchToScreen({ type: "home" });
	}
 
	// Start a new game. If a save already exists, ask for confirmation first.
	private handleNewGame(): void {
		if (this.saveManager.hasSave()) {
			this.screenSwitcher.switchToScreen({ type: "newGameCheck" });
			return;
		}
		this.saveManager.startNewGame();
		this.screenSwitcher.switchToScreen({ type: "home" });
	}

  //
  private handleTutorial(): void {
    this.screenSwitcher.switchToScreen( { type: "gameTutorial" });
  }
 
	getView(): TitleScreenView {
		return this.view;
	}
}
