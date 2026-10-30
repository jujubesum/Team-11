import Konva from "konva";
 //set up testing for konva
// All Text nodes under `root` whose content equals `text`.
export function findTexts(root: Konva.Group, text: string): Konva.Text[] {
	return root.find<Konva.Text>("Text").filter((node) => node.text() === text);
}
 
// True if some Text under `root` shows `text` and is actually visible on screen.
export function hasVisibleText(root: Konva.Group, text: string): boolean {
	return findTexts(root, text).some((node) => node.isVisible());
}
 
//Simulates clicking on visible button
export function clickButton(root: Konva.Group, label: string): void {
	const labelText = findTexts(root, label).find((node) => node.isVisible());
	if (!labelText) {
		throw new Error(`No visible button labelled "${label}"`);
	}
	labelText.getParent()?.fire("click");
}