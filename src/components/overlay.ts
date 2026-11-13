import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { addPointerCursor } from "./CircleButton";

const DARKGRAY = "#888888";
const LIGHTGRAY = "#F0EEEE";
const BACKDROP_OPACITY = 0.7;

export function makeBackdrop(): Konva.Rect {
  return new Konva.Rect({ width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: DARKGRAY, opacity: BACKDROP_OPACITY});
}

export function makeRoundedButton(label: string, width: number, height: number, onClick: () => void): Konva.Group {
  const button = new Konva.Group();
  button.add(
    new Konva.Rect({
      width, height, fill: LIGHTGRAY,
      stroke: "black", strokeWidth: 2, cornerRadius: height / 3,
    }),
    new Konva.Text({
      width, height, text: label, fontSize: height * 0.4, fill: "black", align: "center", verticalAlign: "middle", listening: false,
    }),
  );
  button.on("click tap", onClick);
  addPointerCursor(button);
  return button;
}