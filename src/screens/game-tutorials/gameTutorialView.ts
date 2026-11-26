import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPBAR_HEIGHT } from "./../../constants"
import { TopBarNoHelp } from "../../components/TopBarNoHelp.ts";
import { makeCircleButton, setArrowEnabled } from "../../components/CircleButton.ts";

const WHITE = "#FFFFFF"
const HOVERFILL = "#eeeeee"
const MARGIN = 60;
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
const BUTTON_RADIUS = BOX_HEIGHT / 16;

/**
 * GameTutorialView renders the game tutorials using Konva
 */
export class GameTutorialView {
  private group: Konva.Group;
  private titleDisplay: Konva.Text;
  private bodyDisplay: Konva.Text;
  private leftArrow: Konva.Group;
  private rightArrow: Konva.Group;
  private leftPanel: Konva.Group;
  private rightPanel: Konva.Group;
  private tutorialImage: Konva.Image | undefined;
  private imageRequest = 0;

  private onHome?: () => void;
  private onArrowHandler?: (rightShift: boolean) => void;



  constructor(){
    this.group = new Konva.Group({visible: false});
    this.leftPanel = new Konva.Group({x: LEFT_BOX_X, y: BOX_Y});
    this.rightPanel = new Konva.Group({x:RIGHT_BOX_X, y: BOX_Y});

    const topBar = new TopBarNoHelp({
        title: "How to Play",
        onHome: () => this.onHome?.(),
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

    // const placeholder = new Konva.Text({
    //   text: "IMAGE PLACEHOLDER",
    //   fontSize: 64,
    //   width: BOX_WIDTH - 2 * PADDING,
    //   height: BOX_HEIGHT - 2 * PADDING,
    //   fill: "black",
    //   align: "center",
    //   verticalAlign: "middle"
    // });

    this.leftArrow = makeCircleButton("<", LEFT_ARROW_X, LEFT_ARROW_Y, BUTTON_RADIUS, "white", () =>
      this.onArrowHandler?.(false),
    );
    this.rightArrow = makeCircleButton(">", RIGHT_ARROW_X, RIGHT_ARROW_Y, BUTTON_RADIUS, "white", () =>
      this.onArrowHandler?.(true),
    );

    this.leftPanel.add(this.makeBox(), this.titleDisplay, this.bodyDisplay);
    this.rightPanel.add(this.makeBox());

    this.group.add(
      topBar.getGroup(),
      this.leftPanel,
      this.rightPanel,
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
    this.calculateAndSetMaximumBodyFontSize();
    this.calculateAndSetMaximumTitleFontSize();
    this.group.getLayer()?.batchDraw();
  }
  
  onArrowPress(handler: (rightShift: boolean) => void): void {
      this.onArrowHandler = handler;
  }

  onHomePress(handler: () => void): void {
      this.onHome = handler;
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
   * To prevent wrapping to next line or going off into void, find largest font
   * size that fits on a single and set it
   */
  private calculateAndSetMaximumTitleFontSize(): void {
    const TITLE_MAX_FONT = 64;
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

  /** Same as above but for body text */
  private calculateAndSetMaximumBodyFontSize(): void {
    const BODY_MAX_FONT = 48;
    const BODY_MIN_FONT = 16;
    const maxHeight = BOX_HEIGHT - this.bodyDisplay.y() - PADDING;
    let size = BODY_MAX_FONT;
    this.bodyDisplay.fontSize(size);
    while (this.bodyDisplay.height() > maxHeight && size > BODY_MIN_FONT){
      size--;
      this.bodyDisplay.fontSize(size);
    }
  }

  // Dim the arrows when there's no step to go to
  setArrows(canGoBack: boolean, canGoForward: boolean): void {
      setArrowEnabled(this.leftArrow, canGoBack);
      setArrowEnabled(this.rightArrow, canGoForward);
      this.group.getLayer()?.batchDraw();
  }

  setTutorialImage(url: string | undefined): void {
    let imageRequest = 0;
    this.tutorialImage?.destroy();
    this.tutorialImage = undefined;
    this.group.getLayer()?.batchDraw();
    if (!url) return;

    const request = ++this.imageRequest;
    const img = new Image();
    const IMAGE_TOP = 2 * PADDING;
    img.onload = () => {
      if (request !== this.imageRequest) return;
      const maxW = BOX_WIDTH - 2 * PADDING;
      const maxH = BOX_HEIGHT - IMAGE_TOP - PADDING;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      this.tutorialImage = new Konva.Image({
        image: img, width: w, height: h,
        x: (BOX_WIDTH - w) / 2,
        y: IMAGE_TOP + (maxH - h) / 2,
        listening: false,
      });
      this.rightPanel.add(this.tutorialImage);
      this.group.getLayer()?.batchDraw();
    };
    img.onerror = () => console.warn("Could not load tutorial image:", url);
    img.src = url;
  }
}