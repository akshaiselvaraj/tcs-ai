export interface MenuItem {
  id: number;
  item_name: string;
  category: string;
  meal_type: string;
  veg_nonveg: "Veg" | "Non-Veg";
  price: number;
  cost: number;
  calories: number;
  protein_g: number;
  portion_unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItemCreate {
  item_name: string;
  category: string;
  meal_type: string;
  veg_nonveg?: "Veg" | "Non-Veg";
  price: number;
  cost: number;
  calories?: number;
  protein_g?: number;
  portion_unit?: string;
  is_active?: boolean;
}
