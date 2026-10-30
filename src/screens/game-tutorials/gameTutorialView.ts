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
const PADDING = 20;
const LEFT_ARROW_X = MARGIN + PADDING;
const LEFT_ARROW_Y = STAGE_HEIGHT - MARGIN - PADDING + 10;
const RIGHT_ARROW_X = STAGE_WIDTH - MARGIN - PADDING - 10 + PADDING;
const RIGHT_ARROW_Y = STAGE_HEIGHT - MARGIN - PADDING + 10;

/**
 * GameTutorialView renders the game tutorials using Konva
 */
export class GameTutorialView {
  private group: Konva.Group;
  private titleDisplay: Konva.Text;
  private bodyDisplay: Konva.Text;
  private leftArrow: Konva.Group;
  private rightArrow: Konva.Group;



  constructor(){
    this.group = new Konva.Group({visible: false});
    const leftPanel = new Konva.Group({x: LEFT_BOX_X, y: BOX_Y});
    const rightPanel = new Konva.Group({x:RIGHT_BOX_X, y: BOX_Y});

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
      text: "TEST TITLE",
      fontSize: 48,
      fontStyle: "bold",
      fill: "black",
      align: "center",
      wrap: "none"
    });

    this.bodyDisplay = new Konva.Text({
      x: PADDING,
      y: PADDING + 60, // room for title
      width: BOX_WIDTH - 2 * PADDING,
      text: "TEST BODY",
      fontSize: 36,
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

    this.leftArrow = this.makeArrowButton("left", LEFT_ARROW_X, LEFT_ARROW_Y);
    this.rightArrow = this.makeArrowButton("right", RIGHT_ARROW_X, RIGHT_ARROW_Y);

    leftPanel.add(this.makeBox(), this.titleDisplay, this.bodyDisplay);
    rightPanel.add(this.makeBox(), placeholder);

    this.group.add(
      bg, 
      topBar,
      headerText,
      leftPanel,
      rightPanel,
      this.leftArrow,
      this.rightArrow,
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
    this.calculateAndSetMaximumTitleFontSize();
    this.group.getLayer()?.batchDraw();
  }
  
  /**
   * 
   * @param handler 
   */
  onArrowPress(handler: (rightShift:boolean) => void): void {
    this.leftArrow.on("click tap", () => handler(false));
    this.rightArrow.on("click tap", () => handler(true));
  }

  /**
   * 
   * @returns Pre-sized boxes used to store tutorials/images
   */
  private makeBox(): Konva.Rect {
    return new Konva.Rect({
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      stroke: "black",
      fill: WHITE,
      cornerRadius: 10,
    });
  }

  /**
   * Creates arrow button
   * @param direction of button arrow
   * @param x of button
   * @param y of button
   * @returns button
   */
  private makeArrowButton(direction: "left" | "right", x: number, y: number): Konva.Group{
    const RADIUS = 40;
    const sign = direction === "left" ? 1 : -1 // will flip the arrow depending on direction
    const button = new Konva.Group({ x, y }); // (x,y) is the circle's center

    const circle = new Konva.Circle({
      radius: RADIUS,
      stroke: "black",
      strokeWidth: 6,
      fill: BGCOLOR,
    });

    const arrow = new Konva.Line({
      points: [
        sign * RADIUS * 0.15, -RADIUS * 0.4,
        -sign * RADIUS * 0.2, 0,
        sign * RADIUS * 0.15, RADIUS * 0.4,
      ],
      stroke: "black",
      strokeWidth: 6,
      lineCap: "round",
      lineJoin: "round",
    });

    button.add(circle, arrow);
    button.on("mouseenter", () => { document.body.style.cursor = "pointer"; });
    button.on("mouseleave", () => { document.body.style.cursor = "default"; });
    return button;
  }

  /** 
   * To prevent wrapping to next line or going off into void, find largest font
   * size that fits on a single and set it
   */
  private calculateAndSetMaximumTitleFontSize(): void {
    const TITLE_MAX_FONT = 48;
    const TITLE_MIN_FONT = 16;
    const maxWidth = BOX_WIDTH - 2 * PADDING;
    let size = TITLE_MAX_FONT;
    this.titleDisplay.fontSize(size);
    while (this.titleDisplay.getTextWidth() > maxWidth && size > TITLE_MIN_FONT){
      size--;
      this.titleDisplay.fontSize(size)
    }
    this.titleDisplay.x(PADDING + (maxWidth - this.titleDisplay.width()) / 2); //Re-centers title
    this.bodyDisplay.y(this.titleDisplay.y() + this.titleDisplay.height() + 20); // Adds padding between title and body
  }
}