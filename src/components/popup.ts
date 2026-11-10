import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { addPointerCursor } from "./CircleButton";

const DARKGRAY = "#888888"
const LIGHTGRAY = "#F0EEEE"

export interface PopupButton {
  label: string;
  onClick: () => void;
}

export interface PopupConfig {
  message: string;
  buttons: PopupButton[];
  width?: number;
}

export interface Popup {
  getGroup(): Konva.Group;
  show(): void;
  hide(): void;
  setMessage(text: string): void;
}

export function makePopup({ message, buttons, width = STAGE_WIDTH * 0.6}: PopupConfig): Popup{
  const BOX_HEIGHT = 200;
  const BUTTON_HEIGHT = 70;
  const GAP = 30;
  const totalHeight = BOX_HEIGHT + GAP + BUTTON_HEIGHT;
  const buttonWidth = (width - (buttons.length - 1) * GAP) / buttons.length;

  const group = new Konva.Group({ visible: false });

  group.add(new Konva.Rect({ width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: DARKGRAY, opacity: 0.7}))

  const panel = new Konva.Group({
    x: (STAGE_WIDTH - width) / 2,
    y: (STAGE_HEIGHT - totalHeight) / 2,
  });
  group.add(panel);

  const messageText = new Konva.Text({
    width,
    height: BOX_HEIGHT,
    text: message,
    fontSize: 40,
    fill: "black",
    align: "center",
    verticalAlign: "middle",
    listening: false,
  });
  panel.add(
    new Konva.Rect({ width, height: BOX_HEIGHT, fill: "white", stroke: "black", strokeWidth: 2, cornerRadius: 24}),
    messageText,
  );

  buttons.forEach(({ label, onClick }, i) => {
    const button = new Konva.Group({ x: i * (buttonWidth + GAP), y: BOX_HEIGHT + GAP});
    button.add(
      new Konva.Rect({
        width: buttonWidth, height: BUTTON_HEIGHT, fill: LIGHTGRAY,
        stroke: "black", strokeWidth: 2, cornerRadius: 20,
      }),
      new Konva.Text({
        width: buttonWidth, height: BUTTON_HEIGHT, text: label, fontSize: 28,
        align: "center", verticalAlign: "middle", listening: false,
      }),
    );
    button.on("click tap", onClick);
    addPointerCursor(button);
    panel.add(button);
  });

  const redraw = () => group.getLayer()?.batchDraw();

  return {
    getGroup: () => group,
    show() { group.moveToTop(); group.show(); redraw(); },
    hide() { group.hide(); redraw();},
    setMessage(text) { messageText.text(text); redraw();}
  }
}