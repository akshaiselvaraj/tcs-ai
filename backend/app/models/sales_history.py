from datetime import date
from sqlalchemy import String, Float, Boolean, Integer, Date, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class SalesHistory(Base, TimestampMixin):
    __tablename__ = "sales_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Temporal fields
    sale_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    day: Mapped[str] = mapped_column(String(20), nullable=False)
    week_no: Mapped[int] = mapped_column(Integer, nullable=False)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # Operational metrics
    qty_prepared: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    qty_sold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    qty_wasted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unmet_demand: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rating: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Attendance context
    attendance: Mapped[int] = mapped_column(Integer, nullable=True)
    present: Mapped[int] = mapped_column(Integer, nullable=True)
    absent: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Environmental / Climate context
    climate: Mapped[str] = mapped_column(String(50), nullable=True)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=True)
    rainfall_mm: Mapped[float] = mapped_column(Float, nullable=True)
    humidity_pct: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Calendar & Event flags
    day_marker: Mapped[str] = mapped_column(String(50), nullable=True)
    is_weekend: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_holiday: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_exam: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_festival: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    promotion: Mapped[str] = mapped_column(String(100), nullable=True)
    
    # Historical frequency indicators
    times_served_last_14d: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    days_since_last_served: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Financial outputs
    sell_through_pct: Mapped[float] = mapped_column(Float, nullable=True)
    revenue: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    waste_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    profit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    
    import_job_id: Mapped[int] = mapped_column(Integer, ForeignKey("import_jobs.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    menu_item = relationship("MenuItem", back_populates="sales_records")
    import_job = relationship("ImportJob", back_populates="sales_records")

    __table_args__ = (
        Index("idx_sales_date_meal", "sale_date", "meal_type"),
        Index("idx_sales_item_date", "item_id", "sale_date"),
    )
