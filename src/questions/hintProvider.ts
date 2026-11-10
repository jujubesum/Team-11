//only called on incorrect answers and last attempt
export function getHint(answer: number, guess: number): string {
    return `You are ${Math.abs(answer - guess)} away from the right answer!`;
}