from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer
from database import (
    create_coupon,
    get_coupon_by_code,
    list_coupons,
    update_coupon,
    delete_coupon
)

# Authentication dependency setup (avoid circular import)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user_dep(token: str = Depends(oauth2_scheme)):
    """Fetch current user using the helper from main without circular import"""
    from importlib import import_module
    main_module = import_module("main")
    return await main_module.get_current_user(token)

router = APIRouter(
    tags=["coupons"]
)

class CouponBase(BaseModel):
    code: str = Field(..., description="Unique coupon code")
    discount_amount: Optional[int] = Field(0, description="Discount in paise (₹) to subtract from plan amount")
    discount_percent: Optional[float] = Field(None, description="Discount percentage (0-100). Overrides discount_amount if provided")
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    active: bool = True

class CouponCreate(BaseModel):
    code: str
    discount_amount: Optional[int] = None
    discount_percent: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    active: bool = True

class CouponUpdate(BaseModel):
    discount_amount: Optional[int] = None
    discount_percent: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    active: Optional[bool] = None

@router.post("", tags=["coupons"])  # No trailing slash
async def create_new_coupon_no_slash(coupon_data: CouponCreate, current_user: dict = Depends(get_current_user_dep)):
    """Create a new coupon (admin only) - no trailing slash"""
    return await create_new_coupon(coupon_data, current_user)

@router.post("/", tags=["coupons"])  # With trailing slash
async def create_new_coupon(coupon_data: CouponCreate, current_user: dict = Depends(get_current_user_dep)):
    """Create a new coupon (admin only)"""
    if current_user.get("accountType") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # Convert Pydantic model to dict
    coupon_dict = coupon_data.dict()
    
    # Create coupon
    new_coupon = await create_coupon(coupon_dict)
    if not new_coupon:
        raise HTTPException(status_code=400, detail="Failed to create coupon")
    
    return {"status": "success", "data": new_coupon}

@router.get("", tags=["coupons"])  # No trailing slash
async def get_all_coupons_no_slash():
    """List all active coupons (public endpoint) - no trailing slash"""
    return await get_all_coupons()

@router.get("/", tags=["coupons"])  # With trailing slash
async def get_all_coupons():
    """List all active coupons (public endpoint)"""
    coupons = await list_coupons()
    return {"status": "success", "data": coupons}

@router.get("/{code}", tags=["coupons"])
async def get_coupon(code: str):
    """Public endpoint: get a coupon by code (for validation)"""
    coupon = await get_coupon_by_code(code)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"status": "success", "data": coupon}

@router.put("/{code}", tags=["coupons"])
async def edit_coupon(code: str, update: CouponUpdate, current_user: dict = Depends(get_current_user_dep)):
    if current_user.get("accountType") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    updated = await update_coupon(code, {k: v for k, v in update.dict().items() if v is not None})
    if not updated:
        raise HTTPException(status_code=404, detail="Coupon not found or no changes made")
    return {"status": "success", "data": updated}

@router.delete("/{code}", tags=["coupons"])
async def remove_coupon(code: str, current_user: dict = Depends(get_current_user_dep)):
    if current_user.get("accountType") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    deleted = await delete_coupon(code)
    if not deleted:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"status": "success", "message": "Coupon deleted"} 
