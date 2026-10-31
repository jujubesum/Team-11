import { RECIPES } from '../recipeManager';

// will test that all of the recipes are in order and have the correct names
describe('recipeManager', () => {
    test('has the expected recipes in order and id check', () => {
        //len and id
        expect(RECIPES.length).toBe(5);
        expect(RECIPES[0]!.id).toBe('recipe_01');
        expect(RECIPES[1]!.id).toBe('recipe_02');
        expect(RECIPES[2]!.id).toBe('recipe_03');
        expect(RECIPES[3]!.id).toBe('recipe_04');
        expect(RECIPES[4]!.id).toBe('recipe_05');
    });

    //correct name
    test('each recipe has the correct name', () => {
        expect(RECIPES[0]!.name).toBe('Cookies');
        expect(RECIPES[1]!.name).toBe('Jello');
        expect(RECIPES[2]!.name).toBe('Cupcakes');
        expect(RECIPES[3]!.name).toBe('Pie');
        expect(RECIPES[4]!.name).toBe('Cake');
    });
    
    //correct math operation
    test('each recipe has the correct operation', () => {
        expect(RECIPES[0]!.mathOperations).toEqual(['addition']);
        expect(RECIPES[1]!.mathOperations).toEqual(['subtraction']);
        expect(RECIPES[2]!.mathOperations).toEqual(['multiplication']);
        expect(RECIPES[3]!.mathOperations).toEqual(['division']);
        expect(RECIPES[4]!.mathOperations).toEqual([
            'addition',
            'subtraction',
            'division',
            'multiplication',
        ]);
    });
    //correct steps
    test('each recipe has the correct steps', () => {
        expect(RECIPES[0]!.steps).toEqual([
            'Add flour, sugar, eggs, and butter',
            'Stir until smooth',
            'Bake in oven',
            'Decorate with sprinkles'
        ]);
        expect(RECIPES[1]!.steps).toEqual([
            'Subtract the water',
            'Stir until the powder dissolves',
            'Let it refrigerate',
            'Remove the Jello from the mold'
        ]);
        expect(RECIPES[2]!.steps).toEqual([
            'Multiply how much flour, sugar, eggs, and butter is needed for 6 cupcakes',
            'Stir until smooth',
            'Pour the batter and bake',
            'Decorate with the right amount of frosting for 6 cupcakes'
        ]);
        expect(RECIPES[3]!.steps).toEqual([
            'Cut the apples',
            'Mix the apples with the dough',
            'Bake in oven',
            'Cut the pie into slices']);
        expect(RECIPES[4]!.steps).toEqual([
            'Add and subtract the flour, sugar, eggs, and butter',
            'Bake in oven',
            'Multiply the frosting',
            'Cut the cake into slices'
        ]);
    });
});