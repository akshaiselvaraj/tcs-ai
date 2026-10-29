from typing import Dict, Any, List
from datetime import datetime, timezone
import pandas as pd
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.models.menu_item import MenuItem
from app.models.sales_history import SalesHistory
from app.models.import_job import ImportJob
from app.data_processing.validator import DatasetValidator


class IngestionService:
    @staticmethod
    def process_and_ingest(
        db: Session,
        csv_bytes: bytes,
        filename: str = "database.csv",
    ) -> Dict[str, Any]:
        """Validates, cleans, and persists dataset into PostgreSQL tables."""
        # 1. Validate
        report = DatasetValidator.parse_and_validate(csv_bytes)
        if not report["is_valid"]:
            return {
                "success": False,
                "message": report["error"],
                "imported_rows": 0,
                "dishes_added": 0,
                "anomalies": report.get("anomalies", []),
            }

        # 2. Parse & Clean
        df = pd.read_csv(pd.io.common.BytesIO(csv_bytes))
        clean_df = DatasetValidator.clean_and_sanitize(df)
        total_rows = len(clean_df)

        # 3. Create ImportJob audit record
        job = ImportJob(
            filename=filename,
            status="Processing",
            total_rows=total_rows,
            imported_rows=0,
            rejected_rows=0,
            error_summary={"anomalies": report["anomalies"]},
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        try:
            # 4. Extract and Upsert Menu Items (Dishes catalog)
            dish_records = clean_df.groupby("item_name").first().reset_index()
            dishes_added = 0
            dish_id_map: Dict[str, int] = {}

            # Populate existing dishes
            existing_items = db.query(MenuItem).all()
            for item in existing_items:
                dish_id_map[item.item_name.lower()] = item.id

            for _, row in dish_records.iterrows():
                dish_name = str(row["item_name"]).strip()
                if dish_name.lower() not in dish_id_map:
                    new_item = MenuItem(
                        item_name=dish_name,
                        category=str(row.get("category", "Main Course")),
                        meal_type=str(row.get("meal_type", "Lunch")),
                        veg_nonveg=str(row.get("veg_nonveg", "Veg")),
                        price=float(row.get("price", 0.0)),
                        cost=float(row.get("cost", 0.0)),
                        calories=float(row.get("calories", 0.0)),
                        protein_g=float(row.get("protein_g", 0.0)),
                        portion_unit="portion",
                        is_active=True,
                    )
                    db.add(new_item)
                    db.flush()  # generates new_item.id
                    dish_id_map[dish_name.lower()] = new_item.id
                    dishes_added += 1

            # 5. Batch Insert Sales History
            sales_objects: List[SalesHistory] = []
            for _, row in clean_df.iterrows():
                dish_name = str(row["item_name"]).strip().lower()
                item_id = dish_id_map.get(dish_name)
                if not item_id:
                    continue

                sales_obj = SalesHistory(
                    item_id=item_id,
                    sale_date=row["date"].date() if hasattr(row["date"], "date") else row["date"],
                    day=str(row.get("day", "")),
                    week_no=int(row.get("week_no", 1)),
                    meal_type=str(row.get("meal_type", "Lunch")),
                    qty_prepared=int(row.get("qty_prepared", 0)),
                    qty_sold=int(row.get("qty_sold", 0)),
                    qty_wasted=int(row.get("qty_wasted", 0)),
                    unmet_demand=int(row.get("unmet_demand", 0)),
                    rating=float(row["rating"]) if pd.notna(row.get("rating")) else None,
                    attendance=int(row["attendance"]) if pd.notna(row.get("attendance")) else None,
                    present=int(row["present"]) if pd.notna(row.get("present")) else None,
                    absent=int(row["absent"]) if pd.notna(row.get("absent")) else None,
                    climate=str(row["climate"]) if pd.notna(row.get("climate")) else None,
                    temperature_c=float(row["temperature_c"]) if pd.notna(row.get("temperature_c")) else None,
                    rainfall_mm=float(row["rainfall_mm"]) if pd.notna(row.get("rainfall_mm")) else None,
                    humidity_pct=float(row["humidity_pct"]) if pd.notna(row.get("humidity_pct")) else None,
                    day_marker=str(row["day_marker"]) if pd.notna(row.get("day_marker")) else None,
                    is_weekend=bool(row.get("is_weekend", False)),
                    is_holiday=bool(row.get("is_holiday", False)),
                    is_exam=bool(row.get("is_exam", False)),
                    is_festival=bool(row.get("is_festival", False)),
                    promotion=str(row.get("promotion", "None")),
                    times_served_last_14d=int(row.get("times_served_last_14d", 0)),
                    days_since_last_served=int(row["days_since_last_served"]) if pd.notna(row.get("days_since_last_served")) else None,
                    sell_through_pct=float(row["sell_through_pct"]) if pd.notna(row.get("sell_through_pct")) else None,
                    revenue=float(row.get("revenue", 0.0)),
                    waste_cost=float(row.get("waste_cost", 0.0)),
                    profit=float(row.get("profit", 0.0)),
                    import_job_id=job.id,
                )
                sales_objects.append(sales_obj)

                # Commit in chunks of 500 rows for high throughput
                if len(sales_objects) >= 500:
                    db.bulk_save_objects(sales_objects)
                    db.commit()
                    sales_objects = []

            if sales_objects:
                db.bulk_save_objects(sales_objects)
                db.commit()

            # 6. Update ImportJob
            job.status = "Completed"
            job.imported_rows = total_rows
            db.commit()

            logger.info(f"Successfully ingested {total_rows} rows from {filename}. Added {dishes_added} new dishes.")

            return {
                "success": True,
                "message": f"Successfully ingested {total_rows} records and cataloged {dishes_added} unique dishes into PostgreSQL.",
                "job_id": job.id,
                "imported_rows": total_rows,
                "dishes_added": dishes_added,
                "anomalies": report["anomalies"],
            }

        except Exception as e:
            db.rollback()
            job.status = "Failed"
            job.error_summary = {"error": str(e)}
            db.commit()
            logger.error(f"Ingestion failed: {e}")
            return {
                "success": False,
                "message": f"Database ingestion error: {str(e)}",
                "imported_rows": 0,
                "dishes_added": 0,
                "anomalies": [str(e)],
            }


ingestion_service = IngestionService()
