import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { makeBackdrop, makeRoundedButton } from "./overlay";
import { title } from "node:process";

const DARKGRAY = "#888888"
const LIGHTGRAY = "#F0EEEE"

export interface PopupButton {
  label: string;
  onClick: () => void;
}

export interface PopupConfig {
  message: string;
  details?: string[];
  buttons: PopupButton[];
  width?: number;
}

export interface Popup {
  getGroup(): Konva.Group;
  show(): void;
  hide(): void;
  setMessage(text: string): void;
  setDetails(lines: string[]): void;
}

export function makePopup({ message, details, buttons, width = STAGE_WIDTH * 0.6}: PopupConfig): Popup{
  const BOX_HEIGHT = 200;
  const BUTTON_HEIGHT = 70;
  const GAP = 30;
  const TOTAL_HEIGHT = BOX_HEIGHT + GAP + BUTTON_HEIGHT;
  const BUTTON_WIDTH = (width - (buttons.length - 1) * GAP) / buttons.length;
  const TITLE_SIZE = 40;
  const DETAIL_SIZE = 26;
  const BOX_PADDING = 24;

  const group = new Konva.Group({ visible: false });

  group.add(makeBackdrop());

  const panel = new Konva.Group({
    x: (STAGE_WIDTH - width) / 2,
    y: (STAGE_HEIGHT - TOTAL_HEIGHT) / 2,
  });
  group.add(panel);

  const titleText = new Konva.Text({
    x: 0, y: BOX_PADDING, width, text: message, fontSize: TITLE_SIZE,
    fill: "black", align: "center", listening: false,
  });

  const detailsText = new Konva.Text({
    x: 0, width, text: (details ?? []).join("\n"), fontSize: DETAIL_SIZE, 
    fill: "black", lineHeight: 1.4, align: "center", listening: false,
  });

  const layoutBox = () => {
    const hasDetails = detailsText.text().length > 0;
    detailsText.visible(hasDetails);
    if (hasDetails) {
      titleText.y(BOX_PADDING);
      detailsText.y(BOX_PADDING + titleText.height() + 20);
    }
    else {
      titleText.y((BOX_HEIGHT - titleText.height()) / 2);
    }
  }

  panel.add(
    new Konva.Rect({ width, height: BOX_HEIGHT, fill: "white", stroke: "black", strokeWidth: 2, cornerRadius: 24}),
    titleText, detailsText,
  );
  layoutBox();
  buttons.forEach(({ label, onClick }, i) => {
    const button = makeRoundedButton(label, BUTTON_WIDTH, BUTTON_HEIGHT, onClick);
    button.position({ x: i * (BUTTON_WIDTH + GAP), y: BOX_HEIGHT + GAP});
    panel.add(button);
  });

  const redraw = () => group.getLayer()?.batchDraw();

  return {
    getGroup: () => group,
    show() { group.moveToTop(); group.show(); redraw(); },
    hide() { group.hide(); redraw();},
    setMessage(text) { titleText.text(text); layoutBox(); redraw();},
    setDetails(lines){ detailsText.text(lines.join("\n")); layoutBox(); redraw();}
  }
}