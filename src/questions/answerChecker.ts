//answer validation
import type { AnswerStatus } from "./questionTypes.ts";

export function checkAnswer(input: string, correctAnswer: number): AnswerStatus{
    const trimmed: string = input.trim();
    if(/^\d+$/.test(trimmed)){
        const result: number = Number(trimmed);
        if (result === correctAnswer){
            return "correct";
        }
        return "incorrect";

    }
    return "invalid";
}