from sqlalchemy import String, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class OptimizationSetting(Base, TimestampMixin):
    __tablename__ = "optimization_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    setting_name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    
    # Financial & capacity limits
    budget_limit: Mapped[float] = mapped_column(Float, nullable=False, default=15000.0)
    max_items_per_meal: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
    min_items_per_meal: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    min_veg_items: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    
    # Nutritional bounds
    target_calories_min: Mapped[float] = mapped_column(Float, nullable=True, default=450.0)
    target_calories_max: Mapped[float] = mapped_column(Float, nullable=True, default=850.0)
    target_protein_min: Mapped[float] = mapped_column(Float, nullable=True, default=15.0)
    
    # Optimization priority weights (JSON: profit, waste, shortage, variety)
    weights_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
