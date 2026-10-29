from datetime import date, datetime
from sqlalchemy import String, Float, Integer, Date, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class WeeklyMenuPlan(Base, TimestampMixin):
    __tablename__ = "weekly_menu_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Draft")  # Draft, Approved, Archived
    
    total_estimated_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_estimated_revenue: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_estimated_profit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_estimated_waste_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    items = relationship("WeeklyMenuItem", back_populates="plan", cascade="all, delete-orphan")


class WeeklyMenuItem(Base):
    __tablename__ = "weekly_menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    plan_id: Mapped[int] = mapped_column(Integer, ForeignKey("weekly_menu_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    
    menu_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Breakfast, Lunch, Dinner
    recommended_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    predicted_demand: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    expected_sales: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    expected_waste: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    expected_profit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Relationships
    plan = relationship("WeeklyMenuPlan", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="weekly_menu_items")

    __table_args__ = (
        Index("idx_weekly_item_date_meal", "menu_date", "meal_type"),
    )
