import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPBAR_HEIGHT } from "./../../constants"

const HEADERCOLOR = "#989898";
const BGCOLOR = "#D9D9D9";
const WHITE = "#FFFFFF"
const MARGIN = 50;
const GAP = 100;
const BOX_WIDTH = (STAGE_WIDTH - 2 * MARGIN - GAP) / 2;
const BOX_HEIGHT = (STAGE_HEIGHT - TOPBAR_HEIGHT) * 3 / 4;
const BOX_Y = TOPBAR_HEIGHT + MARGIN;
const LEFT_BOX_X = MARGIN;
const RIGHT_BOX_X = MARGIN + BOX_WIDTH + GAP;

/**
 * GameTutorialView renders the game tutorials using Konva
 */
export class GameTutorialView {
  private group: Konva.Group;
  private titleDisplay: Konva.Text;
  private bodyDisplay: Konva.Text;

  constructor(){
    this.group = new Konva.Group({visible: false});
    const leftPanel = new Konva.Group({x: LEFT_BOX_X, y: BOX_Y});
    const rightPanel = new Konva.Group({x:RIGHT_BOX_X, y: BOX_Y});
    const PADDING = 20;

    const bg = new Konva.Rect({
      x:0,
      y:0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: BGCOLOR,
    });

    const topBar = new Konva.Rect({
      width: STAGE_WIDTH,
      height: TOPBAR_HEIGHT,
      fill: HEADERCOLOR,
    });

    const headerText = new Konva.Text({
      width: STAGE_WIDTH,
      height: TOPBAR_HEIGHT,
      text: "How to play",
      fontSize: 64,
      fill: "black",
      align: "center",
      verticalAlign: "middle"
    });

    this.titleDisplay = new Konva.Text({
      x: PADDING,
      y: PADDING,
      width: BOX_WIDTH - 2 * PADDING,
      text: "TEST TITLE",
      fontSize: 48,
      fontStyle: "bold",
      fill: "black",
      align: "center"
    });

    this.bodyDisplay = new Konva.Text({
      x: PADDING,
      y: PADDING + 60, // room for title
      width: BOX_WIDTH - 2 * PADDING,
      text: "TEST BODY",
      fontSize: 32,
      lineHeight: 1.5,
      fill: "black",
      align: "center",
    });

    const placeholder = new Konva.Text({
      text: "IMAGE PLACEHOLDER",
      fontSize: 64,
      width: BOX_WIDTH - 2 * PADDING,
      height: BOX_HEIGHT - 2 * PADDING,
      fill: "black",
      align: "center",
      verticalAlign: "middle"
    });

    leftPanel.add(this.makeBox(), this.titleDisplay, this.bodyDisplay);
    rightPanel.add(this.makeBox(), placeholder);

    this.group.add(
      bg, 
      topBar,
      headerText,
      leftPanel,
      rightPanel,
    );

  }

  /**
   * @returns konva group of view
   */
  getGroup(): Konva.Group { return this.group; }

  /** Following 2 methods are self explanatory */
  show(): void { 
    this.group.visible(true); 
    this.group.getLayer()?.draw(); 
  }

  hide(): void { 
    this.group.visible(false); 
    this.group.getLayer()?.draw(); 
  }

  /**
   * Sets and updates the display based on inputted strings
   * @param title Desired title
   * @param body Desired body
   */
  setTutorial(title: string, body: string): void {
    this.titleDisplay.text(title);
    this.bodyDisplay.text(body);
    this.group.getLayer()?.batchDraw();
  }

  private makeBox(): Konva.Rect {
    return new Konva.Rect({
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      stroke: "black",
      fill: WHITE,
      cornerRadius: 10,
    });
  }
}