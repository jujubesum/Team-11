export interface Recipe {
    id: string;
    name: string;
    mathOperations:string[];
    steps: string[];
}

//Recipes include the id, name, operation, and steps
export const RECIPES: Recipe[] = [
  {
    id: 'recipe_01',
    name: 'Cookies',
    mathOperations: ['addition'],
    steps: [
      'Add flour, sugar, eggs, and butter',
      'Stir until smooth',
      'Bake in oven',
      'Decorate with sprinkles'
    ],
  },
  {
    id: 'recipe_02',
    name: 'Jello',
    mathOperations: ['subtraction'],
    steps: [
      'Subtract the water',
      'Stir until the powder dissolves',
      'Let it refrigerate',
      'Remove the Jello from the mold'
    ],
  },
  {
    id: 'recipe_03',
    name: 'Cupcakes',
    mathOperations: ['multiplication'],
    steps: [
      'Multiply how much flour, sugar, eggs, and butter is needed for 6 cupcakes',
      'Stir until smooth',
      'Pour the batter and bake',
      'Decorate with the right amount of frosting for 6 cupcakes'
    ],
  },
  {
    id: 'recipe_04',
    name: 'Pie',
    mathOperations: ['division'],
    steps: [
      'Cut the apples',
      'Mix the apples with the dough',
      'Bake in oven',
      'Cut the pie into slices'
    ],
  },
  {
    id: 'recipe_05',
    name: 'Cake',
    mathOperations: ['addition', 'subtraction','division', 'multiplication'],
    steps: [
      'Add and subtract the flour, sugar, eggs, and butter',
      'Bake in oven',
      'Multiply the frosting',
      'Cut the cake into slices'
    ],
  }
];