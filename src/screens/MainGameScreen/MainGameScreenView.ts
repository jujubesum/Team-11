import Konva from "konva";
import type { ScreenSwitcher, View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { TopBar } from "../../components/TopBar.ts";
import { Popup, makePopup } from "../../components/popup.ts";
import { TOPBAR_HEIGHT } from "../../constants.ts";

// Spacing constants
const MARGIN = 40;
const PADDING = 40;
const GAP = 30;

// Progress bar constants
const PROGRESS_HEIGHT = 40;
const PROGRESS_GAP = 20;
const PROGRESS_LABEL_WIDTH = 220;
const PROGRESS_ROW_WIDTH = STAGE_WIDTH - 2 * MARGIN;
const PROGRESS_BAR_WIDTH = PROGRESS_ROW_WIDTH - PROGRESS_LABEL_WIDTH - PROGRESS_GAP;
const PROGRESS_BAR_X = PROGRESS_LABEL_WIDTH + PROGRESS_GAP;
const PROGRESS_Y = TOPBAR_HEIGHT + PROGRESS_HEIGHT * 2;

// Panel constants
const PANELS_Y = PROGRESS_Y + PROGRESS_HEIGHT + PADDING;
const PANEL_HEIGHT = STAGE_HEIGHT - PANELS_Y - MARGIN;
const PANEL_COUNT = 3;
const PANEL_WIDTH = (STAGE_WIDTH - 2 * MARGIN - (PANEL_COUNT - 1) * GAP) / PANEL_COUNT;

// Step box constants
const STEPS_START_Y = MARGIN + PADDING * 3;

//Submission Box Constants
const ANSWER_ROW_HEIGHT = 44;
const SUBMIT_HEIGHT = 56;
const SUBMIT_Y = PANEL_HEIGHT - PADDING - SUBMIT_HEIGHT;
const ANSWER_Y = SUBMIT_Y - 24 - ANSWER_ROW_HEIGHT;
const LABEL_WIDTH = 50;
const INPUT_X = PADDING + LABEL_WIDTH + 10;
const INPUT_WIDTH = PANEL_WIDTH - INPUT_X - PADDING;

// Colors
const WHITE = "#FFFFFF"
const GRAY = "#d9d9d9"
const DARKGRAY = "#888888"

export interface MainGameScreenHandlers {
  onHelp: () => void;
  onHome: () => void;
  onNext: () => void;
  onReplay: () => void;
  onRetry: () => void;
  onHint: () => void;
  onSubmit: (answer: string) => void;
}

export class MainGameScreenView implements View {
  private group: Konva.Group;
  private leftPanel: Konva.Group;
  private middlePanel: Konva.Group;
  private rightPanel: Konva.Group;
  private recipeTitle: Konva.Text;
  private stepsGroup: Konva.Group;
  private stepsCheck: Konva.Shape[] = [];
  private progress: Konva.Group;
  private progressFill: Konva.Rect;
  private progressLabel: Konva.Text;
  private inputSlot: Konva.Rect;
  private input: HTMLInputElement;
  private submitButton: Konva.Group;
  private congratsPopup: Popup;
  private incorrectPopup: Popup;
  private activePopup: Popup;


  constructor(handlers: MainGameScreenHandlers){
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
    this.group.add(new TopBar({ title: "Baking", onHome: handlers.onHome, onHelp: handlers.onHelp }).getGroup());
  
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

    // progress bar & label
    this.progress = new Konva.Group({ x: MARGIN, y: PROGRESS_Y });

    this.progressLabel = new Konva.Text({
      width: PROGRESS_LABEL_WIDTH,
      height: PROGRESS_HEIGHT,
      text: "No recipe loaded!",
      fontSize: 24,
      fill: "black",
      align: "left",
      verticalAlign: "middle",
    });

    const track = new Konva.Rect({
      x: PROGRESS_BAR_X,
      width: PROGRESS_BAR_WIDTH,
      height: PROGRESS_HEIGHT,
      fill: DARKGRAY,
      stroke: "black",
      strokeWidth: 2,
      cornerRadius: PROGRESS_HEIGHT / 2,
    });

    this.progressFill = new Konva.Rect({
      x: PROGRESS_BAR_X,
      width: 0,
      height: PROGRESS_HEIGHT,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      cornerRadius: PROGRESS_HEIGHT / 2,
      visible: false,
    });

    this.progress.add(this.progressLabel, track, this.progressFill);
    this.group.add(this.progress);

    // Answer box
    this.rightPanel.add(new Konva.Text({
      x: PADDING, y: ANSWER_Y, width: LABEL_WIDTH, height: ANSWER_ROW_HEIGHT,
      text: "? =", fontSize: 24, fill: "black", verticalAlign: "middle",
    }));
    this.inputSlot = new Konva.Rect({
      x: INPUT_X, y: ANSWER_Y, width: INPUT_WIDTH, height: ANSWER_ROW_HEIGHT,
    });
    this.rightPanel.add(this.inputSlot);

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.inputMode = "numeric";
    Object.assign(this.input.style, {
      position: "absolute", display: "none", boxSizing: "border-box",
      border: "2px solid black", borderRadius: "22px", background: GRAY,
      textAlign: "center", fontSize: "24px", outline: "none",
    });

    // Submission Button
    this.submitButton = this.makeSubmitButton();
    const submit = () => handlers.onSubmit(this.input.value.trim());

    this.makeClickable(this.submitButton, submit);
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    })
    this.rightPanel.add(this.submitButton);

    // The following will all be popup declarations (hidden by default)

    //Correct answer popup
    this.congratsPopup = makePopup({
      message: "Congrats, you were correct!",
      buttons: [
        { label: "Next Question", onClick: () => handlers.onNext() },
        { label: "Replay", onClick: () => handlers.onReplay()},
      ],
    });
    this.group.add(this.congratsPopup.getGroup());

    this.incorrectPopup = makePopup({
      message: "Sorry that's incorrect :(",
      buttons: [
        { label: "Try Again", onClick: () => handlers.onRetry() },
        { label: "View Hint", onClick: () => handlers.onHint() },
      ],
    });
    this.group.add(this.incorrectPopup.getGroup());
  }

  private makePanel(width: number, height: number, x: number, y: number): Konva.Group {
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

  private makeSubmitButton(): Konva.Group {
    const button = new Konva.Group({ x: PADDING, y: SUBMIT_Y });
    button.add(
      new Konva.Rect({
        width: PANEL_WIDTH - 2 * PADDING, height: SUBMIT_HEIGHT,
        fill: DARKGRAY, stroke: "black", strokeWidth: 2, cornerRadius: 16,
      }),
      new Konva.Text({
        width: PANEL_WIDTH - 2 * PADDING, height: SUBMIT_HEIGHT,
        text: "Submit", fontSize: 28, fill: "black",
        align: "center", verticalAlign: "middle", listening: false,
      }),
    );
    return button;
  }

  private makeClickable(node: Konva.Node, fn: () => void): void {
    node.on("click tap", fn);
    node.on("mouseenter", () => { node.getStage()!.container().style.cursor = "pointer"; });
    node.on("mouseleave", () => { node.getStage()!.container().style.cursor = "default"; });
  }

  fillLeftPanel(steps: string[]): void {
    this.stepsGroup.destroyChildren();
    this.stepsCheck = [];

    const BOX_SIZE = 36;
    const ROW_GAP = 20;
    const textWidth = PANEL_WIDTH - 2 * PADDING - BOX_SIZE - 16;
    let y = 0;

    steps.forEach((label) => {
      const text = new Konva.Text({
        x: BOX_SIZE + 16,
        width: textWidth,
        text: label,
        fontSize: 20,
        fill: "black",
      });

      const rowHeight = Math.max(BOX_SIZE, text.height());
      
      const boxGroup = new Konva.Group({ y: (rowHeight - BOX_SIZE) / 2 });
      boxGroup.add(
        new Konva.Rect({
          width: BOX_SIZE, height: BOX_SIZE,
          stroke: "black", strokeWidth: 2, cornerRadius: 6, fill: GRAY,
        }),
      );
      const check = new Konva.Line({
        points: [8, 8, BOX_SIZE - 8, BOX_SIZE - 8, BOX_SIZE / 2, BOX_SIZE / 2,
                BOX_SIZE - 8, 8, 8, BOX_SIZE - 8],
        stroke: "black", strokeWidth: 3, visible: false,
      });
      boxGroup.add(check);

      text.y((rowHeight - text.height()) / 2);

      const row = new Konva.Group({ y });
      row.add(boxGroup, text);
      this.stepsGroup.add(row);
      this.stepsCheck.push(check);

      y += Math.max(BOX_SIZE, text.height()) + ROW_GAP;
    });
    this.group.getLayer()?.batchDraw();
  }

  setStepChecked(index: number, checked: boolean): void {
    this.stepsCheck[index]?.visible(checked);
    this.group.getLayer()?.batchDraw();
  }

  setProgress(done: number, total: number): void {
    this.progressLabel.text(`Progress: ${done}/${total}`);
    this.progressFill.visible(done > 0);
    this.progressFill.width(total > 0 ? (PROGRESS_BAR_WIDTH * done) / total : 0);
    this.group.getLayer()?.batchDraw();
  }

  updateTitle(newTitle: string): void {
    this.recipeTitle.text(`Recipe: ${newTitle}`);
    this.group.getLayer()?.batchDraw();
  }

  clearAnswer(): void { 
    this.input.value = "";
    if (this.input.isConnected) this.input.focus();
  }

  show(): void {
    this.group.show();
    const container = this.group.getStage()?.container();
    if (container){ // Checks if input HTML element exists as part of container, if not adds it
      container.style.position = "relative";
      if (!this.input.parentElement) container.appendChild(this.input);
      const pos = this.inputSlot.getAbsolutePosition();
      Object.assign(this.input.style, {
        left: `${pos.x}px`, top: `${pos.y}px`,
        width: `${INPUT_WIDTH}px`, height: `${ANSWER_ROW_HEIGHT}px`,
        display: "block",
      })
    }
    this.group.getLayer()?.batchDraw();
  }

  hide(): void {
    this.group.hide();
    this.input.style.display = "none";
    this.group.getLayer()?.batchDraw();
  }

  setInputEnabled(enabled: boolean): void {
    this.input.disabled = !enabled;
    this.input.style.filter = enabled ? "none" : "brightness(0.74)";
    if (enabled){
      this.input.focus();
    }
    else {
      this.input.blur();
    }
  }

  showPopup(): void {
    this.setInputEnabled(false);
    this.activePopup.show();
  }

  hidePopup(): void {
    this.activePopup.hide();
    this.setInputEnabled(true);
  }

  setActivePopup(popup: string): void {
    switch (popup) {
      case "congrats":
        this.activePopup = this.congratsPopup;
        break;
      case "incorrect":
        this.activePopup = this.incorrectPopup;
        break;
    }
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}