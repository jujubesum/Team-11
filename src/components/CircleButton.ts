import Konva from "konva";

// Clickable circle with a symbol in it (top bar icons, page arrows)
export function makeCircleButton(
	symbol: string,
	centerX: number,
	centerY: number,
	radius: number,
	fill: string,
	onClick: () => void,
): Konva.Group {
	const button = new Konva.Group({ x: centerX, y: centerY });
	button.add(
		new Konva.Circle({ radius, fill, stroke: "black", strokeWidth: 3 }),
		new Konva.Text({
			x: -radius,
			y: -radius,
			width: radius * 2,
			height: radius * 2,
			text: symbol,
			fontSize: radius * 1.1,
			fontStyle: "bold",
			fontFamily: "Arial",
			align: "center",
			verticalAlign: "middle",
			listening: false,
		}),
	);
	button.on("click tap", onClick);
	addPointerCursor(button);
	return button;
}

export function setCursor(node: Konva.Node, cursor: string): void {
	const container = node.getStage()?.container();
	if (container) container.style.cursor = cursor;
}

export function addPointerCursor(node: Konva.Group): void {
	node.on("mouseenter", () => setCursor(node, "pointer"));
	node.on("mouseleave", () => setCursor(node, "default"));
}

// Dimmed arrows means you cannot click it
export function setArrowEnabled(arrow: Konva.Group, enabled: boolean): void {
	arrow.opacity(enabled ? 1 : 0.3);
	arrow.listening(enabled);
	if (!enabled) setCursor(arrow, "default");
}