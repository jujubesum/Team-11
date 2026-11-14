import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPBAR_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { getMathTutorial, type MathOperation } from "../../mathTutorials.ts";

const HEADERCOLOR = "#989898";
const BGCOLOR = "#D9D9D9";
const WHITE = "#FFFFFF";
const SELECTED_FILL = "#BDBDBD";
const MARGIN = 50;
const GAP = 60;
const PADDING = 20;
const BOX_WIDTH = (STAGE_WIDTH - 2 * MARGIN - GAP) / 2;
const BOX_HEIGHT = ((STAGE_HEIGHT - TOPBAR_HEIGHT) * 3) / 4;
const BOX_Y = TOPBAR_HEIGHT + MARGIN;
const LEFT_BOX_X = MARGIN;
const RIGHT_BOX_X = MARGIN + BOX_WIDTH + GAP;
const NAV_BUTTON_WIDTH = 180;
const NAV_BUTTON_HEIGHT = 55;
const NAV_BUTTON_Y =
    BOX_Y + BOX_HEIGHT + Math.max(10, (STAGE_HEIGHT - BOX_Y - BOX_HEIGHT - NAV_BUTTON_HEIGHT) / 2);
const BACK_BUTTON_WIDTH = 120;
const BACK_BUTTON_HEIGHT = 50;
const OPERATIONS_HEADER_HEIGHT = 60;
const OPERATION_BUTTON_GAP = 12;

export interface MathTutorialContent {
    operation: MathOperation;
    title: string;
    step: string;
    stepNumber: number;
    totalSteps: number;
    canGoBack: boolean;
    canGoForward: boolean;
}

// Renders the Math Tutorials screen: current step on the left, operation picker on the right
export class MathTutorialView implements View {
    private group: Konva.Group;
    private operations: MathOperation[];
    private titleDisplay: Konva.Text;
    private stepCounterDisplay: Konva.Text;
    private stepDisplay: Konva.Text;
    private operationButtonsGroup: Konva.Group;
    private previousButton: Button;
    private nextButton: Button;

    private onArrowPressHandler?: (rightShift: boolean) => void;
    private onOperationSelectHandler?: (operation: MathOperation) => void;
    private onBackPressHandler?: () => void;

    constructor(operations: MathOperation[]) {
        this.operations = operations;
        this.group = new Konva.Group({ visible: false });
        const leftPanel = new Konva.Group({ x: LEFT_BOX_X, y: BOX_Y });
        const rightPanel = new Konva.Group({ x: RIGHT_BOX_X, y: BOX_Y });

        const bg = new Konva.Rect({
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
            text: "Math Tutorials",
            fontSize: 56,
            fill: "black",
            align: "center",
            verticalAlign: "middle",
            listening: false,
        });

        const backButton = new Button({
            x: MARGIN / 2,
            y: (TOPBAR_HEIGHT - BACK_BUTTON_HEIGHT) / 2,
            width: BACK_BUTTON_WIDTH,
            height: BACK_BUTTON_HEIGHT,
            label: "Back",
            onClick: () => this.onBackPressHandler?.(),
        });

        this.titleDisplay = new Konva.Text({
            x: PADDING,
            y: PADDING,
            width: BOX_WIDTH - 2 * PADDING,
            text: "",
            fontSize: 40,
            fontStyle: "bold",
            fill: "black",
            align: "center",
        });

        this.stepCounterDisplay = new Konva.Text({
            x: PADDING,
            y: PADDING + 60,
            width: BOX_WIDTH - 2 * PADDING,
            text: "",
            fontSize: 26,
            fill: "#333333",
            align: "center",
        });

        this.stepDisplay = new Konva.Text({
            x: PADDING,
            y: PADDING + 120,
            width: BOX_WIDTH - 2 * PADDING,
            text: "",
            fontSize: 32,
            lineHeight: 1.4,
            fill: "black",
            align: "center",
        });

        const operationsHeader = new Konva.Text({
            x: PADDING,
            y: PADDING,
            width: BOX_WIDTH - 2 * PADDING,
            text: "Choose a Math Operation:",
            fontSize: 26,
            fontStyle: "bold",
            fill: "black",
            align: "center",
        });

        this.operationButtonsGroup = new Konva.Group({
            x: PADDING,
            y: PADDING + OPERATIONS_HEADER_HEIGHT,
        });

        this.previousButton = new Button({
            x: LEFT_BOX_X,
            y: NAV_BUTTON_Y,
            width: NAV_BUTTON_WIDTH,
            height: NAV_BUTTON_HEIGHT,
            label: "Previous",
            onClick: () => this.onArrowPressHandler?.(false),
        });

        this.nextButton = new Button({
            x: LEFT_BOX_X + BOX_WIDTH - NAV_BUTTON_WIDTH,
            y: NAV_BUTTON_Y,
            width: NAV_BUTTON_WIDTH,
            height: NAV_BUTTON_HEIGHT,
            label: "Next",
            onClick: () => this.onArrowPressHandler?.(true),
        });

        leftPanel.add(this.makeBox(), this.titleDisplay, this.stepCounterDisplay, this.stepDisplay);
        rightPanel.add(this.makeBox(), operationsHeader, this.operationButtonsGroup);

        this.group.add(
            bg,
            topBar,
            headerText,
            backButton.getGroup(),
            leftPanel,
            rightPanel,
            this.previousButton.getGroup(),
            this.nextButton.getGroup(),
        );
    }

    getGroup(): Konva.Group {
        return this.group;
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.batchDraw();
    }

    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.batchDraw();
    }

    setTutorialContent(content: MathTutorialContent): void {
        this.titleDisplay.text(`Operation: ${content.title}`);
        this.stepCounterDisplay.text(`Step ${content.stepNumber} of ${content.totalSteps}`);
        this.stepDisplay.text(content.step);
        this.previousButton.setEnabled(content.canGoBack);
        this.nextButton.setEnabled(content.canGoForward);
        this.renderOperationButtons(content.operation);

        this.group.getLayer()?.batchDraw();
    }

    onArrowPress(handler: (rightShift: boolean) => void): void {
        this.onArrowPressHandler = handler;
    }

    onOperationSelect(handler: (operation: MathOperation) => void): void {
        this.onOperationSelectHandler = handler;
    }

    onBackPress(handler: () => void): void {
        this.onBackPressHandler = handler;
    }

    // Rebuild the operation buttons so the selected one is highlighted
    private renderOperationButtons(selected: MathOperation): void {
        this.operationButtonsGroup.destroyChildren();

        const count = this.operations.length;
        const available =
            BOX_HEIGHT - 2 * PADDING - OPERATIONS_HEADER_HEIGHT - (count - 1) * OPERATION_BUTTON_GAP;
        const btnHeight = Math.min(60, Math.max(30, available / Math.max(count, 1)));
        const btnWidth = BOX_WIDTH - 2 * PADDING;

        this.operations.forEach((operation, idx) => {
            const isSelected = operation === selected;
            const btn = new Button({
                x: 0,
                y: idx * (btnHeight + OPERATION_BUTTON_GAP),
                width: btnWidth,
                height: btnHeight,
                label: getMathTutorial(operation).title,
                fontSize: Math.min(28, Math.round(btnHeight * 0.5)),
                fill: isSelected ? SELECTED_FILL : WHITE,
                hoverFill: isSelected ? SELECTED_FILL : "#eeeeee",
                onClick: () => this.onOperationSelectHandler?.(operation),
            });
            this.operationButtonsGroup.add(btn.getGroup());
        });
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
