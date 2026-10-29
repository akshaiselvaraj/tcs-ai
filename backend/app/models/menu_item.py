from sqlalchemy import String, Float, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class MenuItem(Base, TimestampMixin):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    item_name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # e.g., Main Course, Snack, Beverage
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # Breakfast, Lunch, Dinner, Any
    veg_nonveg: Mapped[str] = mapped_column(String(20), nullable=False, default="Veg")  # Veg, Non-Veg
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    calories: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    portion_unit: Mapped[str] = mapped_column(String(30), nullable=False, default="portion")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    sales_records = relationship("SalesHistory", back_populates="menu_item", cascade="all, delete-orphan")
    forecasts = relationship("DemandForecast", back_populates="menu_item", cascade="all, delete-orphan")
    weekly_menu_items = relationship("WeeklyMenuItem", back_populates="menu_item")
