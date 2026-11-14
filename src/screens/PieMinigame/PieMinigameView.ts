import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPBAR_HEIGHT } from "../../constants.ts";

// Color constants
const HEADERCOLOR = "#989898";
const BGCOLOR = "#D9D9D9";
const GREEN = "#2e9e4f";
const RED = "#d03b3b";

export class PieMinigameView {
  private group: Konva.Group;

  // Stats (top bar)
  private timerText: Konva.Text;
  private scoreText: Konva.Text;

  // Question screen
  private questionGroup: Konva.Group;
  private fractionText: Konva.Text;
  private pieSlots: Konva.Image[] = [];

  // Summary screen
  private summaryGroup: Konva.Group;
  private summaryScore: Konva.Text;
  private doneButtonText: Konva.Text;

  //Pie images and callbacks
  private images = new Map<string, HTMLImageElement>();
  private onPick: ((index: number) => void) | null = null;
  private onDone: (() => void) | null = null;
  
  constructor() {
    this.group = new Konva.Group({ visible: false });
    
    // background
    const bg = new Konva.Rect({
        x: 0,
        y: 0,
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
        text: "Pie Fractions!",
        fontSize: 56,
        fill: "black",
        align: "center",
        verticalAlign: "middle",
    });

    //Countdown timer text which is updated by setTimer
    this.timerText = new Konva.Text({
        x: 30,
        width: 300,
        height: TOPBAR_HEIGHT,
        text: "Time: 30",
        fontSize: 36,
        fill: "black",
        verticalAlign: "middle",
    });

    //Score which is updated by setScore
    this.scoreText = new Konva.Text({
        x: STAGE_WIDTH - 330,
        width: 300,
        height: TOPBAR_HEIGHT,
        text: "Score: 0",
        fontSize: 36,
        fill: "black",
        align: "right",
        verticalAlign: "middle",
    });

    //Question group
    this.questionGroup = new Konva.Group();

    const instructions = new Konva.Text({
        width: STAGE_WIDTH,
        height: TOPBAR_HEIGHT + 170,
        text: "Choose the pie that corresponds with the fraction",
        fontSize: 35,
        fill: "black",
        align: "center",
        verticalAlign: "middle",
    });

    const gameText = new Konva.Text({
        width: STAGE_WIDTH,
        height: TOPBAR_HEIGHT + 350,
        text: "What pie has",
        fontSize: 35,
        fill: "black",
        align: "center",
        verticalAlign: "middle",
    });

   
    this.fractionText = new Konva.Text({
        x: 0,
        y: TOPBAR_HEIGHT / 2 + 215,
        width: STAGE_WIDTH,

        //placeholder
        text: "3/4",

        fontSize: 60,
        fontStyle: "bold",
        fill: "black",
        align: "center",
    });

    //constants for the slots
    const SLOT_COUNT = 4;
    const SLOT_SIZE = 220;
    const SLOT_Y = TOPBAR_HEIGHT / 2 + 325;
    const gap = (STAGE_WIDTH - SLOT_COUNT * SLOT_SIZE) / (SLOT_COUNT + 1);

    //create the 4 slots
    for (let i = 0; i < SLOT_COUNT; i++) {
        const pieSlot = new Konva.Image({
            image: undefined,
            x: gap + i * (SLOT_SIZE + gap),
            y: SLOT_Y,
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            stroke: "transparent",
            strokeWidth: 8,
        });
        pieSlot.on("click tap", () => this.onPick?.(i));
        //Turns the cursor into a pointer when it's on the slot
        pieSlot.on("mouseenter", () => (document.body.style.cursor = "pointer"));
        pieSlot.on("mouseleave", () => (document.body.style.cursor = "default"));
        this.pieSlots.push(pieSlot);
    }
    
    this.questionGroup.add(instructions, gameText, this.fractionText, ...this.pieSlots);

    //Summary group
    this.summaryGroup = new Konva.Group({ visible: false });

    const summaryTitle = new Konva.Text({
        x: 0,
        y: TOPBAR_HEIGHT + 100,
        width: STAGE_WIDTH,
        text: "Time's up!",
        fontSize: 64,
        fontStyle: "bold",
        fill: "black",
        align: "center",
    });

    this.summaryScore = new Konva.Text({
        x: 0,
        y: TOPBAR_HEIGHT + 220,
        width: STAGE_WIDTH,
        text: "",
        fontSize: 48,
        fill: "black",
        align: "center",
    });

    const BUTTON_W = 320;
    const BUTTON_H = 70;

    const doneButton = new Konva.Group({
        x: (STAGE_WIDTH - BUTTON_W) / 2,
        y: STAGE_HEIGHT - BUTTON_H - 60,
    });

    const buttonRect = new Konva.Rect({
        width: BUTTON_W,
        height: BUTTON_H,
        fill: HEADERCOLOR,
        stroke: "black",
        strokeWidth: 3,
        cornerRadius: 12,
    });

    this.doneButtonText = new Konva.Text({
        width: BUTTON_W,
        height: BUTTON_H,
        text: "Back to home",
        fontSize: 30,
        fill: "black",
        align: "center",
        verticalAlign: "middle",
    });

    doneButton.add(buttonRect, this.doneButtonText);
    doneButton.on("click tap", () => this.onDone?.());
    //Turns the cursor into a pointer
    doneButton.on("mouseenter", () => (document.body.style.cursor = "pointer"));
    doneButton.on("mouseleave", () => (document.body.style.cursor = "default"));

    this.summaryGroup.add(summaryTitle, this.summaryScore, doneButton);

    //Background
    this.group.add(
        bg,
        topBar,
        headerText,
        this.timerText,
        this.scoreText,
        this.questionGroup,
        this.summaryGroup
    );
  }

  // Load each pie image once
  preloadImages(fractions: string[]): void {
    fractions.forEach((f) => {
        const img = new Image();
        img.onload = () => this.group.getLayer()?.draw();
        img.onerror = () => console.error("Could not load pie image for", f);
        img.src = `/images/pies/${f.replace("/", "-")}.png`;
        this.images.set(f, img);
    });
  }

  setTime(seconds: number): void {
    this.timerText.text(`Time: ${seconds}`);
    this.timerText.fill(seconds <= 5 ? RED : "black");
    this.group.getLayer()?.draw();
  }

  setScore(score: number): void {
    this.scoreText.text(`Score: ${score}`);
    this.group.getLayer()?.draw();
  }

  // will decide what question to show
  showQuestion(target: string, choices: string[], onPick: (index: number) => void): void {
    this.onPick = onPick;
    this.fractionText.text(target);
    choices.forEach((f, i) => {
        const pieSlot = this.pieSlots[i];
        if (!pieSlot) return;
        pieSlot.image(this.images.get(f));
        pieSlot.stroke("transparent");
    });

    this.summaryGroup.visible(false);
    this.questionGroup.visible(true);
    this.group.getLayer()?.draw();
  }

  // Briefly outline the clicked pie green (right) or red (wrong)
  flashChoice(index: number, correct: boolean): void {
    const pieSlot = this.pieSlots[index];
    if (!pieSlot) return;
    pieSlot.stroke(correct ? GREEN : RED);
    this.group.getLayer()?.draw();
  }

  //Summary
  showSummary(score: number, buttonLabel: string, onDone: () => void): void {
    this.onDone = onDone;
    this.doneButtonText.text(buttonLabel);
    this.summaryScore.text(`You got ${score} right!`);

    this.questionGroup.visible(false);
    this.summaryGroup.visible(true);
    document.body.style.cursor = "default";
    this.group.getLayer()?.draw();
  }

  getGroup() { return this.group; }
  show() { this.group.visible(true); this.group.getLayer()?.draw(); }
  hide() { this.group.visible(false); this.group.getLayer()?.draw(); }
}