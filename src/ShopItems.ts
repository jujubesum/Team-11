// Everything the shop sells: kitchen background layouts. Temporarily colors since no designs yet
export interface ShopItem {
	id: string;
	name: string;
	price: number;
	// Placeholder color before we do images
	color: string;
	// Path to the kitchen image, will add later
	image?: string | undefined;
}

export const SHOP_ITEMS: ShopItem[] = [
	// Color Placeholders, will change with actual image backgrounds later
	{ id: "kitchen_yellow", name: "Yellow Kitchen", price: 10, color: "#ffe08a" },
	{ id: "kitchen_mint", name: "Mint Kitchen", price: 10, color: "#a8e6cf" },
	{ id: "kitchen_pink", name: "Pink Kitchen", price: 15, color: "#f4a6c1" },
	{ id: "kitchen_blue", name: "Blue Kitchen", price: 15, color: "#9ecbff" },
	{ id: "kitchen_lavender", name: "Lavender Kitchen", price: 20, color: "#cdb4f0" },
	{ id: "kitchen_Brown", name: "Brown Kitchen", price: 20, color: "#b08968" },
	{ id: "kitchen_green", name: "Green Kitchen", price: 25, color: "#c5e384" },
	{ id: "kitchen_orange", name: "Orange Kitchen", price: 25, color: "#ffb385" },
	{ id: "kitchen_red", name: "Red Kitchen", price: 30, color: "#ff6565" },
	{ id: "kitchen_grey", name: "Grey Kitchen", price: 30, color: "#7d7d7d" },
	{ id: "kitchen_peach", name: "Peach Kitchen", price: 30, color: "#ffd5a4" },
	{ id: "kitchen_indigo", name: "Indigo Kitchen", price: 30, color: "#acaeff" },
];

// Num items that fit on one page of the grid
export const ITEMS_PER_PAGE = 6;