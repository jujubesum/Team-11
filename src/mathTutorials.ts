export type MathOperation =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions";
export const MATH_OPERATIONS = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "fractions"
] as const;
export interface MathTutorial {
  title: string;
  steps: string[];
}

export const mathTutorials: Record<MathOperation, MathTutorial> = {
  addition: {
    title: "Addition",
    steps: [
      "Let's add 12 + 5!",
      "Start with 12.",
      "Count 5 more: 13, 14, 15, 16, 17.",
      "The answer is 17!"
    ]
  },

  subtraction: {
    title: "Subtraction",
    steps: [
      "Let's subtract 10 - 4!",
      "Start with 10.",
      "Count backward 4 times.",
      "The answer is 6!"
    ]
  },

  multiplication: {
    title: "Multiplication",
    steps: [
      "Let's multiply 3 × 4!",
      "Think of 3 groups of 4.",
      "Add 4 + 4 + 4.",
      "The answer is 12!"
    ]
  },

  division: {
    title: "Division",
    steps: [
      "Let's divide 12 ÷ 3!",
      "Imagine sharing 12 cookies among 3 friends.",
      "Give each friend the same number of cookies.",
      "Each friend gets 4 cookies!"
    ]
  },

  fractions: {
    title: "Fractions",
    steps: [
      "Let's learn about fractions!",
      "Imagine a pie cut into 4 equal slices.",
      "If you take 1 slice, you have 1 out of 4.",
      "That's one-fourth, or 1/4!"
    ]
  }
};
export function getMathTutorial(operation: MathOperation): MathTutorial {
  return mathTutorials[operation];
}

export function isMathOperation(value: string): value is MathOperation {
  return Object.prototype.hasOwnProperty.call(mathTutorials, value);
}