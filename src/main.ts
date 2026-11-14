import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { TitleScreenController } from "./screens/TitleScreen/TitleScreenController.ts";
import { HomeScreenController } from "./screens/HomeScreen/HomeScreenController.ts";
import { GameTutorialController } from "./screens/game-tutorials/gameTutorialController.ts";
import { NewGameCheckScreenController } from "./screens/NewGameCheckScreen/NewGameCheckScreenController.ts";
import { ShopScreenController } from "./screens/ShopScreen/ShopScreenController.ts";
import { RecipeTutorialController } from "./screens/RecipeTutorialScreen/RecipeTutorialController.ts";
import { PieMinigameController } from "./screens/PieMinigame/PieMinigameController.ts";
import { MainGameScreenController } from "./screens/MainGameScreen/MainGameScreenController.ts";
import { SaveManager } from "./saveManager.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import { CashierGameController } from "./CashierMiniGame/CashierGameController.ts";


/**
 * Main Application - Coordinates all screens
 *
 * This class demonstrates screen management using Konva Groups.
 * Each screen (Menu, Game, Results) has its own Konva.Group that can be
 * shown or hidden independently.
 *
 * Key concept: All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	// One shared SaveManager so every screen reads and writes the same save
	private saveManager = new SaveManager();

	private homeController: HomeScreenController;
	private titleController: TitleScreenController;
	private newGameCheckController: NewGameCheckScreenController;
	private shopController: ShopScreenController;
	private gameTutorialController: GameTutorialController;
	private recipeTutorialController: RecipeTutorialController;
	private pieMinigameController: PieMinigameController;
  private mainGameScreenController: MainGameScreenController;
	private cashierGameController: CashierGameController;

	constructor(container: string) {
		// Initialize Konva stage (the main canvas)
		this.stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		// Create a layer (screens will be added to this layer)
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		// Initialize all screen controllers
		// Each controller manages a Model, View, and handles user interactions
		this.homeController = new HomeScreenController(this, this.saveManager);
		this.titleController = new TitleScreenController(this, this.saveManager);
		this.newGameCheckController = new NewGameCheckScreenController(this, this.saveManager);
		this.shopController = new ShopScreenController(this, this.saveManager);
		this.gameTutorialController = new GameTutorialController(this);
		this.recipeTutorialController = new RecipeTutorialController(this);
		this.pieMinigameController = new PieMinigameController(this);
    this.mainGameScreenController = new MainGameScreenController(this, this.saveManager);
		this.cashierGameController = new CashierGameController(this);

		// Add all screen groups to the layer
		// All screens exist simultaneously but only one is visible at a time
		this.layer.add(this.homeController.getView().getGroup());
		this.layer.add(this.titleController.getView().getGroup());
		this.layer.add(this.gameTutorialController.getView().getGroup());
		this.layer.add(this.newGameCheckController.getView().getGroup());
		this.layer.add(this.shopController.getView().getGroup());
		this.layer.add(this.recipeTutorialController.getView().getGroup());
		this.layer.add(this.pieMinigameController.getView().getGroup());
    this.layer.add(this.mainGameScreenController.getView().getGroup());
		this.layer.add(this.cashierGameController.getView().getGroup());

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with title screen visible
		this.titleController.show();

		// Save progress if the player closes the tab without pressing Save & Exit
		window.addEventListener("beforeunload", () => this.saveManager.save());
	}

	/**
	 * Switch to a different screen
	 *
	 * This method implements screen management by:
	 * 1. Hiding all screens (setting their Groups to invisible)
	 * 2. Showing only the requested screen
	 *
	 * This pattern ensures only one screen is visible at a time.
	 */
	switchToScreen(screen: Screen): void {
		// Hide all screens first by setting their Groups to invisible
		this.homeController.hide();
		this.titleController.hide();
		this.gameTutorialController.hide();
		this.newGameCheckController.hide();
		this.shopController.hide();
		this.recipeTutorialController.hide();
		this.pieMinigameController.hide();
    this.mainGameScreenController.hide();
		this.cashierGameController.hide();
		
		// this.resultsController.hide();

		// Show the requested screen based on the screen type
		switch (screen.type) {
			case "title":
				this.titleController.show();
				break;

			case "home":
				this.homeController.show();
				break;

			case "gameTutorial":
				this.gameTutorialController.show();
				break;

			case "newGameCheck":
				this.newGameCheckController.show();
				break;

			case "shop":
				this.shopController.show();
				break;

		// 	more cases to add in the future: games, tutorials, etc.
			case "recipeTutorial":
				this.recipeTutorialController.show();
				break;
      
      case "mainGame":
        this.mainGameScreenController.show();
			case "cashierGame":
				this.cashierGameController.getView().show();
				break;

			case "pieMinigame":
				this.pieMinigameController.show();
				break;
			// 	more cases to add in the future: games, tutorials, etc.
		}
	}
}

// Initialize the application
new App("container");
