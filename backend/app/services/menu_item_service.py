from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.menu_item import MenuItem
from app.repositories.menu_item_repository import menu_item_repo
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate


class MenuItemService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[MenuItem]:
        return menu_item_repo.get_all(db, skip=skip, limit=limit)

    @staticmethod
    def get_by_id(db: Session, item_id: int) -> MenuItem:
        item = menu_item_repo.get_by_id(db, item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item_id} not found."
            )
        return item

    @staticmethod
    def create(db: Session, item_in: MenuItemCreate) -> MenuItem:
        existing = menu_item_repo.get_by_name(db, item_in.item_name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Menu item with name '{item_in.item_name}' already exists."
            )
        new_item = MenuItem(**item_in.model_dump())
        return menu_item_repo.create(db, new_item)

    @staticmethod
    def update(db: Session, item_id: int, item_in: MenuItemUpdate) -> MenuItem:
        item = MenuItemService.get_by_id(db, item_id)
        update_data = item_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        return menu_item_repo.update(db, item)

    @staticmethod
    def delete(db: Session, item_id: int) -> bool:
        item = MenuItemService.get_by_id(db, item_id)
        # Soft-delete by setting is_active to False to preserve historical integrity
        item.is_active = False
        menu_item_repo.update(db, item)
        return True


menu_item_service = MenuItemService()
