import Konva from "konva";
 
export interface ButtonConfig {
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	subtitle?: string | undefined;
	// Leave undefined for a button that isn't wired up yet
	onClick?: (() => void) | undefined;
	fontSize?: number | undefined;
	fill?: string | undefined;
	hoverFill?: string | undefined;
	// Start the button greyed out and unclickable
	disabled?: boolean | undefined;
	// Fill used while disabled
	disabledFill?: string | undefined;
}

const TEXT_COLOR = "black";
const STROKE_COLOR = "black";
const DISABLED_TEXT_COLOR = "#aaaaaa";
const DISABLED_STROKE_COLOR = "#bbbbbb";
 
// Reusable rounded button: a Group holding a Rect, a main label, and an optional subtitle line.
export class Button {
	private group: Konva.Group;
	private rect: Konva.Rect;
	private labelText: Konva.Text;
	private subtitleText: Konva.Text;
	private height: number;
	private fill: string;
	private hoverFill: string;
	private disabledFill: string;
	private enabled = true;
	private hovered = false;
 
	constructor({
		x,
		y,
		width,
		height,
		label,
		subtitle,
		onClick,
		fontSize = 28,
		fill = "white",
		hoverFill = "#eeeeee",
		disabled = false,
		disabledFill = "white",
	}: ButtonConfig) {
		this.height = height;
		this.fill = fill;
		this.hoverFill = hoverFill;
		this.disabledFill = disabledFill;
 
		this.group = new Konva.Group({ x, y });
 
		this.rect = new Konva.Rect({
			width,
			height,
			fill,
			stroke: "black",
			strokeWidth: 3,
			cornerRadius: 12,
		});
 
		// Giving each Text the button's width and using align/verticalAlign
		// centers it with no offset math. listening: false sends clicks to the group.
		this.labelText = new Konva.Text({
			width,
			text: label,
			fontSize,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
			verticalAlign: "middle",
			listening: false,
		});
 
		this.subtitleText = new Konva.Text({
			width,
			fontSize: Math.round(fontSize * 0.55),
			fontFamily: "Arial",
			fill: "black",
			align: "center",
			verticalAlign: "middle",
			listening: false,
		});
 
		this.group.add(this.rect, this.labelText, this.subtitleText);
		this.setSubtitle(subtitle);
 
		if (onClick) {
			this.enableInteraction(onClick);
		}

		this.setEnabled(!disabled);
	}
 
	// Show, change, or remove (pass undefined) the second line
	setSubtitle(subtitle: string | undefined): void {
		if (subtitle) {
			// Two lines: label in the upper part, subtitle underneath
			this.labelText.y(this.height * 0.1);
			this.labelText.height(this.height * 0.5);
			this.subtitleText.y(this.height * 0.6);
			this.subtitleText.height(this.height * 0.3);
			this.subtitleText.text(subtitle);
			this.subtitleText.visible(true);
		} else {
			// One line: label fills the whole button
			this.labelText.y(0);
			this.labelText.height(this.height);
			this.subtitleText.visible(false);
		}
	}
 
	// Turn the button on or off. Disabled buttons are greyed out and ignore clicks and hover.
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;

		this.rect.stroke(enabled ? STROKE_COLOR : DISABLED_STROKE_COLOR);
		this.labelText.fill(enabled ? TEXT_COLOR : DISABLED_TEXT_COLOR);
		this.subtitleText.fill(enabled ? TEXT_COLOR : DISABLED_TEXT_COLOR);
		this.updateLook();

		// If the mouse is already over it, fix the cursor right away
		if (this.hovered) {
			this.setCursor(enabled ? "pointer" : "default");
		}

		this.group.getLayer()?.batchDraw();
	}

	isEnabled(): boolean {
		return this.enabled;
	}
 
	private enableInteraction(onClick: () => void): void {
		this.group.on("click tap", () => {
			if (this.enabled) onClick();
		});
 
		this.group.on("mouseenter", () => {
			this.hovered = true;
			if (this.enabled) this.setCursor("pointer");
			this.updateLook();
			this.group.getLayer()?.batchDraw();
		});
 
		this.group.on("mouseleave", () => {
			this.hovered = false;
			this.setCursor("default");
			this.updateLook();
			this.group.getLayer()?.batchDraw();
		});
	}

	// Pick the fill for the current state, either when hovered, disabled, or normal (nothing)
	private updateLook(): void {
		if (!this.enabled) {
			this.rect.fill(this.disabledFill);
		} else {
			this.rect.fill(this.hovered ? this.hoverFill : this.fill);
		}
	}
 
	private setCursor(cursor: string): void {
		const container = this.group.getStage()?.container();
		if (container) container.style.cursor = cursor;
	}
 
	getGroup(): Konva.Group {
		return this.group;
	}
}