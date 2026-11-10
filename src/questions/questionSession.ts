import type { AnswerResult, Question } from "./questionTypes.ts";
import { checkAnswer } from "./answerChecker.ts";
import { getHint } from "./hintProvider.ts";

const MAX_ATTEMPTS = 3;

//holds one question and player's progress on it, make one per question
export class QuestionSession {
	private question: Question;
	private attemptsRemaining: number;
	private finished: boolean;

	constructor(question: Question) {
        this.attemptsRemaining = MAX_ATTEMPTS;
        this.question = question;
        this.finished = false;
	}

	//text to display
	getPrompt(): string {
        return this.question.prompt;
	}

	//check an answer and return feedback for the UI
	submit(input: string): AnswerResult {
        if(this.finished){
            throw new Error("This question's already done");
        }
        const status = checkAnswer(input, this.question.answer);
        let message: string;

        if(status === "invalid"){
            message = "Please make sure you are entering a valid number.";
        }else if(status === "incorrect"){
            message = "That is incorrect. Please try again!";
            this.attemptsRemaining -= 1;
            if(this.attemptsRemaining === 0){
                this.finished = true;
                message = "You are out of attempts. Please try a new problem.";
            }else if(this.attemptsRemaining === 1){
                message = getHint(this.question.answer, Number(input.trim()));
            }
        }else{
            message = "That is correct! Good job!";
            this.finished = true;
        }

        return {
            status,
            message,
            attemptsRemaining: this.attemptsRemaining,
            finished: this.finished
        }
	}

	isFinished(): boolean {
		return this.finished;
	}
}