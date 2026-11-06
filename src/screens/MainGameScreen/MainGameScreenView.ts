import Konva from "konva";
import type { ScreenSwitcher, View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { TopBar } from "../../components/TopBar.ts";
import { TOPBAR_HEIGHT } from "../../constants.ts";

// Object Dimensions
const MARGIN = 40;
const PADDING = 40;
const GAP = 30;
const PROGRESS_Y = TOPBAR_HEIGHT + 20;
const PROGRESS_HEIGHT = 40;
const PANELS_Y = PROGRESS_Y + PROGRESS_HEIGHT + 20;
const PANEL_HEIGHT = STAGE_HEIGHT - PANELS_Y - MARGIN;
const PANEL_COUNT = 3;
const PANEL_WIDTH = (STAGE_WIDTH - 2 * MARGIN - (PANEL_COUNT - 1) * GAP) / PANEL_COUNT;
const STEP_BOX_HEIGHT = PANEL_HEIGHT / 4;
const STEP_BOX_WIDTH = PANEL_WIDTH / 8;
const STEPS_START_Y = MARGIN + PADDING * 3;

// Colors
const WHITE = "#FFFFFF"
const GRAY = "#d9d9d9"

export interface MainGameScreenHandlers {
  onHelp: () => void;
}

export class MainGameScreenView implements View {
  private group: Konva.Group;
  private leftPanel: Konva.Group;
  private middlePanel: Konva.Group;
  private rightPanel: Konva.Group;
  private recipeTitle: Konva.Text;
  private stepsGroup: Konva.Group;
  private stepsCheck: Konva.Shape[] = [];


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

    // Non static title header, update with updateTitle()
    this.recipeTitle = new Konva.Text({
      text: "Placeholder",
      fontSize: 64,
      fill: "black",
      align: "center",
      width: PANEL_WIDTH,
      y: MARGIN,
    });
    this.middlePanel.add(this.recipeTitle);

    this.group.add(this.leftPanel,
                   this.middlePanel,
                   this.rightPanel,
    );

    // non static steps boxes and text
    this.stepsGroup = new Konva.Group({ x: PADDING, y: STEPS_START_Y });
    this.leftPanel.add(this.stepsGroup);
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

  fillLeftPanel(steps: string[]): void {
    this.stepsGroup.destroyChildren();
    this.stepsCheck = [];

    const BOX_SIZE = 36;
    const ROW_GAP = 20;
    const textWidth = PANEL_WIDTH - 2 * PADDING - BOX_SIZE - 16;
    let y = 0;

    steps.forEach((label) => {
      const box = new Konva.Rect({
        width: BOX_SIZE, height: BOX_SIZE,
        stroke: "black", strokeWidth: 2, cornerRadius: 6, fill: GRAY,
      });
      const text = new Konva.Text({
        x: BOX_SIZE + 16,
        width: textWidth,
        text: label,
        fontSize: 20,
        fill: "black",
      });
      const check = new Konva.Line({
        points: [8, 8, BOX_SIZE - 8, BOX_SIZE - 8, BOX_SIZE / 2, BOX_SIZE / 2,
          BOX_SIZE - 8, 8, 8, BOX_SIZE - 8],
        stroke: "black", strokeWidth: 3, visible: false,
      });

      const row = new Konva.Group({ y });
      row.add(box, text, check);
      this.stepsGroup.add(row);
      this.stepsCheck.push(check);

      y += Math.max(BOX_SIZE, text.height()) + ROW_GAP;
      this.group.getLayer()?.batchDraw();
    });
  }

  setStepChecked(index: number, checked: boolean): void {
    this.stepsCheck[index]?.visible(checked);
    this.group.getLayer()?.batchDraw();
  }

  updateTitle(newTitle: string): void {
    this.recipeTitle.text(newTitle);
    this.group.getLayer()?.batchDraw();
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