import { ScreenController, type ScreenSwitcher } from "../../types.ts";
import { TutorialManager } from "../../tutorialManager.ts";
import { MATH_OPERATIONS, type MathOperation } from "../../mathTutorials.ts";
import { MathTutorialView } from "./MathTutorialView.ts";

// Handles Math Tutorials interactions: operation selection, step navigation, and returning home
export class MathTutorialController extends ScreenController {
    private manager: TutorialManager;
    private view: MathTutorialView;
    private screenSwitcher: ScreenSwitcher;

    constructor(
        screenSwitcher: ScreenSwitcher,
        manager: TutorialManager = new TutorialManager("addition"),
        view: MathTutorialView = new MathTutorialView([...MATH_OPERATIONS]),
    ) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.manager = manager;
        this.view = view;

        // Make sure the manager starts in math mode on addition
        this.manager.selectTutorial("addition");

        this.view.onArrowPress((rightShift) => this.handleArrowButtonPress(rightShift));
        this.view.onOperationSelect((operation) => this.handleOperationSelect(operation));
        this.view.onBackPress(() => this.handleBackButtonPress());

        this.updateView();
    }

    updateView(): void {
        const snapshot = this.manager.getSnapshot();

        this.view.setTutorialContent({
            operation: snapshot.operation,
            title: snapshot.title,
            step: snapshot.step,
            stepNumber: snapshot.stepNumber,
            totalSteps: snapshot.totalSteps,
            canGoBack: snapshot.canGoBack,
            canGoForward: snapshot.canGoForward,
        });
    }

    handleArrowButtonPress(rightShift: boolean): void {
        if (rightShift) {
            this.manager.nextStep();
        } else {
            this.manager.previousStep();
        }
        this.updateView();
    }

    handleOperationSelect(operation: MathOperation): void {
        this.manager.selectTutorial(operation);
        this.updateView();
    }

    handleBackButtonPress(): void {
        this.screenSwitcher.switchToScreen({ type: "home" });
    }

    getView(): MathTutorialView {
        return this.view;
    }
}
