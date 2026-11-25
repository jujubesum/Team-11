import type { ScreenSwitcher } from "../../types.ts";
import { PieMinigameView } from "./PieMinigameView.ts";
import type { SaveManager } from "../../saveManager.ts";

const ALL_FRACTIONS = ["1/2", "1/3", "2/3", "1/4", "3/4", "1/5", "2/5", "3/5", "4/5"];
const GAME_SECONDS = 30;
// how long the green/red flash shows before the next question
const FEEDBACK_MS = 250;
const MAX_SCORES = 5;

// it shuffles all of the elements of the array
function shuffle<T>(arr: T[]): T[] {
    //creates a new array
    const a = [...arr];
    //swaps starting with the last element
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i]!;
        a[i] = a[j]!;
        a[j] = tmp;
    }
  return a;
}

//adds the score
export function addScore(scores: number[], newScore: number): number[] {
    //sort the highest scores and keeps the top 5
    return [...scores, newScore].sort((a, b) => b - a).slice(0, MAX_SCORES);
}

export class PieMinigameController {
    private view: PieMinigameView;
    
    // Game variables
    private score = 0;
    private timeLeft = GAME_SECONDS;
    private target = "";
    private previousTarget = "";
    private currentChoices: string[] = [];
    private locked = false;
    
    // Timer
    private timerId: number | null = null;
    private feedbackId: number | null = null;

    //navigates to the other screens
    constructor(private switcher: ScreenSwitcher, private saveManager: SaveManager) {
        this.view = new PieMinigameView({
            onHome: () => {
                //stop the countdown before leaving
                this.clearTimers();
                this.switcher.switchToScreen({ type: "home" });
            },
        });
        this.view.preloadImages(ALL_FRACTIONS);
    }

    private endGame(): void {
        this.clearTimers();
        this.locked = true;

        const earned = this.score;
        
        // load() refreshes `current` from storage; it is null if there is no save
        const save = this.saveManager.load();
        const previous = save?.pieHighScores ?? [];
        const topScores = addScore(previous, this.score);

        if (save) {
            this.saveManager.update({ 
                pieHighScores: topScores,
                money: save.money + earned,
            });
            this.saveManager.save();
        }

        this.view.showSummary(
            this.score, 
            earned, 
            topScores, 
            "Back to home", 
            () => this.switcher.switchToScreen({ type: "home" }),
            () => {
                document.body.style.cursor = "default";
                this.startGame();
            }
        );
    }
    
    getView() { return this.view; }
    
    show() {
        this.view.show();
        this.startGame();
    }
    
    hide() {
        this.clearTimers();
        this.view.hide();
    }
    
    private startGame(): void {
        this.clearTimers();
        this.score = 0;
        this.timeLeft = GAME_SECONDS;
        this.previousTarget = "";
        this.locked = false;

        this.view.setScore(this.score);
        this.view.setTime(this.timeLeft);
        this.nextQuestion();
        
        //Starts the countdown, calls tick() once per second
        this.timerId = window.setInterval(() => this.tick(), 1000);
    }
    
    //lowers the clock each second and ends the game
    private tick(): void {
        this.timeLeft--;
        this.view.setTime(this.timeLeft);
        if (this.timeLeft <= 0) this.endGame();
    }

    //Builds and displays a new question
    private nextQuestion(): void {
        // Random target (never the same one twice in a row) plus 3 random wrong answers
        const target = shuffle(ALL_FRACTIONS.filter((f) => f !== this.previousTarget))[0]!;
        const wrongAnswers = shuffle(ALL_FRACTIONS.filter((f) => f !== target)).slice(0, 3);
        
        this.target = target;
        this.previousTarget = target;
        this.currentChoices = shuffle([target, ...wrongAnswers]);
        
        this.view.showQuestion(target, this.currentChoices, (i) => this.handlePick(i));
    }
    
    //will handle the player clicking one of the four choices
    private handlePick(index: number): void {
        // ignore clicks during the flash or after time is up
        if (this.locked) return; 
        this.locked = true;
        
        //will compare the clicked choice against the correct answer
        const correct = this.currentChoices[index] === this.target;
        if (correct) {
            this.score++;
            this.view.setScore(this.score);
        }
        
        //Outline the clicked pie green (correct) or red (wrong)
        this.view.flashChoice(index, correct);
        
        //After a brief pause, unlock input and move on to the next question
        this.feedbackId = window.setTimeout(() => {
            this.feedbackId = null;
            this.locked = false;
            this.nextQuestion();
        }, FEEDBACK_MS);
    }

    // cancels any running timer and resets their handles
    private clearTimers(): void {
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }
        
        if (this.feedbackId !== null) {
            window.clearTimeout(this.feedbackId);
            this.feedbackId = null;
        }
    }
}