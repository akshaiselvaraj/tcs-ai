import io
import csv
from datetime import date, timedelta, datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.models.menu_item import MenuItem
from app.models.weekly_menu import WeeklyMenuPlan, WeeklyMenuItem
from app.services.optimizer_service import optimizer_service


class WeeklyPlannerService:
    @staticmethod
    def generate_weekly_plan(
        db: Session,
        start_date: date,
        plan_name: Optional[str] = None,
        daily_budget_limit: float = 75000.0,
        repetition_cooldown_days: int = 2,
    ) -> Dict[str, Any]:
        """
        Generates an automated 7-day multi-meal menu schedule across Monday through Sunday.
        Enforces dietary rules, budget limits, kitchen capacity, and repetition cooldown.
        Persists into weekly_menu_plans and weekly_menu_items in Supabase.
        """
        end_date = start_date + timedelta(days=6)
        name = plan_name or f"Optimized 7-Day Plan ({start_date.strftime('%b %d')} - {end_date.strftime('%b %d, %Y')})"

        logger.info(f"Generating 7-day weekly menu plan '{name}' from {start_date} to {end_date}...")

        # 1. Create or overwrite active weekly plan
        plan = WeeklyMenuPlan(
            plan_name=name,
            start_date=start_date,
            end_date=end_date,
            status="Draft",
            total_estimated_cost=0.0,
            total_estimated_revenue=0.0,
            total_estimated_profit=0.0,
            total_estimated_waste_cost=0.0,
        )
        db.add(plan)
        db.flush()  # generates plan.id

        meals = ["Breakfast", "Lunch", "Dinner"]
        meal_targets = {
            "Breakfast": {"min": 4, "max": 5, "min_veg": 3, "budget": daily_budget_limit * 0.25},
            "Lunch": {"min": 5, "max": 6, "min_veg": 4, "budget": daily_budget_limit * 0.50},
            "Dinner": {"min": 4, "max": 5, "min_veg": 3, "budget": daily_budget_limit * 0.25},
        }

        # Track dish history to enforce repetition cooldown: item_id -> last_served_date
        last_served: Dict[int, date] = {}

        total_cost = 0.0
        total_rev = 0.0
        total_profit = 0.0
        total_waste_cost = 0.0

        days_matrix: List[Dict[str, Any]] = []

        # 2. Iterate through 7 days
        for day_offset in range(7):
            current_date = start_date + timedelta(days=day_offset)
            day_name = current_date.strftime("%A")
            day_entry: Dict[str, Any] = {
                "day_name": day_name,
                "date": current_date.isoformat(),
                "meals": {},
            }

            for meal in meals:
                cfg = meal_targets[meal]
                # Solve optimal menu for this day & meal
                opt_res = optimizer_service.optimize_menu_mix(
                    db=db,
                    forecast_date=current_date,
                    meal_type=meal,
                    budget_limit=cfg["budget"],
                    min_items=cfg["min"],
                    max_items=cfg["max"],
                    min_veg_items=cfg["min_veg"],
                    objective_priority="balanced",
                )

                # Filter items with repetition cooldown
                selected = opt_res.get("selected_dishes", [])
                final_dishes = []
                for dish in selected:
                    i_id = dish["item_id"]
                    prev_date = last_served.get(i_id)
                    # Check cooldown
                    if prev_date and (current_date - prev_date).days <= repetition_cooldown_days:
                        # Skip if served too recently
                        continue
                    final_dishes.append(dish)
                    last_served[i_id] = current_date

                # Ensure minimum item count
                if len(final_dishes) < cfg["min"]:
                    final_dishes = selected[:cfg["min"]]
                    for d in final_dishes:
                        last_served[d["item_id"]] = current_date

                day_entry["meals"][meal] = final_dishes

                # Persist weekly menu items
                for d in final_dishes:
                    weekly_item = WeeklyMenuItem(
                        plan_id=plan.id,
                        item_id=d["item_id"],
                        menu_date=current_date,
                        meal_type=meal,
                        recommended_quantity=d["recommended_preparation"],
                        predicted_demand=d["predicted_demand"],
                        expected_sales=d["expected_sales"],
                        expected_waste=d["expected_waste"],
                        expected_profit=d["estimated_profit"],
                    )
                    db.add(weekly_item)

                    total_cost += d["prep_cost"]
                    total_rev += d["expected_revenue"]
                    total_profit += d["estimated_profit"]
                    total_waste_cost += d["waste_cost"]

            days_matrix.append(day_entry)

        # 3. Update plan aggregates
        plan.total_estimated_cost = round(total_cost, 2)
        plan.total_estimated_revenue = round(total_rev, 2)
        plan.total_estimated_profit = round(total_profit, 2)
        plan.total_estimated_waste_cost = round(total_waste_cost, 2)

        db.commit()

        logger.info(
            f"Weekly plan #{plan.id} finalized: Revenue=Rs.{plan.total_estimated_revenue}, Profit=Rs.{plan.total_estimated_profit}"
        )

        return {
            "plan_id": plan.id,
            "plan_name": plan.plan_name,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat(),
            "status": plan.status,
            "financial_summary": {
                "total_estimated_cost": plan.total_estimated_cost,
                "total_estimated_revenue": plan.total_estimated_revenue,
                "total_estimated_profit": plan.total_estimated_profit,
                "total_estimated_waste_cost": plan.total_estimated_waste_cost,
            },
            "schedule": days_matrix,
        }

    @staticmethod
    def get_latest_plan(db: Session) -> Optional[Dict[str, Any]]:
        """Retrieves the latest generated 7-day weekly menu plan from Supabase."""
        plan = db.query(WeeklyMenuPlan).order_by(WeeklyMenuPlan.id.desc()).first()
        if not plan:
            return None

        # Build schedule matrix
        items = (
            db.query(WeeklyMenuItem, MenuItem.item_name, MenuItem.category, MenuItem.veg_nonveg, MenuItem.price, MenuItem.cost)
            .join(MenuItem, WeeklyMenuItem.item_id == MenuItem.id)
            .filter(WeeklyMenuItem.plan_id == plan.id)
            .order_by(WeeklyMenuItem.menu_date, WeeklyMenuItem.meal_type)
            .all()
        )

        # Group by date and meal
        days_map: Dict[str, Dict[str, List[Any]]] = {}
        for w_item, dish_name, category, veg_nonveg, price, cost in items:
            date_str = w_item.menu_date.isoformat()
            if date_str not in days_map:
                days_map[date_str] = {"Breakfast": [], "Lunch": [], "Dinner": []}

            meal = w_item.meal_type
            if meal not in days_map[date_str]:
                days_map[date_str][meal] = []

            days_map[date_str][meal].append({
                "item_id": w_item.item_id,
                "item_name": dish_name,
                "category": category,
                "veg_nonveg": veg_nonveg,
                "price": price,
                "cost": cost,
                "recommended_preparation": w_item.recommended_quantity,
                "predicted_demand": w_item.predicted_demand,
                "expected_sales": w_item.expected_sales,
                "expected_waste": w_item.expected_waste,
                "estimated_profit": w_item.expected_profit,
            })

        schedule = []
        cur = plan.start_date
        while cur <= plan.end_date:
            date_str = cur.isoformat()
            schedule.append({
                "day_name": cur.strftime("%A"),
                "date": date_str,
                "meals": days_map.get(date_str, {"Breakfast": [], "Lunch": [], "Dinner": []}),
            })
            cur += timedelta(days=1)

        return {
            "plan_id": plan.id,
            "plan_name": plan.plan_name,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat(),
            "status": plan.status,
            "financial_summary": {
                "total_estimated_cost": plan.total_estimated_cost,
                "total_estimated_revenue": plan.total_estimated_revenue,
                "total_estimated_profit": plan.total_estimated_profit,
                "total_estimated_waste_cost": plan.total_estimated_waste_cost,
            },
            "schedule": schedule,
        }

    @staticmethod
    def export_plan_csv(db: Session, plan_id: Optional[int] = None) -> str:
        """Exports a weekly plan as a clean CSV string."""
        if plan_id:
            plan = db.query(WeeklyMenuPlan).filter(WeeklyMenuPlan.id == plan_id).first()
        else:
            plan = db.query(WeeklyMenuPlan).order_by(WeeklyMenuPlan.id.desc()).first()

        if not plan:
            raise ValueError("No weekly menu plan found to export.")

        items = (
            db.query(WeeklyMenuItem, MenuItem.item_name, MenuItem.category, MenuItem.veg_nonveg, MenuItem.price, MenuItem.cost)
            .join(MenuItem, WeeklyMenuItem.item_id == MenuItem.id)
            .filter(WeeklyMenuItem.plan_id == plan.id)
            .order_by(WeeklyMenuItem.menu_date, WeeklyMenuItem.meal_type)
            .all()
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Day", "Date", "Meal Type", "Dish Name", "Category", "Dietary",
            "Recommended Prep (Portions)", "Predicted Demand", "Selling Price (Rs)", "Prep Cost (Rs)", "Estimated Profit (Rs)"
        ])

        for w_item, dish_name, category, veg_nonveg, price, cost in items:
            writer.writerow([
                w_item.menu_date.strftime("%A"),
                w_item.menu_date.isoformat(),
                w_item.meal_type,
                dish_name,
                category,
                veg_nonveg,
                w_item.recommended_quantity,
                w_item.predicted_demand,
                price,
                cost,
                w_item.expected_profit,
            ])

        return output.getvalue()


weekly_planner_service = WeeklyPlannerService()
