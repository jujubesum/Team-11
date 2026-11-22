// Everything the shop sells: kitchen background layouts. Temporarily colors since no designs yet
export interface ShopItem {
	id: string;
	name: string;
	price: number;
	// Placeholder color before we do images
	color: string;
}

export const DEFAULT_BACKGROUND = "#d9d9d9";

// Background color for a kitchen id (or default)
export function getBackgroundColor(kitchenId: string | null): string {
	return SHOP_ITEMS.find((item) => item.id === kitchenId)?.color ?? DEFAULT_BACKGROUND;
}

export const SHOP_ITEMS: ShopItem[] = [
	{ id: "kitchen_yellow", name: "Yellow Kitchen", price: 10, color: "#fff5b4" },
	{ id: "kitchen_mint", name: "Mint Kitchen", price: 10, color: "#a8e6cf" },
	{ id: "kitchen_pink", name: "Pink Kitchen", price: 15, color: "#ffcddf" },
	{ id: "kitchen_blue", name: "Blue Kitchen", price: 15, color: "#b9daff" },
	{ id: "kitchen_lavender", name: "Lavender Kitchen", price: 20, color: "#e8b9ff" },
	{ id: "kitchen_Brown", name: "Brown Kitchen", price: 20, color: "#c6a183" },
	{ id: "kitchen_green", name: "Green Kitchen", price: 25, color: "#cbffbe" },
	{ id: "kitchen_orange", name: "Orange Kitchen", price: 25, color: "#ffcba8" },
	{ id: "kitchen_red", name: "Red Kitchen", price: 30, color: "#ff8d8d" },
	{ id: "kitchen_grey", name: "Grey Kitchen", price: 30, color: "#767676" },
	{ id: "kitchen_peach", name: "Peach Kitchen", price: 30, color: "#ffd5a4" },
	{ id: "kitchen_indigo", name: "Indigo Kitchen", price: 30, color: "#c2caff" },
];

// Num items that fit on one page of the grid
export const ITEMS_PER_PAGE = 6;