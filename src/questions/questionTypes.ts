//Types and layout for math questions

//different operations each question can use
export type Operation = "+" | "-" | "×" | "÷";


//what questions we can randomly select from
export interface QuestionConfig{
    allowedOperations: Operation[];
    //how many steps each question has, 1 for everything except hardest level
    steps: number;
    maxNumber: number;
}

//defining what question should look like
export interface Question{
    //variables in the equation
    numbers: number[];
    operations: Operation[];
    answer: number;
    //question shown to player
    prompt: String;
}

export type AnswerStatus = "correct" | "incorrect" | "invalid";

export interface AnswerResult{
    answer: AnswerStatus;
    message: String;
    attemptsRemaining: number;
    //did the user answer correctly, or are they out of attempts
    finished: boolean;
}