from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import Optional, List, Dict, Tuple
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timedelta
import asyncio




# Load environment variables
load_dotenv()

# MongoDB connection URL
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
# MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://user:user@cluster0.6u1sruh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "interview_platform")

# Create Motor client
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collections
interview_collection = database.interviews
user_collection = database.users
token_blacklist = database.token_blacklist
profile_collection = database.profiles
feedback_collection = database.feedback
coupon_collection = database.coupons

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create default admin user if it doesn't exist
async def create_default_admin():
    """Create default admin user if it doesn't exist"""
    try:
        admin_email = "admin@hirevio.com"
        admin_exists = await user_collection.find_one({"email": admin_email})
        
        if not admin_exists:
            # Hash password directly using CryptContext
            hashed_password = pwd_context.hash("admin123")
            
            admin_data = {
                "fullName": "Admin User",
                "username": "admin",
                "email": admin_email,
                "password": hashed_password,
                "accountType": "admin",
                "subscription_status": "premium",
                "subscription_end_date": None,
                "interviews_taken": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await user_collection.insert_one(admin_data)
            print("Default admin user created successfully")
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")

# Initialize admin user asynchronously
async def init_admin():
    try:
        await create_default_admin()
    except Exception as e:
        print(f"Error during admin initialization: {str(e)}")

# Create default admin during startup - properly handle async
import asyncio
try:
    loop = asyncio.get_event_loop()
    loop.create_task(init_admin())
except Exception as e:
    print(f"Error setting up admin creation task: {str(e)}")

# Helper function to convert ObjectId to string
def interview_helper(interview) -> dict:
    if interview:
        # Auto-generate interview title and job role if not present
        interview_title = interview.get("interview_title") or f"{interview['sub_job_category']} Interview"
        job_role = interview.get("job_role") or interview['sub_job_category']
        
        return {
            "id": str(interview["_id"]),
            "user_id": str(interview.get("user_id", "")),
            "interview_title": interview_title,
            "job_role": job_role,
            "company_name": interview.get("company_name"),
            "interview_focus": interview["interview_focus"],
            "difficulty_level": interview["difficulty_level"],
            "duration": interview["duration"],
            "job_category": interview["job_category"],
            "sub_job_category": interview["sub_job_category"],
            "created_at": interview.get("created_at"),
            "updated_at": interview.get("updated_at")
        }
    return None

def user_helper(user) -> dict:
    if user:
        return {
            "id": str(user["_id"]),
            "fullName": user["fullName"],
            "username": user["username"],
            "email": user["email"],
            "password": user["password"],  # Include password for login verification
            "accountType": user["accountType"],
            "subscription_status": user.get("subscription_status", "free"),  # Add subscription status
            "subscription_end_date": user.get("subscription_end_date"),  # Add subscription end date
            "interviews_taken": user.get("interviews_taken", 0),  # Track interviews taken
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }
    return None

# User database operations
async def add_user(user_data: dict) -> dict:
    """Add a new user to the database."""
    # Hash the password
    user_data["password"] = pwd_context.hash(user_data["password"])
    
    # Add default subscription fields
    user_data.update({
        "subscription_status": "free",
        "subscription_end_date": None,
        "interviews_taken": 0
    })
    
    # Add user to database
    user = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": user.inserted_id})
    return user_helper(new_user)

async def get_user_by_email(email: str) -> Optional[dict]:
    """Get a user by email."""
    user = await user_collection.find_one({"email": email})
    return user_helper(user) if user else None

async def get_user_by_username(username: str) -> Optional[dict]:
    """Get a user by username."""
    user = await user_collection.find_one({"username": username})
    return user_helper(user) if user else None

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get a user by ID."""
    try:
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        return user_helper(user) if user else None
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None

async def update_user_password(user_id: str, new_password: str) -> bool:
    """Update user's password."""
    try:
        hashed_password = pwd_context.hash(new_password)
        result = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "password": hashed_password,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating password: {e}")
        return False

async def get_user_by_email_or_username(identifier: str) -> Optional[dict]:
    """Get a user by email or username."""
    # Try to find by email first
    user = await user_collection.find_one({"email": identifier})
    if user:
        return user_helper(user)
    
    # If not found by email, try username
    user = await user_collection.find_one({"username": identifier})
    return user_helper(user) if user else None

async def increment_user_interview_count(user_id: str) -> bool:
    """Increment the number of interviews taken by a user"""
    try:
        result = await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"interviews_taken": 1}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error incrementing interview count: {e}")
        return False

# Database operations
async def add_interview(interview_data: dict) -> dict:
    """Add a new interview to the database."""
    interview = await interview_collection.insert_one(interview_data)
    new_interview = await interview_collection.find_one({"_id": interview.inserted_id})
    return interview_helper(new_interview)

async def retrieve_interview(id: str) -> dict:
    """Retrieve an interview by ID."""
    interview = await interview_collection.find_one({"_id": ObjectId(id)})
    if interview:
        return interview_helper(interview)
    return None

async def get_total_interviews() -> int:
    """Get total count of interviews."""
    return await interview_collection.count_documents({})

async def retrieve_all_interviews() -> List[dict]:
    """Retrieve all interviews sorted by creation date (newest first)."""
    interviews = []
    cursor = interview_collection.find().sort("created_at", -1)
    async for interview in cursor:
        interviews.append(interview_helper(interview))
    return interviews

async def update_interview(id: str, data: dict):
    """Update an interview by ID."""
    # Return false if an empty request body is sent.
    if len(data) < 1:
        return False

    interview = await interview_collection.find_one({"_id": ObjectId(id)})
    if interview:
        updated_interview = await interview_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        if updated_interview:
            return True
    return False

async def delete_interview(id: str) -> bool:
    """Delete an interview from the database."""
    interview = await interview_collection.find_one({"_id": ObjectId(id)})
    if interview:
        await interview_collection.delete_one({"_id": ObjectId(id)})
        return True
    return False

async def search_interviews(
    query: Optional[str] = None,
    job_category: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    duration: Optional[str] = None
) -> List[dict]:
    """Search interviews with various filters."""
    filter_query = {}
    
    if query:
        filter_query["$or"] = [
            {"interview_title": {"$regex": query, "$options": "i"}},
            {"job_role": {"$regex": query, "$options": "i"}},
            {"company_name": {"$regex": query, "$options": "i"}}
        ]
    
    if job_category:
        filter_query["job_category"] = job_category
    
    if difficulty_level:
        filter_query["difficulty_level"] = difficulty_level
    
    if duration:
        filter_query["duration"] = duration

    interviews = []
    async for interview in interview_collection.find(filter_query):
        interviews.append(interview_helper(interview))
    return interviews

# New interview-related database operations
def get_all_interviews() -> List[dict]:
    interviews = list(interview_collection.find())
    for interview in interviews:
        interview["_id"] = str(interview["_id"])
    return interviews

def create_interview(interview_data: dict) -> dict:
    interview_data["created_at"] = datetime.utcnow()
    interview_data["updated_at"] = datetime.utcnow()
    # user_id should be set by the caller
    result = interview_collection.insert_one(interview_data)
    interview_data["_id"] = str(result.inserted_id)
    return interview_data

def get_interview_by_id(interview_id: str) -> Optional[dict]:
    interview = interview_collection.find_one({"_id": ObjectId(interview_id)})
    if interview:
        interview["_id"] = str(interview["_id"])
    return interview

def update_interview(interview_id: str, interview_data: dict) -> Optional[dict]:
    interview_data["updated_at"] = datetime.utcnow()
    result = interview_collection.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": interview_data}
    )
    if result.modified_count > 0:
        return get_interview_by_id(interview_id)
    return None

def delete_interview(interview_id: str) -> bool:
    result = interview_collection.delete_one({"_id": ObjectId(interview_id)})
    return result.deleted_count > 0

# Token blacklist operations
async def add_to_blacklist(token: str) -> bool:
    """Add a token to the blacklist."""
    try:
        # Set expiration time (24 hours from now)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Add token to blacklist
        await token_blacklist.insert_one({
            "token": token,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
        })
        
        # Clean up expired tokens
        await token_blacklist.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        
        return True
    except Exception as e:
        print(f"Error adding token to blacklist: {e}")
        return False

async def is_token_blacklisted(token: str) -> bool:
    """Check if a token is in the blacklist."""
    try:
        # Check if token exists in blacklist
        blacklisted = await token_blacklist.find_one({"token": token})
        
        if blacklisted:
            # If token is expired, remove it from blacklist
            if blacklisted["expires_at"] < datetime.utcnow():
                await token_blacklist.delete_one({"token": token})
                return False
            return True
            
        return False
    except Exception as e:
        print(f"Error checking token blacklist: {e}")
        return False

# Profile helper

def profile_helper(profile) -> dict:
    if profile:
        return {
            "id": str(profile["_id"]),
            "user_id": str(profile["user_id"]),
            "profile_photo": profile.get("profile_photo"),
            "full_name": profile.get("full_name"),
            "email": profile.get("email"),
            "phone": profile.get("phone"),
            "location": profile.get("location"),
            "role": profile.get("role"),
            "experience_level": profile.get("experience_level"),
            "course_name": profile.get("course_name"),
            "college_name": profile.get("college_name"),
            "branch_name": profile.get("branch_name"),
            "roll_number": profile.get("roll_number"),
            "year_of_passing": profile.get("year_of_passing"),
            "profile_completed": profile.get("profile_completed", False),
            "completed_interviews": profile.get("completed_interviews", 0),
            "hours_practiced": profile.get("hours_practiced", 0.0),
            "average_score": profile.get("average_score", 0),
            "total_score": profile.get("total_score", 0),
            "scores": profile.get("scores", [])  # Array of all scores
        }
    return None

# Profile database operations
async def create_profile(profile_data: dict) -> dict:
    """Create a new profile with default stats"""
    profile_data.update({
        "completed_interviews": 0,
        "hours_practiced": 0.0,
        "average_score": 0,
        "total_score": 0,
        "scores": [],  # Initialize empty scores array
        "profile_completed": False  # Set profile_completed to False by default
    })
    profile = await profile_collection.insert_one(profile_data)
    new_profile = await profile_collection.find_one({"_id": profile.inserted_id})
    return profile_helper(new_profile)

async def get_profile_by_user_id(user_id: str) -> dict:
    """Get user profile with updated statistics"""
    profile = await profile_collection.find_one({"user_id": user_id})
    if profile:
        # Get feedback stats
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "total_score": {"$sum": "$overall_score"},
                "total_interviews": {"$sum": 1},
                "total_minutes": {
                    "$sum": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$metadata.duration"}, "string"]},
                            "then": {
                                "$toInt": {
                                    "$replaceAll": {
                                        "input": "$metadata.duration",
                                        "find": "min",
                                        "replacement": ""
                                    }
                                }
                            },
                            "else": 10  # Default to 10 minutes if duration not found
                        }
                    }
                }
            }}
        ]
        feedback_stats = await feedback_collection.aggregate(pipeline).to_list(length=1)
        
        # Calculate stats
        if feedback_stats:
            total_score = feedback_stats[0]["total_score"]
            total_interviews = feedback_stats[0]["total_interviews"]
            total_minutes = feedback_stats[0]["total_minutes"]
            average_score = round(total_score / total_interviews, 2) if total_interviews > 0 else 0
            hours_practiced = round(total_minutes / 60, 2)
            
            # Update profile with latest stats
            profile.update({
                "total_score": total_score,
                "average_score": average_score,
                "completed_interviews": total_interviews,
                "hours_practiced": hours_practiced
            })
        else:
            # Set default values if no feedback exists
            profile.update({
                "total_score": 0,
                "average_score": 0,
                "completed_interviews": 0,
                "hours_practiced": 0.0
            })
        
        return profile_helper(profile)
    return None

async def update_profile_by_user_id(user_id: str, update_data: dict) -> dict:
    """Update profile and check if all required fields are filled"""
    # Get current profile
    current_profile = await profile_collection.find_one({"user_id": user_id})
    
    # Update the profile with new data
    merged_profile = {**current_profile, **update_data} if current_profile else update_data
    
    # Check if all required fields are filled
    required_fields = [
        'full_name',
        'course_name',
        'college_name',
        'branch_name',
        'roll_number',
        'year_of_passing'
    ]
    
    # Calculate profile_completed status
    profile_completed = all(merged_profile.get(field) for field in required_fields)
    
    # Add profile_completed to update data
    update_data['profile_completed'] = profile_completed
    
    # Update the profile
    await profile_collection.update_one(
        {"user_id": user_id}, 
        {"$set": update_data}
    )
    
    # Get and return updated profile
    profile = await profile_collection.find_one({"user_id": user_id})
    return profile_helper(profile)

# Aggregate interview stats for a user
async def get_interview_stats_for_user(user_id: str) -> dict:
    """Get interview statistics for a user"""
    try:
        # Get feedback stats with aggregation
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "completed_interviews": {"$sum": 1},
                "total_minutes": {
                    "$sum": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$metadata.duration"}, "string"]},
                            "then": {
                                "$toInt": {
                                    "$replaceAll": {
                                        "input": "$metadata.duration",
                                        "find": "min",
                                        "replacement": ""
                                    }
                                }
                            },
                            "else": 10  # Default to 10 minutes if duration not found
                        }
                    }
                }
            }}
        ]
        
        stats = await feedback_collection.aggregate(pipeline).to_list(length=1)
        
        if stats:
            completed_interviews = stats[0]["completed_interviews"]
            total_minutes = stats[0]["total_minutes"]
            hours_practiced = round(total_minutes / 60, 2)
        else:
            completed_interviews = 0
            hours_practiced = 0.0
        
        return {
            "completed_interviews": completed_interviews,
            "hours_practiced": hours_practiced
        }
    except Exception as e:
        print(f"Error calculating interview stats: {e}")
        return {
            "completed_interviews": 0,
            "hours_practiced": 0.0
        }

def feedback_helper(feedback) -> dict:
    """Helper function to format feedback document"""
    if feedback:
        return {
            "id": str(feedback["_id"]),
            "user_id": str(feedback["user_id"]),
            "interview_id": str(feedback["interview_id"]),
            "overall_score": feedback["overall_score"],
            "analysis": feedback["analysis"],
            "summary": {
                "overall_score": feedback["summary"]["overall_score"],
                "current_status": feedback["summary"]["current_status"],
                "timeline_to_ready": feedback["summary"]["timeline_to_ready"],
                "confidence_level": feedback["summary"]["confidence_level"]
            },
            "metadata": {
                "job_role": feedback["metadata"]["job_role"],
                "difficulty_level": feedback["metadata"]["difficulty_level"],
                "total_questions": feedback["metadata"]["total_questions"],
                "interview_focus": feedback["metadata"]["interview_focus"],
                "job_category": feedback["metadata"].get("job_category"),
                "sub_job_category": feedback["metadata"].get("sub_job_category"),
                "duration": feedback["metadata"].get("duration")
            },
            "responses": feedback.get("responses", []),
            "created_at": feedback["created_at"],
            "updated_at": feedback["updated_at"]
        }
    return None

async def create_interview_feedback(feedback_data: dict) -> dict:
    """Create a new interview feedback entry"""
    try:
        # Add timestamps
        feedback_data["created_at"] = datetime.utcnow()
        feedback_data["updated_at"] = datetime.utcnow()
        
        # Insert feedback
        feedback = await feedback_collection.insert_one(feedback_data)
        new_feedback = await feedback_collection.find_one({"_id": feedback.inserted_id})
        return feedback_helper(new_feedback)
    except Exception as e:
        print(f"Error creating interview feedback: {e}")
        return None

async def get_feedback_by_id(feedback_id: str) -> dict:
    """Retrieve feedback by ID"""
    try:
        feedback = await feedback_collection.find_one({"_id": ObjectId(feedback_id)})
        return feedback_helper(feedback)
    except Exception as e:
        print(f"Error getting feedback by ID: {e}")
        return None

async def get_user_feedback_history(user_id: str) -> List[dict]:
    """Get all feedback for a specific user"""
    try:
        feedback_list = []
        cursor = feedback_collection.find({"user_id": user_id}).sort("created_at", -1)
        async for feedback in cursor:
            feedback_list.append(feedback_helper(feedback))
        return feedback_list
    except Exception as e:
        print(f"Error getting user feedback history: {e}")
        return []

async def get_interview_feedback(interview_id: str) -> dict:
    """Get feedback for a specific interview"""
    try:
        feedback = await feedback_collection.find_one({"interview_id": interview_id})
        return feedback_helper(feedback)
    except Exception as e:
        print(f"Error getting interview feedback: {e}")
        return None

async def get_user_feedback_stats(user_id: str) -> dict:
    """Get aggregated feedback stats for a user"""
    try:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "average_score": {"$avg": "$overall_score"},
                "total_score": {"$sum": "$overall_score"},
                "total_interviews": {"$sum": 1},
                "highest_score": {"$max": "$overall_score"},
                "lowest_score": {"$min": "$overall_score"},
                "recent_scores": {"$push": {
                    "score": "$overall_score",
                    "date": "$created_at"
                }}
            }},
            {"$project": {
                "_id": 0,
                "average_score": {"$round": ["$average_score", 1]},
                "total_score": 1,
                "total_interviews": 1,
                "highest_score": 1,
                "lowest_score": 1,
                "recent_scores": {"$slice": ["$recent_scores", -5]}  # Last 5 scores
            }}
        ]
        
        result = await feedback_collection.aggregate(pipeline).to_list(length=1)
        if result:
            return result[0]
        return {
            "average_score": 0,
            "total_score": 0,
            "total_interviews": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "recent_scores": []
        }
    except Exception as e:
        print(f"Error getting user feedback stats: {e}")
        return None

async def update_feedback(feedback_id: str, update_data: dict) -> dict:
    """Update existing feedback"""
    try:
        update_data["updated_at"] = datetime.utcnow()
        result = await feedback_collection.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": update_data}
        )
        if result.modified_count > 0:
            return await get_feedback_by_id(feedback_id)
        return None
    except Exception as e:
        print(f"Error updating feedback: {e}")
        return None

async def delete_feedback(feedback_id: str) -> bool:
    """Delete feedback entry"""
    try:
        result = await feedback_collection.delete_one({"_id": ObjectId(feedback_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting feedback: {e}")
        return False

async def update_interview_stats(user_id: str, duration_minutes: int, feedback_score: int) -> bool:
    """Update user's interview statistics"""
    try:
        # Get current profile
        profile = await profile_collection.find_one({"user_id": user_id})
        
        if not profile:
            return False
            
        # Calculate hours practiced (convert minutes to hours)
        hours_to_add = duration_minutes / 60.0
        
        # Get current stats
        current_interviews = profile.get("completed_interviews", 0)
        current_hours = profile.get("hours_practiced", 0.0)
        current_scores = profile.get("scores", [])  # Get existing scores array
        
        # Update stats
        new_interviews = current_interviews + 1
        new_hours = current_hours + hours_to_add
        new_scores = current_scores + [feedback_score]  # Add new score to array
        new_average_score = sum(new_scores) / len(new_scores)  # Calculate new average
        
        # Update profile
        result = await profile_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "completed_interviews": new_interviews,
                    "hours_practiced": round(new_hours, 2),
                    "average_score": round(new_average_score, 2),
                    "total_score": sum(new_scores),
                    "scores": new_scores  # Update scores array
                }
            }
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating interview stats: {e}")
        return False

# Helper function to convert ObjectId to string
def coupon_helper(coupon) -> dict:
    if coupon:
        return {
            "id": str(coupon["_id"]),
            "code": coupon["code"],
            "discount_amount": coupon.get("discount_amount", 0),  # in paise
            "discount_percent": coupon.get("discount_percent"),
            "valid_from": coupon.get("valid_from"),
            "valid_to": coupon.get("valid_to"),
            "active": coupon.get("active", True),
            "created_at": coupon.get("created_at"),
            "updated_at": coupon.get("updated_at")
        }
    return None

# Coupon database operations
async def create_coupon(coupon_data: dict) -> dict:
    coupon_data["created_at"] = datetime.utcnow()
    coupon_data["updated_at"] = datetime.utcnow()
    coupon = await coupon_collection.insert_one(coupon_data)
    new_coupon = await coupon_collection.find_one({"_id": coupon.inserted_id})
    return coupon_helper(new_coupon)

async def get_coupon_by_code(code: str) -> dict:
    coupon = await coupon_collection.find_one({"code": code})
    return coupon_helper(coupon)

async def list_coupons() -> list:
    coupons = []
    async for coupon in coupon_collection.find().sort("created_at", -1):
        coupons.append(coupon_helper(coupon))
    return coupons

async def update_coupon(code: str, update_data: dict) -> dict:
    update_data["updated_at"] = datetime.utcnow()
    result = await coupon_collection.update_one({"code": code}, {"$set": update_data})
    if result.modified_count:
        updated_coupon = await coupon_collection.find_one({"code": code})
        return coupon_helper(updated_coupon)
    return None

async def delete_coupon(code: str) -> bool:
    result = await coupon_collection.delete_one({"code": code})
    return result.deleted_count > 0 
