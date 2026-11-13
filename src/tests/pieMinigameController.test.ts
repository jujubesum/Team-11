import { PieMinigameController } from "../screens/PieMinigame/PieMinigameController";
import type { ScreenSwitcher } from "../types";

jest.mock("../screens/PieMinigame/PieMinigameView", () => ({
    PieMinigameView: class {
        preloadImages = jest.fn();
        show = jest.fn();
        hide = jest.fn();
        setScore = jest.fn();
        setTime = jest.fn();
        showQuestion = jest.fn();
        flashChoice = jest.fn();
        showSummary = jest.fn();
    },
}));

describe("PieMinigameController", () => {
    let controller: PieMinigameController;
    let view: any;
    
    beforeEach(() => {
        jest.useFakeTimers();
        const screenSwitcher = { switchToScreen: jest.fn() } as unknown as ScreenSwitcher;
        controller = new PieMinigameController(screenSwitcher);
        view = controller.getView();
        controller.show();
    });
    
    afterEach(() => {
        controller.hide();
        jest.useRealTimers();
    });
    
    //make sure that there are 4 different choices
    it("shows 4 different choices", () => {
        const choices = view.showQuestion.mock.calls[0][1];
        expect(new Set(choices).size).toBe(4);
    });
    
    //the target is in the choices
    it("includes the target among the choices", () => {
        const [target, choices] = view.showQuestion.mock.calls[0];
        expect(choices).toContain(target);
    });

    //checks that the timer does count down
    it("counts down the timer", () => {
        jest.advanceTimersByTime(3000);
        expect(view.setTime).toHaveBeenLastCalledWith(27);
    });

    //make sure that the summary appears
    it("shows the summary when time runs out", () => {
        jest.advanceTimersByTime(30_000);
        expect(view.showSummary).toHaveBeenCalledTimes(1);
    });
});