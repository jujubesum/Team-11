import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { makeBackdrop, makeRoundedButton } from "./overlay";

const DARKGRAY = "#888888"
const LIGHTGRAY = "#F0EEEE"

export interface HintConfig {
  hint: string;
  title?: string // if none is provided, defaults to hint
  onDone: () => void;
  width?: number;
}

export interface HintPopup {
  getGroup(): Konva.Group;
  show(): void;
  hide(): void;
  setHint(text: string): void;
}

export function makeHintPopup({ hint, title = "Hint", onDone, width = STAGE_WIDTH * 0.6}: HintConfig): HintPopup {
  const HEIGHT = STAGE_HEIGHT * 1 / 2;
  const PADDING = 30;
  const TITLE_SIZE = 44;
  const HINT_SIZE = 30;
  const BUTTON_WIDTH = 160;
  const BUTTON_HEIGHT = 50;

  const group = new Konva.Group({ visible: false });
  group.add(makeBackdrop());

  const panel = new Konva.Group({
    x: (STAGE_WIDTH - width) / 2,
    y: (STAGE_HEIGHT - HEIGHT) / 2,
  });
  group.add(panel);

  const titleText = new Konva.Text({
    y: PADDING, width, text: title, fontSize: TITLE_SIZE,
    fill: "black", align: "center", listening: false,
  });

  const buttonY = HEIGHT - PADDING - BUTTON_HEIGHT;
  const hintTop = PADDING + titleText.height() + 10;
  const hintText = new Konva.Text({
    x: PADDING, y: hintTop, width: width - 2 * PADDING,
    height: buttonY - hintTop - 10, text: hint,
    fontSize: HINT_SIZE, fill: "black",
    align: "center", verticalAlign: "middle", listening: false
  });

  const redraw = () => group.getLayer()?.batchDraw();
  const hide = () => { group.hide(); redraw(); };

  const done = makeRoundedButton("Done", BUTTON_WIDTH, BUTTON_HEIGHT, () => {
    hide();
    onDone(); // for the most part this won't be needed
  });
  done.position({ x: (width - BUTTON_WIDTH) / 2, y: buttonY});

  panel.add(
    new Konva.Rect({
      width, height: HEIGHT, fill: "white",
      stroke: "black", strokeWidth: 2, cornerRadius: 40,
    }),
    titleText, hintText, done,
  );

  return {
    getGroup: () => group,
    show() { group.moveToTop(); group.show(); redraw();},
    hide,
    setHint(text) { hintText.text(text); redraw(); },
  };
}