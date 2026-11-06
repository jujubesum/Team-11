import Konva from "konva";
import type { ScreenSwitcher, View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { TopBar } from "../../components/TopBar.ts";
import { TOPBAR_HEIGHT } from "../../constants.ts";

// Object Dimensions
const MARGIN = 40;
const GAP = 30;
const PROGRESS_Y = TOPBAR_HEIGHT + 20;
const PROGRESS_HEIGHT = 40;
const PANELS_Y = PROGRESS_Y + PROGRESS_HEIGHT + 20;
const PANEL_HEIGHT = STAGE_HEIGHT - PANELS_Y - MARGIN;
const PANEL_COUNT = 3;
const PANEL_WIDTH = (STAGE_WIDTH - 2 * MARGIN - (PANEL_COUNT - 1) * GAP) / PANEL_COUNT;

// Colors
const WHITE = "#FFFFFF"

export interface MainGameScreenHandlers {
  onHelp: () => void;
}

export class MainGameScreenView implements View {
  private group: Konva.Group;
  private leftPanel: Konva.Group;
  private middlePanel: Konva.Group;
  private rightPanel: Konva.Group;

  constructor(handlers: MainGameScreenHandlers, screenSwitcher: ScreenSwitcher){
    this.group = new Konva.Group({ visible: false });

    // background
    this.group.add( 
          new Konva.Rect({
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#d9d9d9",
          }),
        );

    // topbar
    this.group.add(new TopBar({ title: "Baking", screenSwitcher, onHelp: handlers.onHelp }).getGroup());
  
    // game panels
    this.leftPanel = this.makePanel(PANEL_WIDTH, PANEL_HEIGHT, MARGIN, PANELS_Y);
    this.middlePanel = this.makePanel(PANEL_WIDTH, PANEL_HEIGHT, MARGIN + GAP + PANEL_WIDTH, PANELS_Y);
    this.rightPanel = this.makePanel(PANEL_WIDTH, PANEL_HEIGHT, MARGIN + GAP * 2 + PANEL_WIDTH * 2, PANELS_Y)

    // Static headers on game panels
    this.leftPanel.add(new Konva.Text({
      text: "Steps",
      fontSize: 64,
      fill: "black",
      align: "center",
      width: PANEL_WIDTH,
      y: MARGIN
    }));

    this.rightPanel.add(new Konva.Text({
      text: "Solve Problem",
      fontSize: 64,
      fill: "black",
      align: "center",
      width: PANEL_WIDTH,
      y: MARGIN,
    }));

    this.group.add(this.leftPanel,
                   this.middlePanel,
                   this.rightPanel,
    );
  }

  makePanel(width: number, height: number, x: number, y: number): Konva.Group {
    const panel = new Konva.Group({x: x, y: y});
    const box = new Konva.Rect({
      width: width,
      height: height,
      stroke: "black",
      fill: WHITE,
      cornerRadius: 10,
    });
    panel.add(box);
    return panel;
  }

  fillLeftPanel(): {

  }


  show(): void {
    this.group.show();
    this.group.getLayer()?.batchDraw();
  }

  hide(): void {
    this.group.hide();
    this.group.getLayer()?.batchDraw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}