from datetime import date, datetime
from sqlalchemy import String, Float, Integer, Date, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    predicted_demand: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_preparation: Mapped[int] = mapped_column(Integer, nullable=False)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)  # LightGBM, RandomForest, Baseline
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    
    lower_bound: Mapped[float] = mapped_column(Float, nullable=True)
    upper_bound: Mapped[float] = mapped_column(Float, nullable=True)
    
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    menu_item = relationship("MenuItem", back_populates="forecasts")

    __table_args__ = (
        Index("idx_forecast_date_meal", "forecast_date", "meal_type"),
    )
