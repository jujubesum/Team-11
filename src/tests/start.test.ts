// @jest-environment jsdom
 
import "jest-canvas-mock";
import Konva from "konva";
 
// Text currently visible on the stage (hidden screens don't count).
function visibleTexts(stage: Konva.Stage): string[] {
	return stage
		.find<Konva.Text>("Text")
		.filter((text) => text.isVisible())
		.map((text) => text.text());
}
 
describe("App startup", () => {
	let stage: Konva.Stage;
 
	beforeAll(async () => {
		document.body.innerHTML = '<div id="container"></div>';
		await import("../main.ts");
		stage = Konva.stages[Konva.stages.length - 1]!;
	});
 
	it("opens on the title screen", () => {
		expect(visibleTexts(stage)).toContain("Welcome!");
	});
 
	it("does not show the home screen at startup", () => {
		expect(visibleTexts(stage)).not.toContain("Start Baking!");
		expect(visibleTexts(stage)).not.toContain("Save & Exit");
	});
});