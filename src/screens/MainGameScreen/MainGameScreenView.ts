import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";

export interface MainGameScreenHandlers {

}



export class MainGameScreenView implements View {
  private group: Konva.Group;

  constructor(handlers: MainGameScreenHandlers){
    this.group = new Konva.Group({ visible: false });

    this.group.add(
          new Konva.Rect({
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#d9d9d9",
          }),
        );
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