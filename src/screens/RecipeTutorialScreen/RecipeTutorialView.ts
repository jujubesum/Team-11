import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import { TopBarNoHelp, TOP_BAR_HEIGHT } from "../../components/TopBarNoHelp.ts";
import { getRecipeTutorial, RECIPE_IDS, type RecipeId } from "../../recipeTutorials.ts";

const WHITE = "#FFFFFF";
const SELECTED_FILL = "#BDBDBD";
const LOCKED_FILL = "#D6D6D6";
const MARGIN = 50;
const GAP = 60;
const PADDING = 20;
const BOX_WIDTH = (STAGE_WIDTH - 2 * MARGIN - GAP) / 2;
const BOX_HEIGHT = ((STAGE_HEIGHT - TOP_BAR_HEIGHT) * 3) / 4;
const BOX_Y = TOP_BAR_HEIGHT + MARGIN;
const LEFT_BOX_X = MARGIN;
const RIGHT_BOX_X = MARGIN + BOX_WIDTH + GAP;
const NAV_BUTTON_WIDTH = 180;
const NAV_BUTTON_HEIGHT = 55;
const NAV_BUTTON_Y =
    BOX_Y + BOX_HEIGHT + Math.max(10, (STAGE_HEIGHT - BOX_Y - BOX_HEIGHT - NAV_BUTTON_HEIGHT) / 2);
const RECIPES_HEADER_HEIGHT = 60;
const RECIPE_BUTTON_GAP = 12;
const POPUP_WIDTH = 560;
const POPUP_HEIGHT = 76;

export interface RecipeTutorialContent {
    recipeId: RecipeId;
    title: string;
    step: string;
    stepNumber: number;
    totalSteps: number;
    canGoBack: boolean;
    canGoForward: boolean;
}

export class RecipeTutorialView implements View {
    private group: Konva.Group;
    private allRecipes: RecipeId[];
    private unlockedRecipes: Set<RecipeId>;
    private titleDisplay: Konva.Text;
    private stepCounterDisplay: Konva.Text;
    private stepDisplay: Konva.Text;
    private recipeButtonsGroup: Konva.Group;
    private previousButton: Button;
    private nextButton: Button;
    private lockedPopupGroup: Konva.Group;
    private lockedPopupText: Konva.Text;
    private popupTimeoutId: number | null = null;

    private onArrowPressHandler?: (rightShift: boolean) => void;
    private onRecipeSelectHandler?: (recipeId: RecipeId) => void;
    private onBackPressHandler?: () => void;
    private onShowHandler?: () => void;

    constructor(unlockedRecipes: RecipeId[] = [], allRecipes: RecipeId[] = [...RECIPE_IDS]) {
        this.allRecipes = allRecipes;
        this.unlockedRecipes = new Set(unlockedRecipes);
        this.group = new Konva.Group({ visible: false });
        const leftPanel = new Konva.Group({ x: LEFT_BOX_X, y: BOX_Y });
        const rightPanel = new Konva.Group({ x: RIGHT_BOX_X, y: BOX_Y });

        const topBar = new TopBarNoHelp({
            title: "Recipe Tutorials",
            onHome: () => this.onBackPressHandler?.(),
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

        const recipesHeader = new Konva.Text({
            x: PADDING,
            y: PADDING,
            width: BOX_WIDTH - 2 * PADDING,
            text: "Choose a Recipe:",
            fontSize: 26,
            fontStyle: "bold",
            fill: "black",
            align: "center",
        });

        this.recipeButtonsGroup = new Konva.Group({
            x: PADDING,
            y: PADDING + RECIPES_HEADER_HEIGHT,
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

        this.lockedPopupGroup = new Konva.Group({
            x: (STAGE_WIDTH - POPUP_WIDTH) / 2,
            y: STAGE_HEIGHT - POPUP_HEIGHT - 24,
            visible: false,
            listening: false,
        });

        const popupBackground = new Konva.Rect({
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            fill: "#222222",
            opacity: 0.92,
            cornerRadius: 12,
            stroke: "#FFFFFF",
            strokeWidth: 2,
        });

        this.lockedPopupText = new Konva.Text({
            x: 16,
            y: 0,
            width: POPUP_WIDTH - 32,
            height: POPUP_HEIGHT,
            text: "",
            fontSize: 22,
            fontStyle: "bold",
            fill: WHITE,
            align: "center",
            verticalAlign: "middle",
        });

        this.lockedPopupGroup.add(popupBackground, this.lockedPopupText);

        leftPanel.add(this.makeBox(), this.titleDisplay, this.stepCounterDisplay, this.stepDisplay);
        rightPanel.add(this.makeBox(), recipesHeader, this.recipeButtonsGroup);

        this.group.add(
            topBar.getGroup(),
            leftPanel,
            rightPanel,
            this.previousButton.getGroup(),
            this.nextButton.getGroup(),
            this.lockedPopupGroup,
        );

        this.renderRecipeButtons(unlockedRecipes[0]);
    }

    getGroup(): Konva.Group {
        return this.group;
    }

    show(): void {
        this.onShowHandler?.();
        this.group.visible(true);
        this.group.getLayer()?.batchDraw();
    }

    hide(): void {
        this.clearLockedPopup();
        this.group.visible(false);
        this.group.getLayer()?.batchDraw();
    }

    setUnlockedRecipes(unlockedRecipes: RecipeId[], selectedRecipeId?: RecipeId): void {
        this.unlockedRecipes = new Set(unlockedRecipes);
        this.renderRecipeButtons(selectedRecipeId ?? unlockedRecipes[0]);
        this.group.getLayer()?.batchDraw();
    }

    setTutorialContent(content: RecipeTutorialContent): void {
        this.titleDisplay.text(`Recipe: ${content.title}`);
        this.stepCounterDisplay.text(`Step ${content.stepNumber} of ${content.totalSteps}`);
        this.stepDisplay.text(content.step);
        this.previousButton.setEnabled(content.canGoBack);
        this.nextButton.setEnabled(content.canGoForward);
        this.renderRecipeButtons(content.recipeId);

        this.group.getLayer()?.batchDraw();
    }

    showLockedPopup(recipeTitle: string, durationMs = 5000): void {
        if (this.popupTimeoutId !== null) {
            window.clearTimeout(this.popupTimeoutId);
        }

        this.lockedPopupText.text(`Unlock "${recipeTitle}" to see its steps!` + '\n' + 'Recipes are unlocked every 2 orders completed!');
        this.lockedPopupGroup.visible(true);
        this.lockedPopupGroup.moveToTop();
        this.group.getLayer()?.batchDraw();

        this.popupTimeoutId = window.setTimeout(() => {
            this.clearLockedPopup();
            this.group.getLayer()?.batchDraw();
        }, durationMs);
    }

    onArrowPress(handler: (rightShift: boolean) => void): void {
        this.onArrowPressHandler = handler;
    }

    onRecipeSelect(handler: (recipeId: RecipeId) => void): void {
        this.onRecipeSelectHandler = handler;
    }

    onBackPress(handler: () => void): void {
        this.onBackPressHandler = handler;
    }

    onShow(handler: () => void): void {
        this.onShowHandler = handler;
    }

    private clearLockedPopup(): void {
        if (this.popupTimeoutId !== null) {
            window.clearTimeout(this.popupTimeoutId);
            this.popupTimeoutId = null;
        }
        this.lockedPopupGroup.visible(false);
    }

    private renderRecipeButtons(selected?: RecipeId): void {
        this.recipeButtonsGroup.destroyChildren();

        const count = this.allRecipes.length;
        const available =
            BOX_HEIGHT - 2 * PADDING - RECIPES_HEADER_HEIGHT - (count - 1) * RECIPE_BUTTON_GAP;
        const btnHeight = Math.min(60, Math.max(30, available / Math.max(count, 1)));
        const btnWidth = BOX_WIDTH - 2 * PADDING;

        this.allRecipes.forEach((recipeId, idx) => {
            const isUnlocked = this.unlockedRecipes.has(recipeId);
            const isSelected = isUnlocked && recipeId === selected;
            const title = getRecipeTutorial(recipeId).title;
            const label = isUnlocked ? title : `${title} (Locked)`;

            const btn = new Button({
                x: 0,
                y: idx * (btnHeight + RECIPE_BUTTON_GAP),
                width: btnWidth,
                height: btnHeight,
                label,
                fontSize: Math.min(26, Math.round(btnHeight * 0.48)),
                fill: !isUnlocked ? LOCKED_FILL : isSelected ? SELECTED_FILL : WHITE,
                hoverFill: !isUnlocked ? LOCKED_FILL : isSelected ? SELECTED_FILL : "#eeeeee",
                onClick: () => this.onRecipeSelectHandler?.(recipeId),
            });

            if (!isUnlocked) {
                btn.getGroup().opacity(0.6);
            }

            this.recipeButtonsGroup.add(btn.getGroup());
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