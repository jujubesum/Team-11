import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT, TOPBAR_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import type { MathOperation } from "../../mathTutorials.ts";
import type { RecipeSkillStatus } from "../../tutorialManager.ts";
import { TopBar } from "../../components/TopBar.ts";
import { makeCircleButton, setArrowEnabled } from "../../components/CircleButton.ts";

const BGCOLOR = "#D9D9D9";
const WHITE = "#FFFFFF";
const MARGIN = 50;
const GAP = 60;
const BOX_WIDTH = (STAGE_WIDTH - 2 * MARGIN - GAP) / 2;
const BOX_HEIGHT = ((STAGE_HEIGHT - TOPBAR_HEIGHT) * 3) / 4;
const BOX_Y = TOPBAR_HEIGHT + MARGIN;
const LEFT_BOX_X = MARGIN;
const RIGHT_BOX_X = MARGIN + BOX_WIDTH + GAP;
const PADDING = 20;
const LEFT_ARROW_X = MARGIN + PADDING;
const LEFT_ARROW_Y = STAGE_HEIGHT - MARGIN - PADDING + 10;
const RIGHT_ARROW_X = STAGE_WIDTH - MARGIN - PADDING - 10 + PADDING;
const RIGHT_ARROW_Y = STAGE_HEIGHT - MARGIN - PADDING + 10;
const BUTTON_RADIUS = BOX_HEIGHT / 16;

export class RecipeTutorialView implements View {
    private group: Konva.Group;
    private titleDisplay: Konva.Text;
    private bodyDisplay: Konva.Text;
    private skillsHeaderDisplay: Konva.Text;
    private practiceDisplay: Konva.Text;
    private skillButtonsGroup: Konva.Group;
    private leftArrow: Konva.Group;
    private rightArrow: Konva.Group;

    private onSkillSelectHandler?: (operation: MathOperation) => void;
    private onRecipeChangeHandler?: (next: boolean) => void;
    private onBackToRecipeStepsHandler?: () => void;
    private onHome?: () => void;
    private onHelp?: () => void;
    private onArrowHandler?: (rightShift: boolean) => void;

    constructor() {
        this.group = new Konva.Group({ visible: false });
        const leftPanel = new Konva.Group({ x: LEFT_BOX_X, y: BOX_Y });
        const rightPanel = new Konva.Group({ x: RIGHT_BOX_X, y: BOX_Y });

        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: BGCOLOR,
        });

        const topBar = new TopBar({
            title: "Recipe Tutorials",
            onHome: () => this.onHome?.(),
            onHelp: () => this.onHelp?.(),
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

        this.bodyDisplay = new Konva.Text({
            x: PADDING,
            y: PADDING + 60,
            width: BOX_WIDTH - 2 * PADDING,
            text: "",
            fontSize: 28,
            lineHeight: 1.4,
            fill: "black",
            align: "center",
        });

        this.practiceDisplay = new Konva.Text({
            x: PADDING,
            y: BOX_HEIGHT - 140,
            width: BOX_WIDTH - 2 * PADDING,
            text: "",
            fontSize: 22,
            lineHeight: 1.3,
            fill: "#333333",
            align: "center",
        });

        this.skillsHeaderDisplay = new Konva.Text({
            x: PADDING,
            y: PADDING,
            width: BOX_WIDTH - 2 * PADDING,
            text: "Tested Math Skills (Click to Learn):",
            fontSize: 26,
            fontStyle: "bold",
            fill: "black",
            align: "center",
        });

        this.skillButtonsGroup = new Konva.Group({
            x: PADDING,
            y: PADDING + 45,
        });

        const prevRecipeBtn = new Button({
            x: PADDING,
            y: BOX_HEIGHT - 75,
            width: (BOX_WIDTH - 3 * PADDING) / 2,
            height: 55,
            label: "Prev Recipe",
            onClick: () => this.onRecipeChangeHandler?.(false),
        });

        const nextRecipeBtn = new Button({
            x: PADDING * 2 + (BOX_WIDTH - 3 * PADDING) / 2,
            y: BOX_HEIGHT - 75,
            width: (BOX_WIDTH - 3 * PADDING) / 2,
            height: 55,
            label: "Next Recipe",
            onClick: () => this.onRecipeChangeHandler?.(true),
        });

        this.leftArrow = makeCircleButton("<", LEFT_ARROW_X, LEFT_ARROW_Y, BUTTON_RADIUS, "white", () =>
            this.onArrowHandler?.(false),
        );
        this.rightArrow = makeCircleButton(">", RIGHT_ARROW_X, RIGHT_ARROW_Y, BUTTON_RADIUS, "white", () =>
            this.onArrowHandler?.(true),
        );

        leftPanel.add(
            this.makeBox(),
            this.titleDisplay,
            this.bodyDisplay,
            this.practiceDisplay,
        );
        rightPanel.add(
            this.makeBox(),
            this.skillsHeaderDisplay,
            this.skillButtonsGroup,
            prevRecipeBtn.getGroup(),
            nextRecipeBtn.getGroup(),
        );

        this.group.add(
            bg,
            topBar.getGroup(),
            leftPanel,
            rightPanel,
            this.leftArrow,
            this.rightArrow,
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

    setTutorialContent(params: {
        title: string;
        body: string;
        practiceText: string;
        skills: RecipeSkillStatus[];
        isSkillMode: boolean;
    }): void {
        this.titleDisplay.text(params.title);
        this.bodyDisplay.text(params.body);
        this.practiceDisplay.text(params.practiceText);

        this.skillButtonsGroup.destroyChildren();
        const btnWidth = BOX_WIDTH - 2 * PADDING;
        const btnHeight = 52;
        const btnGap = 12;

        params.skills.forEach((skill, idx) => {
            const statusMark = skill.learned ? "[✓] Learned" : "[ ] Not Learned";
            const label = `${skill.operation.toUpperCase()}  ${statusMark}`;
            const btn = new Button({
                x: 0,
                y: idx * (btnHeight + btnGap),
                width: btnWidth,
                height: btnHeight,
                label,
                onClick: () => this.onSkillSelectHandler?.(skill.operation),
            });
            this.skillButtonsGroup.add(btn.getGroup());
        });

        if (params.isSkillMode) {
            const returnBtn = new Button({
                x: 0,
                y: params.skills.length * (btnHeight + btnGap) + 10,
                width: btnWidth,
                height: 50,
                label: "Back to Recipe Steps",
                onClick: () => this.onBackToRecipeStepsHandler?.(),
            });
            this.skillButtonsGroup.add(returnBtn.getGroup());
        }

        this.group.getLayer()?.batchDraw();
    }

    onArrowPress(handler: (rightShift: boolean) => void): void {
        this.onArrowHandler = handler;
    }

    onHomePress(handler: () => void): void {
        this.onHome = handler;
    }

    onHelpPress(handler: () => void): void {
        this.onHelp = handler;
    }

    onSkillSelect(handler: (operation: MathOperation) => void): void {
        this.onSkillSelectHandler = handler;
    }

    onRecipeChange(handler: (next: boolean) => void): void {
        this.onRecipeChangeHandler = handler;
    }

    onBackToRecipeSteps(handler: () => void): void {
        this.onBackToRecipeStepsHandler = handler;
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

    // Dim the arrows when there's no step to go to
    setArrows(canGoBack: boolean, canGoForward: boolean): void {
        setArrowEnabled(this.leftArrow, canGoBack);
        setArrowEnabled(this.rightArrow, canGoForward);
        this.group.getLayer()?.batchDraw();
    }

}