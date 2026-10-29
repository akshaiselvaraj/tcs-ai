from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.menu_item import MenuItem
from app.repositories.base_repository import BaseRepository


class MenuItemRepository(BaseRepository[MenuItem]):
    def __init__(self):
        super().__init__(MenuItem)

    def get_by_name(self, db: Session, name: str) -> Optional[MenuItem]:
        return db.query(MenuItem).filter(MenuItem.item_name.ilike(name)).first()

    def get_active_items(self, db: Session, meal_type: Optional[str] = None) -> List[MenuItem]:
        query = db.query(MenuItem).filter(MenuItem.is_active == True)
        if meal_type:
            query = query.filter(MenuItem.meal_type.ilike(meal_type))
        return query.all()

    def get_by_category(self, db: Session, category: str) -> List[MenuItem]:
        return db.query(MenuItem).filter(MenuItem.category.ilike(category)).all()


menu_item_repo = MenuItemRepository()
