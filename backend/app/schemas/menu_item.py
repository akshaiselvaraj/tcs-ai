from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MenuItemBase(BaseModel):
    item_name: str = Field(..., max_length=150)
    category: str = Field(..., max_length=50)
    meal_type: str = Field(..., max_length=50)
    veg_nonveg: str = Field(default="Veg", max_length=20)
    price: float = Field(..., ge=0.0)
    cost: float = Field(..., ge=0.0)
    calories: float = Field(default=0.0, ge=0.0)
    protein_g: float = Field(default=0.0, ge=0.0)
    portion_unit: str = Field(default="portion", max_length=30)
    is_active: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    item_name: Optional[str] = Field(None, max_length=150)
    category: Optional[str] = Field(None, max_length=50)
    meal_type: Optional[str] = Field(None, max_length=50)
    veg_nonveg: Optional[str] = Field(None, max_length=20)
    price: Optional[float] = Field(None, ge=0.0)
    cost: Optional[float] = Field(None, ge=0.0)
    calories: Optional[float] = Field(None, ge=0.0)
    protein_g: Optional[float] = Field(None, ge=0.0)
    portion_unit: Optional[str] = Field(None, max_length=30)
    is_active: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
