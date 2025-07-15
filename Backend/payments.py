from fastapi import APIRouter, HTTPException, Depends, Body
import razorpay
import os
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime, timedelta
from database import (
    user_collection,
    get_user_by_id,
    get_interview_stats_for_user,
    get_coupon_by_code
)
from bson import ObjectId
from pydantic import BaseModel


# Load environment variables
load_dotenv()

# Initialize Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise Exception("Razorpay credentials not found in environment variables")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

router = APIRouter()

# Subscription Plans
SUBSCRIPTION_PLANS = {
    "free": {
        "id": "plan_free",
        "name": "Free Plan",
        "description": "Limited access with 1 free interview",
        "amount": 0,  # Free
        "currency": "INR",
        "features": [
            "1 free interview",
            "Basic feedback",
            "No access to Versant rounds",
            "Email support"
        ]
    },
    "premium": {
        "id": "plan_premium",
        "name": "Premium Plan",
        "description": "Unlimited interviews and Versant rounds access for 1 year",
        "amount": 400000,  # ₹4000 in paise
        "currency": "INR",
        "interval": "year",
        "features": [
            "Unlimited interviews",
            "Full access to Versant rounds",
            "Detailed feedback and analytics",
            "Priority support"
        ]
    }
}

async def check_user_subscription(user_id: str) -> dict:
    """Check user's subscription status and interview count"""
    try:
        # Get user details
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get interview stats
        stats = await get_interview_stats_for_user(user_id)
        completed_interviews = stats.get("completed_interviews", 0)
        
        # Get user's subscription details
        user_doc = await user_collection.find_one({"_id": ObjectId(user_id)})
        subscription_status = user_doc.get("subscription_status", "free")
        subscription_end_date = user_doc.get("subscription_end_date")
        interviews_taken = user_doc.get("interviews_taken", 0)

        # Check if subscription is active and not expired
        is_premium = (
            subscription_status == "active" 
            and subscription_end_date 
            and subscription_end_date > datetime.utcnow()
        )

        # Determine if user can take interviews
        can_take_interview = is_premium or interviews_taken < 1

        return {
            "is_premium": is_premium,
            "subscription_status": subscription_status,
            "subscription_end_date": subscription_end_date,
            "completed_interviews": completed_interviews,
            "interviews_taken": interviews_taken,
            "can_take_interview": can_take_interview,
            "can_access_versant": is_premium,  # Only premium users can access Versant
            "remaining_free_interviews": max(0, 1 - interviews_taken) if not is_premium else None,
            "plan": "premium" if is_premium else "free"  # Add plan field
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-subscription")
async def create_subscription(user_id: str = None, coupon_code: Optional[str] = None):
    """Create a new subscription order, optionally applying a coupon"""
    if not user_id:
        raise HTTPException(status_code=422, detail="user_id is required")
        
    try:
        # Check if user exists
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if user already has an active subscription
        subscription = await check_user_subscription(user_id)
        if subscription["is_premium"]:
            raise HTTPException(
                status_code=400, 
                detail="User already has an active subscription"
            )

        # Always use premium plan - no custom plans allowed
        plan = SUBSCRIPTION_PLANS["premium"]
        amount = plan["amount"]  # Base amount in paise

        # Apply coupon if provided
        if coupon_code:
            coupon = await get_coupon_by_code(coupon_code)
            if not coupon or not coupon.get("active", True):
                raise HTTPException(status_code=400, detail="Invalid or inactive coupon")
            # Check date validity
            now = datetime.utcnow()
            if coupon.get("valid_from") and coupon["valid_from"] > now:
                raise HTTPException(status_code=400, detail="Coupon not yet active")
            if coupon.get("valid_to") and coupon["valid_to"] < now:
                raise HTTPException(status_code=400, detail="Coupon expired")

            if coupon.get("discount_percent"):
                amount = int(amount * (1 - coupon["discount_percent"] / 100))
            else:
                amount = max(0, amount - coupon.get("discount_amount", 0))

        # Create order with discounted amount
        order_data = {
            "amount": amount,
            "currency": plan["currency"],
            "payment_capture": 1,
            "notes": {
                "user_id": user_id,
                "plan": "premium",
                "coupon": coupon_code or ""
            }
        }
        
        order = client.order.create(data=order_data)
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": RAZORPAY_KEY_ID,
            "plan": plan,
            "coupon_applied": coupon_code if coupon_code else None,
            "discounted_amount": amount
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/verify-payment")
async def verify_payment(
    payment_data: PaymentVerification = Body(...),
    user_id: str = None
):
    """Verify payment and activate subscription"""
    if not user_id:
        raise HTTPException(status_code=422, detail="user_id is required")
        
    try:
        # Verify payment signature
        params_dict = {
            'razorpay_order_id': payment_data.razorpay_order_id,
            'razorpay_payment_id': payment_data.razorpay_payment_id,
            'razorpay_signature': payment_data.razorpay_signature
        }
        
        client.utility.verify_payment_signature(params_dict)
        
        # Calculate subscription end date (1 year from now)
        current_date = datetime.utcnow()
        subscription_end_date = current_date.replace(
            year=current_date.year + 1
        )
        
        # Update user's subscription status
        result = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "subscription_status": "active",
                    "subscription_end_date": subscription_end_date,
                    "razorpay_order_id": payment_data.razorpay_order_id,
                    "razorpay_payment_id": payment_data.razorpay_payment_id,
                    "last_payment_date": current_date,
                    "updated_at": current_date,
                    "accountType": "premium"  # Set accountType to premium on payment
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to update subscription status"
            )
        
        return {
            "status": "success",
            "message": "Payment verified and subscription activated",
            "subscription_end_date": subscription_end_date
        }
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Payment verification failed: {str(e)}"
        )

@router.get("/subscription-status/{user_id}")
async def get_subscription_status(user_id: str):
    """Get user's subscription status and limits"""
    return await check_user_subscription(user_id)

@router.get("/subscription-plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return SUBSCRIPTION_PLANS 





