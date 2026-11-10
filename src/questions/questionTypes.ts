//types for questions
 
//question operations
export type Operation = "+" | "-" | "×" | "÷";
 

//what kind of question to make
export interface QuestionConfig {
    //operations the generator may pick from 
    allowedOperations: Operation[];
    //biggest # allowed on right side of equation
    operandLimits: Record<Operation, number>;
    //max # allowed anywhere
    maxNumber: number;
}
 
//one math question, e.g. 12 + 5 = ?
export interface Question {
    //left side number
    left: number;
    //right side number
    right: number;
    operation: Operation;
    answer: number;
    //question for player, ex: 2 + 3 = ?
    prompt: string;
}
 
//answer status 
export type AnswerStatus =
    | "correct"
    | "incorrect"
    | "invalid";
 
//what is returned after each submission for questions
export interface AnswerResult {
    status: AnswerStatus;
    //feedback to display
    message: string;
    attemptsRemaining: number;
    //true when question is over (correct, or no more attempts)
    finished: boolean;
}
 