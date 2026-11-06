import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { SaveManager } from "../../saveManager";
import { MainGameScreenView } from "./MainGameScreenView";
import { HomeScreenController } from "../HomeScreen/HomeScreenController";

export class MainGameScreenController extends ScreenController {
  private view: MainGameScreenView;
  private screenSwitcher: ScreenSwitcher;
  private saveManager: SaveManager;

  constructor(screenSwitcher: ScreenSwitcher, saveManager: SaveManager){
    super();
    this.screenSwitcher = screenSwitcher;
    this.saveManager = saveManager;
    this.view = new MainGameScreenView({
      onHelp: () => this.handleHelp(),
    }, this.screenSwitcher);
  }

  getView(): MainGameScreenView {
    return this.view;
  }

  handleHelp(): void {

  }
}