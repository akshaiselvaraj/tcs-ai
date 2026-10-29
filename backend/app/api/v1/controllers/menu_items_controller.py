from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.schemas.common import APIResponse
from app.services.menu_item_service import menu_item_service

router = APIRouter(prefix="/menu-items", tags=["Menu Items"])


@router.get("", response_model=APIResponse[List[MenuItemResponse]])
def get_menu_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> APIResponse[List[MenuItemResponse]]:
    items = menu_item_service.get_all(db, skip=skip, limit=limit)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(items)} menu items",
        data=[MenuItemResponse.model_validate(item) for item in items],
    )


@router.get("/{item_id}", response_model=APIResponse[MenuItemResponse])
def get_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
) -> APIResponse[MenuItemResponse]:
    item = menu_item_service.get_by_id(db, item_id)
    return APIResponse(
        success=True,
        message="Menu item retrieved",
        data=MenuItemResponse.model_validate(item),
    )


@router.post("", response_model=APIResponse[MenuItemResponse], status_code=status.HTTP_201_CREATED)
def create_menu_item(
    item_in: MenuItemCreate,
    db: Session = Depends(get_db),
) -> APIResponse[MenuItemResponse]:
    item = menu_item_service.create(db, item_in)
    return APIResponse(
        success=True,
        message="Menu item created successfully",
        data=MenuItemResponse.model_validate(item),
    )


@router.patch("/{item_id}", response_model=APIResponse[MenuItemResponse])
def update_menu_item(
    item_id: int,
    item_in: MenuItemUpdate,
    db: Session = Depends(get_db),
) -> APIResponse[MenuItemResponse]:
    item = menu_item_service.update(db, item_id, item_in)
    return APIResponse(
        success=True,
        message="Menu item updated successfully",
        data=MenuItemResponse.model_validate(item),
    )


@router.delete("/{item_id}", response_model=APIResponse[dict])
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
) -> APIResponse[dict]:
    menu_item_service.delete(db, item_id)
    return APIResponse(
        success=True,
        message="Menu item deactivated successfully",
        data={"item_id": item_id, "is_active": False},
    )
