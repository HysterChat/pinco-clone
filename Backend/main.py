from fastapi import FastAPI, HTTPException, Query, Depends, Form, status, Request, Response
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from enum import Enum
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from database import (
    add_interview,
    retrieve_interview,
    retrieve_all_interviews,
    update_interview,
    delete_interview,
    search_interviews,
    get_total_interviews,
    add_user,
    get_user_by_email,
    get_user_by_username,
    verify_password,
    update_user_password,
    get_user_by_id,
    get_user_by_email_or_username,
    get_all_interviews,
    create_interview,
    get_interview_by_id,
    add_to_blacklist,
    is_token_blacklisted,
    create_profile,
    get_profile_by_user_id,
    update_profile_by_user_id,
    get_interview_stats_for_user,
    create_interview_feedback,
    update_interview_stats,
    get_user_feedback_stats,
    increment_user_interview_count
)
from passlib.context import CryptContext
import numpy as np
from scipy.io import wavfile
from scipy import signal
import tempfile
import os
import logging
import requests
import json
from dotenv import load_dotenv
import re
from openai import OpenAI
import google.generativeai as genai
import random
from payments import router as payments_router, check_user_subscription  # Import check_user_subscription
from coupons import router as coupons_router

# Load environment variables
load_dotenv()

# Setup logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Hirevio API",
    description="API for Hirevio interview platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},
    # Add these configurations:
    root_path_in_servers=False,
    redirect_slashes=False
)

# Request-Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log request
    body = await request.body()
    request_body = body.decode() if body else ""
    logger.info(f"\n{'='*50}\nREQUEST:\n{'='*50}")
    logger.info(f"Time: {datetime.now()}")
    logger.info(f"Path: {request.url.path}")
    logger.info(f"Method: {request.method}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"Query Params: {dict(request.query_params)}")
    if request_body:
        try:
            # Try to parse and pretty print JSON
            parsed_body = json.loads(request_body)
            logger.info(f"Body: {json.dumps(parsed_body, indent=2)}")
        except:
            # If not JSON, log as is
            logger.info(f"Body: {request_body}")

    # Get response
    response = await call_next(request)

    # Read and restore response body
    response_body = b""
    async for chunk in response.body_iterator:
        response_body += chunk

    # Log response
    logger.info(f"\n{'='*50}\nRESPONSE:\n{'='*50}")
    logger.info(f"Status: {response.status_code}")
    logger.info(f"Headers: {dict(response.headers)}")
    try:
        # Try to parse and pretty print JSON response
        body_str = response_body.decode()
        parsed_body = json.loads(body_str)
        logger.info(f"Body: {json.dumps(parsed_body, indent=2)}")
    except:
        # If not JSON, log as is
        logger.info(f"Body: {response_body.decode()}")
    logger.info(f"\n{'='*50}\n")

    # Reconstruct response with body
    return Response(
        content=response_body,
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.media_type
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the payments router
app.include_router(payments_router, prefix="/api/payments", tags=["payments"])

# Include the coupons router
app.include_router(coupons_router, prefix="/api/coupons", tags=["coupons"])

# Google Gemini configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    client = genai.GenerativeModel('gemini-2.0-flash-exp')
else:
    client = None
    logger.warning("GOOGLE_API_KEY not found in environment variables")

# Helper function to call Gemini API
def call_gemini_api(prompt: str, max_tokens: int = 1000) -> str:
    """Helper function to call Gemini API and return the response text"""
    try:
        if not client:
            raise Exception("Gemini client not initialized - check GOOGLE_API_KEY")
        
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=1.5
        )
        
        response = client.generate_content(prompt, generation_config=generation_config)
        
        if response and hasattr(response, 'text'):
            result_text = response.text.strip()
            
            # Check if response was truncated (common issue with long responses)
            if len(result_text) < 50:
                raise Exception("Response too short - possible truncation")
            
            # Check if response ends abruptly (indicates truncation)
            if result_text and not result_text.endswith(('.', '!', '?', '\n')):
                logger.warning("Response may have been truncated - ending abruptly")
            
            return result_text
        else:
            raise Exception("Invalid response from Gemini API")
            
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        raise e

# JWT Configuration
SECRET_KEY = "your-secret-key-here"  # Change this to a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours = 60 minutes * 24
RESET_TOKEN_EXPIRE_MINUTES = 15

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Interview questions (for local speechtotext fallback, if main LLM fails)
interview_questions = [
    "Can you introduce yourself?",
    "Why do you want to work with us?",
    "What are your strengths and weaknesses?",
    "Tell me about a project you worked on.",
    "What programming languages are you comfortable with?",
    "Where do you see yourself in 5 years?",
    "Explain the difference between procedural and object-oriented programming.",
    "What is a database? Can you name a few types?",
    "What is version control, and why is it important?",
    "How do you keep yourself updated with new technologies?"
]

class InterviewFocus(str, Enum):
    TECHNICAL = "Technical"
    BEHAVIORAL = "Behavioral"
    SYSTEM_DESIGN = "System Design"
    CODING = "Coding"
    ALGORITHMS = "Algorithms & Data Structures"
    COMMUNICATION = "Communication Skills"
    PROBLEM_SOLVING = "Problem Solving"
    LEADERSHIP = "Leadership & Management"
    DOMAIN_KNOWLEDGE = "Domain Knowledge (e.g., Cloud, Security)"
    TESTING = "Testing & Debugging"

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advance"

class Duration(str, Enum):
    TEN_MIN = "10min"
    TWENTY_MIN = "20min"
    THIRTY_MIN = "30min"

class JobCategory(str, Enum):
    SOFTWARE_ENGINEERING = "Software Engineering"
    DATA_SCIENCE = "Data Science"
    PRODUCT_MANAGEMENT = "Product Management"
    QUALITY_ASSURANCE = "Quality Assurance"
    UI_UX_DESIGN = "UI/UX Design"
    CYBERSECURITY = "Cybersecurity"
    CUSTOMER_SERVICE = "Customer Service"
    FINANCE = "Finance"

class SubJobCategory(str, Enum):
    # Software Engineering
    BACKEND_DEVELOPER = "Backend Developer"
    FRONTEND_DEVELOPER = "Frontend Developer"
    FULLSTACK_DEVELOPER = "Fullstack Developer"
    MOBILE_DEVELOPER = "Mobile Developer"
    DEVOPS_ENGINEER = "DevOps Engineer"
    # Data Science
    DATA_ANALYST = "Data Analyst"
    DATA_ENGINEER = "Data Engineer"
    ML_ENGINEER = "Machine Learning Engineer"
    AI_RESEARCHER = "AI Researcher"
    # Product Management
    TECHNICAL_PM = "Technical PM"
    GROWTH_PM = "Growth PM"
    PRODUCT_OWNER = "Product Owner"
    # Quality Assurance
    MANUAL_TESTER = "Manual Tester"
    AUTOMATION_ENGINEER = "Automation Engineer"
    PERFORMANCE_TESTER = "Performance Tester"
    # UI/UX Design
    UX_DESIGNER = "UX Designer"
    UI_DESIGNER = "UI Designer"
    INTERACTION_DESIGNER = "Interaction Designer"
    # Cybersecurity
    SECURITY_ANALYST = "Security Analyst"
    PENETRATION_TESTER = "Penetration Tester"
    COMPLIANCE_SPECIALIST = "Compliance Specialist"
    # Customer Service
    SUPPORT_SPECIALIST = "Support Specialist"
    CUSTOMER_SUCCESS_MANAGER = "Customer Success Manager"
    # Finance
    ACCOUNTANT = "Accountant"
    FINANCIAL_ANALYST = "Financial Analyst"
    AUDITOR = "Auditor"

class ScoresResponse(BaseModel):
    scores: list = []  # Array of all scores

class InterviewForm(BaseModel):
    company_name: Optional[str] = None
    interview_focus: List[InterviewFocus]
    difficulty_level: DifficultyLevel
    duration: Duration
    job_category: JobCategory
    sub_job_category: SubJobCategory

    class Config:
        use_enum_values = True

class InterviewListResponse(BaseModel):
    status: str
    total: int
    page: int
    per_page: int
    data: List[Dict]

class AccountType(str, Enum):
    ADMIN = "admin"
    EMPLOYER = "employer"
    FREE_USER = "free_user"

class UserRegistration(BaseModel):
    fullName: str
    username: str
    email: EmailStr
    password: str
    accountType: AccountType = AccountType.FREE_USER  # Set default to FREE_USER

class UserResponse(BaseModel):
    id: str
    fullName: str
    username: str
    email: EmailStr
    accountType: AccountType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordReset(BaseModel):
    email: EmailStr

class NewPassword(BaseModel):
    token: str
    new_password: str

class LoginRequest(BaseModel):
    identifier: str  # Can be email or username
    password: str

class ProfileCreate(BaseModel):
    profile_photo: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None
    experience_level: Optional[str] = None
    course_name: Optional[str] = None
    college_name: Optional[str] = None
    branch_name: Optional[str] = None
    roll_number: Optional[str] = None
    year_of_passing: Optional[str] = None
    profile_completed: bool = False

class ProfileUpdate(BaseModel):
    profile_photo: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None
    experience_level: Optional[str] = None
    course_name: Optional[str] = None
    college_name: Optional[str] = None
    branch_name: Optional[str] = None
    roll_number: Optional[str] = None
    year_of_passing: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    profile_photo: Optional[str]
    full_name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    location: Optional[str]
    role: Optional[str]
    experience_level: Optional[str]
    course_name: Optional[str]
    college_name: Optional[str]
    branch_name: Optional[str]
    roll_number: Optional[str]
    year_of_passing: Optional[str]
    profile_completed: bool = False
    completed_interviews: int = 0
    hours_practiced: float = 0.0
    average_score: float = 0.0
    total_score: float = 0.0

class InterviewSessionData(BaseModel):
    duration: Duration
    difficulty_level: DifficultyLevel
    company_name: Optional[str] = None
    interview_focus: List[InterviewFocus]
    job_category: JobCategory
    sub_job_category: SubJobCategory

class InterviewResponse(BaseModel):
    question: str
    answer: str

class InterviewAnalysisRequest(BaseModel):
    responses: List[InterviewResponse]
    job_role: str
    interview_focus: List[str]
    difficulty_level: str

class ReadingTestResponse(BaseModel):
    sentences: List[str]
    difficulty_level: str

class RepeatSentenceResponse(BaseModel):
    sentences: List[str]
    difficulty_level: str

class ShortAnswerResponse(BaseModel):
    questions: List[str]
    difficulty_level: str

class VersantFeedbackRequest(BaseModel):
    sentences: List[str]

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.debug('DEBUG: TOKEN:', token)
        # Check if token is blacklisted
        if await is_token_blacklisted(token):
            logger.debug('DEBUG: Token is blacklisted')
            raise credentials_exception
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        logger.debug('DEBUG: Username from token:', username)
        if username is None:
            logger.debug('DEBUG: Username is None')
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError as e:
        logger.debug('DEBUG: JWTError:', e)
        raise credentials_exception
    user = await get_user_by_username(token_data.username)
    logger.debug('DEBUG: User from DB:', user)
    if user is None:
        logger.debug('DEBUG: User not found in DB')
        raise credentials_exception
    return user

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.post("/api/interview-form")
async def create_interview_form(form_data: InterviewForm, current_user: dict = Depends(get_current_user)):
    """Create a new interview form"""
    try:
        # Add timestamps and user_id
        interview_dict = form_data.dict()
        interview_dict["created_at"] = datetime.utcnow()
        interview_dict["updated_at"] = datetime.utcnow()
        interview_dict["user_id"] = current_user["id"]
        
        # Set interview title and job role based on job category and sub category
        interview_dict["interview_title"] = f"{interview_dict['sub_job_category']} Interview"
        interview_dict["job_role"] = interview_dict["sub_job_category"]
        
        # Save to database
        result = await add_interview(interview_dict)
        return {
            "status": "success", 
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/interview-form/{interview_id}")
async def get_interview(interview_id: str):
    """Get a specific interview by ID"""
    try:
        interview = await retrieve_interview(interview_id)
        if interview:
            return {
                "status": "success", 
                "data": interview
            }
        raise HTTPException(status_code=404, detail="Interview not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/interview-forms")
async def get_all_interviews():
    """Get all interviews"""
    try:
        interviews = await retrieve_all_interviews()
        return {
            "status": "success",
            "data": interviews
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Failed to fetch interviews",
                "error": str(e)
            }
        )

@app.put("/api/interview-form/{interview_id}")
async def update_interview_form(interview_id: str, form_data: InterviewForm):
    """Update an interview"""
    try:
        interview_dict = form_data.dict()
        interview_dict["updated_at"] = datetime.utcnow()
        
        updated = await update_interview(interview_id, interview_dict)
        if updated:
            return {"status": "success", "message": "Interview updated successfully"}
        raise HTTPException(status_code=404, detail="Interview not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/interview-form/{interview_id}")
async def delete_interview_form(interview_id: str):
    """Delete an interview"""
    try:
        deleted = await delete_interview(interview_id)
        if deleted:
            return {"status": "success", "message": "Interview deleted successfully"}
        raise HTTPException(status_code=404, detail="Interview not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/interview-forms/search")
async def search_interview_forms(
    query: Optional[str] = None,
    job_category: Optional[JobCategory] = None,
    difficulty_level: Optional[DifficultyLevel] = None,
    duration: Optional[Duration] = None
):
    """Search interviews with filters"""
    try:
        interviews = await search_interviews(
            query=query,
            job_category=job_category.value if job_category else None,
            difficulty_level=difficulty_level.value if difficulty_level else None,
            duration=duration.value if duration else None
        )
        return {"status": "success", "data": interviews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/form-options")
async def get_form_options():
    """Get all possible values for dropdowns"""
    return {
        "interview_focus": [focus.value for focus in InterviewFocus],
        "difficulty_levels": [level.value for level in DifficultyLevel],
        "durations": [duration.value for duration in Duration],
        "job_categories": [category.value for category in JobCategory],
        "sub_job_categories": {
            JobCategory.SOFTWARE_ENGINEERING.value: [
                SubJobCategory.BACKEND_DEVELOPER.value,
                SubJobCategory.FRONTEND_DEVELOPER.value,
                SubJobCategory.FULLSTACK_DEVELOPER.value,
                SubJobCategory.MOBILE_DEVELOPER.value,
                SubJobCategory.DEVOPS_ENGINEER.value
            ],
            JobCategory.DATA_SCIENCE.value: [
                SubJobCategory.DATA_ANALYST.value,
                SubJobCategory.DATA_ENGINEER.value,
                SubJobCategory.ML_ENGINEER.value,
                SubJobCategory.AI_RESEARCHER.value
            ],
            JobCategory.PRODUCT_MANAGEMENT.value: [
                SubJobCategory.TECHNICAL_PM.value,
                SubJobCategory.GROWTH_PM.value,
                SubJobCategory.PRODUCT_OWNER.value
            ],
            JobCategory.QUALITY_ASSURANCE.value: [
                SubJobCategory.MANUAL_TESTER.value,
                SubJobCategory.AUTOMATION_ENGINEER.value,
                SubJobCategory.PERFORMANCE_TESTER.value
            ],
            JobCategory.UI_UX_DESIGN.value: [
                SubJobCategory.UX_DESIGNER.value,
                SubJobCategory.UI_DESIGNER.value,
                SubJobCategory.INTERACTION_DESIGNER.value
            ],
            JobCategory.CYBERSECURITY.value: [
                SubJobCategory.SECURITY_ANALYST.value,
                SubJobCategory.PENETRATION_TESTER.value,
                SubJobCategory.COMPLIANCE_SPECIALIST.value
            ],
            JobCategory.CUSTOMER_SERVICE.value: [
                SubJobCategory.SUPPORT_SPECIALIST.value,
                SubJobCategory.CUSTOMER_SUCCESS_MANAGER.value
            ],
            JobCategory.FINANCE.value: [
                SubJobCategory.ACCOUNTANT.value,
                SubJobCategory.FINANCIAL_ANALYST.value,
                SubJobCategory.AUDITOR.value
            ]
        }
    }

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        # Check if email already exists
        existing_email = await get_user_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Check if username already exists
        existing_username = await get_user_by_username(user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already taken"
            )
        
        # Add timestamps
        user_dict = user_data.dict()
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        
        # Save to database
        result = await add_user(user_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user with email/username and password"""
    user = await get_user_by_email_or_username(form_data.username)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/forgot-password")
async def forgot_password(reset_request: PasswordReset):
    """Send password reset email"""
    user = await get_user_by_email(reset_request.email)
    if not user:
        # Don't reveal that the email doesn't exist
        return {"message": "If your email is registered, you will receive a password reset link"}
    
    # Create reset token
    reset_token_expires = timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    reset_token = create_access_token(
        data={"sub": user["username"], "type": "reset"}, 
        expires_delta=reset_token_expires
    )
    
    # In a real application, you would send this token via email
    # For testing, we'll return it in the response
    return {
        "message": "If your email is registered, you will receive a password reset link",
        "reset_token": reset_token  # Remove this in production
    }

@app.post("/api/auth/reset-password")
async def reset_password(new_password: NewPassword):
    """Reset password using token"""
    try:
        # Verify token
        payload = jwt.decode(new_password.token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if username is None or token_type != "reset":
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired reset token"
            )
        
        # Update password
        user = await get_user_by_username(username)
        if not user:
            raise HTTPException(
                status_code=400,
                detail="User not found"
            )
        
        await update_user_password(user["id"], new_password.new_password)
        return {"message": "Password has been reset successfully"}
        
    except JWTError:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

# Protected route example
@app.get("/api/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.get("/api/interview-forms")
async def get_interviews(current_user: dict = Depends(get_current_user)):
    interviews = get_all_interviews()
    return interviews

@app.post("/api/interview-forms")
async def create_new_interview(interview_data: dict, current_user: dict = Depends(get_current_user)):
    interview_data["user_id"] = current_user["id"]
    interview = create_interview(interview_data)
    return interview

@app.get("/api/interview-forms/{interview_id}")
async def get_interview(interview_id: str, current_user: dict = Depends(get_current_user)):
    interview = get_interview_by_id(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@app.put("/api/interview-forms/{interview_id}")
async def update_interview_form(interview_id: str, interview_data: dict, current_user: dict = Depends(get_current_user)):
    updated_interview = update_interview(interview_id, interview_data)
    if not updated_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return updated_interview

@app.delete("/api/interview-forms/{interview_id}")
async def delete_interview_form(interview_id: str, current_user: dict = Depends(get_current_user)):
    deleted = delete_interview(interview_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interview not found")
    return {"message": "Interview deleted successfully"}

@app.get("/api/profile/me", response_model=ProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    try:
        profile = await get_profile_by_user_id(current_user["id"])
        if not profile:
            # Create a default profile if not exists
            profile_data = {
                "user_id": current_user["id"],
                "profile_photo": None,
                "full_name": current_user.get("fullName"),
                "email": current_user.get("email"),
                "phone": None,
                "location": None,
                "role": None,
                "experience_level": None,
                "course_name": None,
                "college_name": None,
                "branch_name": None,
                "roll_number": None,
                "year_of_passing": None,
                "profile_completed": False
            }
            profile = await create_profile(profile_data)
        
        # Get interview stats (for hours practiced)
        interview_stats = await get_interview_stats_for_user(current_user["id"])
        
        # Get feedback stats (for scores)
        feedback_stats = await get_user_feedback_stats(current_user["id"])
        
        # Merge all stats
        profile.update({
            "completed_interviews": interview_stats["completed_interviews"],
            "hours_practiced": interview_stats["hours_practiced"],
            "average_score": feedback_stats["average_score"] if feedback_stats else 0,
            "total_score": feedback_stats["total_score"] if feedback_stats else 0
        })
        
        return profile
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch profile data"
        )

@app.put("/api/profile/me", response_model=ProfileResponse)
async def update_my_profile(update: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        profile = await update_profile_by_user_id(current_user["id"], update_data)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )
        
        stats = await get_interview_stats_for_user(current_user["id"])
        profile["completed_interviews"] = stats["completed_interviews"]
        profile["hours_practiced"] = stats["hours_practiced"]
        
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update profile"
        )

def calculate_questions_for_duration(duration: str) -> int:
    """Calculate number of questions based on duration (1.5 min per question)"""
    duration_minutes = int(duration.replace("min", ""))
    return int(duration_minutes / 1.5)

def build_prompt(data: dict) -> str:
    duration_minutes = int(data['duration'].replace("min", ""))
    total_questions = int(duration_minutes / 1.0)  # 1.0 minutes per question
    randomizer = random.randint(1000, 9999)  # Add a random number to the prompt

    prompt = f"""
You are a professional technical interviewer for {data['company_name'] or 'a tech company'}.
You are conducting a {data['difficulty_level']} level interview for a {data['sub_job_category']} role in the {data['job_category']} domain.
The interview should last approximately {data['duration']} and include exactly {total_questions} questions.

[Session ID: {randomizer}]  # This line adds randomness. Use it to make the questions different every time, even for the same interview config.

Follow this question structure **strictly**:
1. Begin with 2 [Introduction] questions (e.g., "Tell me about yourself", "Why this role?")
2. Add 1 [Behavioral] question (e.g., problem-solving, teamwork, stress-handling)
3. Add 1 [Communication] question (e.g., explaining technical ideas, handling disagreements)
4. Add {total_questions - 5} [Technical] questions focused on {', '.join(data['interview_focus'])} — relevant to a {data['sub_job_category']} role in {data['job_category']}
5. End with 1 [Closing] question (e.g., "Do you have any questions for us?")

**Formatting rules**:
- Number each question (1 to {total_questions})
- Label the category in square brackets like this:
  `1. [Introduction] Tell me about yourself.`
- Do **not** add any introductions, summaries, or extra text. Just list the questions only.
- Ensure the [Technical] questions match the {data['difficulty_level']} level and reflect industry-standard tools, practices, and technologies used in {data['job_category']}, especially for {data['sub_job_category']} roles.

Now, generate exactly {total_questions} interview questions as per the instructions above.
"""
    return prompt

def get_interview_question(session_data: InterviewSessionData):
    data = session_data.dict()
    prompt = build_prompt(data)

    try:
        # Use Gemini API helper function
        questions = call_gemini_api(prompt, max_tokens=800)
        
        # Parse the questions into a structured format
        questions_list = questions.split('\n')
        questions_list = [q.strip() for q in questions_list if q.strip()]
        
        return {
            "interview_duration": session_data.duration,
            "time_per_question": "1.5 minutes",
            "total_questions": len(questions_list),
            "questions": questions_list
        }
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return {"error": f"Error: {str(e)}"}

@app.post("/api/generate-question")
async def generate_question_endpoint(session_data: InterviewSessionData, current_user: dict = Depends(get_current_user)):
    """Endpoint to generate interview questions based on session data"""
    try:
        # Check subscription status
        subscription = await check_user_subscription(current_user["id"])
        
        if not subscription["can_take_interview"]:
            if subscription["is_premium"]:
                raise HTTPException(
                    status_code=403,
                    detail="Your premium subscription has expired. Please renew to continue."
                )
            else:
                raise HTTPException(
                    status_code=403,
                    detail=f"Free trial expired. You have used {subscription['completed_interviews']} out of 1 free interview. Please upgrade to premium for unlimited interviews."
                )
        
        # Generate interview questions
        result = get_interview_question(session_data)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        # Increment interview count for free users
        if not subscription["is_premium"]:
            await increment_user_interview_count(current_user["id"])
            
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in generate_question_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def create_analysis_prompt(interview_data: InterviewAnalysisRequest) -> str:
    base_prompt = """You are an expert interview coach and evaluator. Analyze the provided interview responses and give detailed feedback with scoring.

CRITICAL INSTRUCTIONS:
1. You MUST provide detailed analysis for EACH individual question with the exact format specified below.
2. Do NOT skip any questions or provide generic feedback.
3. You MUST include the "HOW TO ANSWER THIS QUESTION PROPERLY" section for EVERY single question.
4. Follow the exact format for ALL questions from Question 1 to Question {total_questions}.

EVALUATION CRITERIA (Total: 100 points):
1. Content Quality (25 points) - Relevance, completeness, accuracy, specificity
2. Communication Skills (25 points) - Clarity, structure, grammar, conciseness  
3. Professional Competence (25 points) - Technical knowledge, experience demonstration, problem-solving
4. Behavioral Indicators (25 points) - Confidence, enthusiasm, professionalism, cultural fit

SCORING SCALE:
- 90-100: Exceptional, interview-ready
- 80-89: Strong with minor improvements
- 70-79: Good foundation, needs preparation
- 60-69: Basic competence, major gaps
- 50-59: Below average, extensive prep needed
- Below 50: Poor, fundamental development required

REQUIRED OUTPUT FORMAT (FOLLOW EXACTLY FOR ALL QUESTIONS):

## OVERALL INTERVIEW SCORE: X/100

### INDIVIDUAL QUESTION ANALYSIS

**Question 1: [Question Text]**
Your Response: [User's exact response]
- **Score**: X/100
- **Content Quality**: X/25 (Specific feedback on relevance and completeness)
- **Communication**: X/25 (Grammar, clarity, structure issues)
- **Professionalism**: X/25 (Technical competence and experience)
- **Behavioral**: X/25 (Confidence, enthusiasm, cultural fit)
- **Key Issues**: [List 2-3 specific problems with their response]
- **Improvements**: [Provide 2-3 actionable suggestions]

**HOW TO ANSWER THIS QUESTION PROPERLY:**
- **Structure**: [Explain the ideal structure for this type of question]
- **Key Points to Include**: [List 3-5 essential points that should be covered]
- **Example Response**: [Provide a well-structured example answer for this specific question]
- **Common Mistakes to Avoid**: [List 2-3 common mistakes people make with this question]
- **Pro Tips**: [Give 2-3 professional tips for answering this question effectively]

**Question 2: [Question Text]**
Your Response: [User's exact response]
- **Score**: X/100
- **Content Quality**: X/25 (Specific feedback on relevance and completeness)
- **Communication**: X/25 (Grammar, clarity, structure issues)
- **Professionalism**: X/25 (Technical competence and experience)
- **Behavioral**: X/25 (Confidence, enthusiasm, cultural fit)
- **Key Issues**: [List 2-3 specific problems with their response]
- **Improvements**: [Provide 2-3 actionable suggestions]

**HOW TO ANSWER THIS QUESTION PROPERLY:**
- **Structure**: [Explain the ideal structure for this type of question]
- **Key Points to Include**: [List 3-5 essential points that should be covered]
- **Example Response**: [Provide a well-structured example answer for this specific question]
- **Common Mistakes to Avoid**: [List 2-3 common mistakes people make with this question]
- **Pro Tips**: [Give 2-3 professional tips for answering this question effectively]

[Continue this exact format for ALL remaining questions - Question 3, Question 4, Question 5, etc. until you have covered ALL {total_questions} questions]

### COMPREHENSIVE ANALYSIS

#### Category Scores:
- **Introduction & Personal Branding**: X/100
- **Interest & Motivation**: X/100  
- **Behavioral & Teamwork**: X/100
- **Communication & Technical**: X/100
- **Role-Specific Competence**: X/100
- **Closing & Engagement**: X/100

#### Top 3 Strengths:
1. [Specific strength with example]
2. [Specific strength with example]  
3. [Specific strength with example]

#### Top 5 Critical Issues:
1. [Specific issue with impact]
2. [Specific issue with impact]
3. [Specific issue with impact]
4. [Specific issue with impact]
5. [Specific issue with impact]

### IMPROVEMENT ACTION PLAN

#### Immediate Actions (1-2 weeks):
1. [Specific, actionable task]
2. [Specific, actionable task]
3. [Specific, actionable task]

#### Medium-term Development (1-3 months):
1. [Skill development area]
2. [Practice recommendation]
3. [Knowledge building area]

#### Long-term Growth (3-6 months):
1. [Professional development goal]
2. [Experience building recommendation]
3. [Advanced skill development]

### INTERVIEW READINESS ASSESSMENT

**Current Status**: [Ready/Needs Preparation/Requires Extensive Work]
**Estimated Timeline to Interview-Ready**: [X weeks/months]
**Confidence Recommendation**: [High/Medium/Low confidence for similar interviews]
**Next Steps Priority**: [Most critical area to focus on first]

FINAL REMINDER: You MUST analyze EVERY single question provided. Do NOT skip any questions. Provide the "HOW TO ANSWER THIS QUESTION PROPERLY" section for EVERY question. You have {total_questions} questions to analyze.

Now analyze the following interview responses:"""

    context = f"\n\nInterview Context:\nRole: {interview_data.job_role}\nDifficulty Level: {interview_data.difficulty_level}\nFocus Areas: {', '.join(interview_data.interview_focus)}\n\n"
    
    responses = "Interview Responses:\n"
    for idx, resp in enumerate(interview_data.responses, 1):
        responses += f"\nQ{idx}: {resp.question}\nA{idx}: {resp.answer}\n"

    # Replace the placeholder with actual question count
    final_prompt = base_prompt.replace("{total_questions}", str(len(interview_data.responses)))
    
    return final_prompt + context + responses

@app.post("/api/analyze-interview")
async def analyze_interview(analysis_request: InterviewAnalysisRequest):
    """Analyze interview responses and provide detailed feedback"""
    try:
        # Debug logging to see what responses are being received
        logger.info(f"Received analysis request with {len(analysis_request.responses)} responses")
        for idx, resp in enumerate(analysis_request.responses):
            logger.info(f"Response {idx + 1}: Q='{resp.question}' A='{resp.answer}'")
        
        prompt = create_analysis_prompt(analysis_request)
        
        # Log the prompt being sent to LLM (first 500 chars for debugging)
        logger.info(f"Prompt being sent to LLM (first 500 chars): {prompt[:500]}...")
        
        # Try to get analysis with retry mechanism
        analysis = None
        max_retries = 2
        
        for attempt in range(max_retries):
            try:
                # Use Gemini API helper function with increased max_tokens
                analysis = call_gemini_api(prompt, max_tokens=8000)
                
                # Check if the analysis is complete
                if analysis and len(analysis.strip()) > 100:
                    # Check for key sections
                    required_sections = [
                        "OVERALL INTERVIEW SCORE:",
                        "INDIVIDUAL QUESTION ANALYSIS",
                        "HOW TO ANSWER THIS QUESTION PROPERLY"
                    ]
                    
                    missing_sections = [section for section in required_sections if section not in analysis]
                    if not missing_sections:
                        # Additional check: ensure we have analysis for each question
                        question_count = len(analysis_request.responses)
                        question_analysis_count = analysis.count("**Question")
                        how_to_answer_count = analysis.count("**HOW TO ANSWER THIS QUESTION PROPERLY**")
                        
                        logger.info(f"Analysis validation: {question_count} questions expected, {question_analysis_count} question analyses found, {how_to_answer_count} how-to-answer sections found")
                        
                        if question_analysis_count >= question_count and how_to_answer_count >= question_count:
                            logger.info("Analysis validation passed - complete analysis generated")
                            break  # Analysis is complete, exit retry loop
                        else:
                            logger.warning(f"Attempt {attempt + 1}: Missing detailed analysis. Expected {question_count} questions, found {question_analysis_count} analyses and {how_to_answer_count} how-to-answer sections")
                    else:
                        logger.warning(f"Attempt {attempt + 1}: Missing sections {missing_sections}")
                        
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise e
        
        # If we still don't have a complete analysis, create a fallback
        if not analysis or len(analysis.strip()) < 100:
            logger.warning("Creating fallback analysis due to incomplete response")
            analysis = create_fallback_analysis(analysis_request)
        
        # Parse the analysis to extract key metrics with better error handling
        try:
            # Extract overall score
            overall_score_match = re.search(r'OVERALL INTERVIEW SCORE:\s*(\d+)/100', analysis, re.IGNORECASE)
            overall_score = int(overall_score_match.group(1)) if overall_score_match else 0
            
            # Extract current status
            status_match = re.search(r'Current Status\*\*:\s*([^\\n]+)', analysis, re.IGNORECASE)
            current_status = status_match.group(1).strip() if status_match else "Analysis Complete"
            
            # Extract timeline
            timeline_match = re.search(r'Estimated Timeline to Interview-Ready\*\*:\s*([^\\n]+)', analysis, re.IGNORECASE)
            timeline = timeline_match.group(1).strip() if timeline_match else "2-4 weeks"
            
            # Extract confidence level
            confidence_match = re.search(r'Confidence Recommendation\*\*:\s*([^\\n]+)', analysis, re.IGNORECASE)
            confidence = confidence_match.group(1).strip() if confidence_match else "Medium"
            
        except Exception as parse_error:
            logger.error(f"Error parsing analysis metrics: {parse_error}")
            # Set default values if parsing fails
            overall_score = 0
            current_status = "Analysis Complete"
            timeline = "2-4 weeks"
            confidence = "Medium"

        return {
            "status": "success",
            "analysis": analysis,
            "summary": {
                "overall_score": overall_score,
                "current_status": current_status,
                "timeline_to_ready": timeline,
                "confidence_level": confidence
            },
            "metadata": {
                "job_role": analysis_request.job_role,
                "difficulty_level": analysis_request.difficulty_level,
                "total_questions": len(analysis_request.responses),
                "interview_focus": analysis_request.interview_focus
            }
        }

    except Exception as e:
        logger.error(f"Error in analyze_interview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze interview: {str(e)}"
        )

def create_fallback_analysis(analysis_request: InterviewAnalysisRequest) -> str:
    """Create a fallback analysis when the main analysis fails"""
    
    # Calculate a basic score based on response quality
    total_score = 0
    total_questions = len(analysis_request.responses)
    
    for response in analysis_request.responses:
        # Simple scoring logic
        answer_length = len(response.answer.strip())
        if answer_length > 50:
            total_score += 20
        elif answer_length > 20:
            total_score += 10
        else:
            total_score += 5
    
    average_score = total_score // total_questions if total_questions > 0 else 0
    
    fallback_analysis = f"""## OVERALL INTERVIEW SCORE: {average_score}/100

This interview analysis was generated automatically due to processing limitations. The responses indicate a need for improvement in interview preparation and communication skills.

### INDIVIDUAL QUESTION ANALYSIS

"""

    # Add detailed analysis for each question
    for i, response in enumerate(analysis_request.responses, 1):
        answer_length = len(response.answer.strip())
        if answer_length < 20:
            score = 5
            feedback = "Response too brief. Provide more detailed answers with specific examples and experiences."
        elif answer_length < 50:
            score = 15
            feedback = "Response needs more detail. Include specific examples, achievements, and relevant experience."
        else:
            score = 25
            feedback = "Good response length. Focus on providing specific examples and demonstrating relevant skills."
        
        # Determine question type for better guidance
        question_lower = response.question.lower()
        if any(word in question_lower for word in ['introduce', 'yourself', 'about you']):
            question_type = "Introduction"
            structure = "Start with your current role/status, mention relevant experience, and connect to the position."
            key_points = "Current role, relevant experience, key achievements, career goals, connection to the role"
            example = "I'm a software developer with 3 years of experience in web development. I've worked on several projects using React and Node.js, including an e-commerce platform that increased sales by 25%. I'm passionate about creating user-friendly applications and I'm excited about this opportunity to contribute to your team."
            mistakes = "Being too brief, not connecting to the role, mentioning irrelevant personal details"
            tips = "Keep it under 2 minutes, focus on professional experience, show enthusiasm for the role"
        elif any(word in question_lower for word in ['why', 'motivation', 'interest']):
            question_type = "Motivation"
            structure = "Show research about the company, connect your skills to their needs, express genuine interest."
            key_points = "Company research, role alignment, career goals, specific reasons for interest"
            example = "I'm excited about this role because of your company's innovative approach to AI and your commitment to user privacy. My experience in machine learning aligns perfectly with your current projects, and I'm drawn to your collaborative culture and opportunities for growth."
            mistakes = "Generic answers, not doing company research, focusing only on salary/benefits"
            tips = "Research the company thoroughly, be specific about why you want this role, show enthusiasm"
        elif any(word in question_lower for word in ['strength', 'weakness', 'improve']):
            question_type = "Self-Assessment"
            structure = "For strengths: specific examples. For weaknesses: acknowledge, show improvement efforts."
            key_points = "Relevant strengths with examples, honest weaknesses, improvement strategies, growth mindset"
            example = "My greatest strength is problem-solving - I recently debugged a critical system issue that saved our team 20 hours of work. My weakness is public speaking, but I've been taking courses and practicing presentations to improve."
            mistakes = "Claiming no weaknesses, mentioning irrelevant strengths, not showing improvement efforts"
            tips = "Prepare 3-4 relevant strengths with examples, choose a real weakness you're working on"
        else:
            question_type = "General"
            structure = "Use the STAR method: Situation, Task, Action, Result. Be specific and relevant."
            key_points = "Specific situation, your role, actions taken, measurable results, relevance to role"
            example = "In my previous role, I was tasked with improving our website's loading speed. I analyzed the codebase, identified bottlenecks, and implemented optimizations that reduced load time by 40% and improved user satisfaction scores."
            mistakes = "Being vague, not providing examples, not connecting to the role, rambling"
            tips = "Use the STAR method, prepare specific examples, keep answers focused and relevant"
        
        fallback_analysis += f"""**Question {i}: {response.question}**
Your Response: {response.answer}
- **Score**: {score}/100
- **Content Quality**: {score//4}/25 (Response needs more detail and specific examples)
- **Communication**: {score//4}/25 (Clarity and structure need improvement)
- **Professionalism**: {score//4}/25 (Professional presentation requires enhancement)
- **Behavioral**: {score//4}/25 (Confidence and cultural fit indicators need development)
- **Key Issues**: {feedback}
- **Improvements**: Provide more detailed responses with specific examples, use the STAR method for behavioral questions, and demonstrate relevant technical knowledge.

**HOW TO ANSWER THIS QUESTION PROPERLY:**
- **Structure**: {structure}
- **Key Points to Include**: {key_points}
- **Example Response**: "{example}"
- **Common Mistakes to Avoid**: {mistakes}
- **Pro Tips**: {tips}

"""

    fallback_analysis += f"""
### COMPREHENSIVE ANALYSIS

#### Category Scores:
- **Introduction & Personal Branding**: {average_score}/100
- **Interest & Motivation**: {average_score}/100  
- **Behavioral & Teamwork**: {average_score}/100
- **Communication & Technical**: {average_score}/100
- **Role-Specific Competence**: {average_score}/100
- **Closing & Engagement**: {average_score}/100

#### Top 3 Strengths:
1. Willingness to participate in the interview process
2. Basic understanding of interview structure
3. Opportunity for significant improvement

#### Top 5 Critical Issues:
1. Responses are too brief and lack detail
2. Missing specific examples and achievements
3. Limited demonstration of technical knowledge
4. Need for better communication structure
5. Lack of role-specific preparation

### IMPROVEMENT ACTION PLAN

#### Immediate Actions (1-2 weeks):
1. Practice answering common interview questions with detailed responses
2. Prepare specific examples using the STAR method
3. Research the company and role requirements thoroughly

#### Medium-term Development (1-3 months):
1. Build a portfolio of relevant projects and achievements
2. Practice technical interviews and coding challenges
3. Improve communication and presentation skills

#### Long-term Growth (3-6 months):
1. Gain hands-on experience in relevant technologies
2. Network with professionals in the field
3. Continue learning and staying updated with industry trends

### INTERVIEW READINESS ASSESSMENT

**Current Status**: Needs Preparation
**Estimated Timeline to Interview-Ready**: 4-6 weeks
**Confidence Recommendation**: Medium confidence with proper preparation
**Next Steps Priority**: Focus on providing detailed, specific responses with examples

### QUESTION-BY-QUESTION IMPROVEMENT GUIDE

"""

    # Add improvement guide for each question
    for i, response in enumerate(analysis_request.responses, 1):
        fallback_analysis += f"""**Question {i}: {response.question}**
- **What you said well**: You attempted to address the question
- **What needs improvement**: Provide more detailed responses with specific examples
- **Better approach**: Use the STAR method and include relevant experience
- **Sample improved response**: "I have experience in [relevant area] where I [specific achievement]. For example, when I [situation], my task was to [task], so I [action], which resulted in [result]."

"""

    return fallback_analysis

@app.post("/api/versant-feedback")
async def analyze_versant_feedback(request: VersantFeedbackRequest):
    """Analyze all sentences together for the Versant test"""
    try:
        # Combine all sentences for analysis
        all_sentences = "\n".join(request.sentences)
        
        # Create prompt for analysis
        prompt = f"""You are an expert English communication coach. Analyze these sentences and provide scoring and feedback:

{all_sentences}

Format your response EXACTLY like this:

TOTAL SCORE: [X]/80
(Break down the score into these components)
- Pronunciation & Clarity: [X]/20
- Grammar & Structure: [X]/20
- Vocabulary Usage: [X]/20
- Overall Fluency: [X]/20

AREAS TO IMPROVE:
1. [area name] - [brief explanation why]
2. [area name] - [brief explanation why]
(etc...)

PRACTICE SUGGESTIONS:
1. [specific exercise or practice activity]
2. [specific exercise or practice activity]
(etc...)

Do not include any other analysis or explanations."""

        # Get analysis from Gemini
        analysis = call_gemini_api(prompt, max_tokens=500)
        
        # Extract score if present
        score_match = re.search(r'TOTAL SCORE:\s*(\d+)/80', analysis)
        total_score = int(score_match.group(1)) if score_match else 0
        
        return {
            "status": "success",
            "total_score": total_score,
            "areas_for_improvement": analysis
        }

    except Exception as e:
        logger.error(f"Error in versant feedback analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze versant feedback: {str(e)}"
        )

def generate_reading_test_prompt(difficulty: str = "intermediate") -> str:
    # Add randomization seed to make each generation unique
    import random
    random_seed = random.randint(1000, 9999)
    current_time = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    
    return f"""You are an English language test content generator for a professional English fluency assessment focused on advanced daily routines in modern life and work settings.

Your task is to generate exactly 8 unique sentences per batch. Each sentence must:

- Contain between 10 to 14 words  
- Be grammatically correct and natural-sounding  
- Use moderately advanced vocabulary (CEFR B2 to low C1 level)  
- Describe realistic daily routines that involve mental effort, responsibility, or structured activity  
- Focus on work, learning, meetings, planning, preparation, productivity, or digital routines  
- Vary in structure and tone to test pacing, rhythm, and fluency during reading  
- Avoid basic or trivial routines (e.g., brushing teeth, drinking water)  
- Avoid slang, idioms, contractions, or overly technical words

Sentences should be relatable yet challenging for professional adults or advanced learners.

[Session ID: {random_seed}-{current_time}]

CRITICAL REQUIREMENTS:
1. Sentences MUST be about meaningful daily routines (work, learning, planning, tech use)
2. Each sentence MUST be grammatically rich and professionally relevant
3. Avoid casual or personal themes like cooking, cleaning, or watching TV

Output exactly 8 unique, well-formed sentences. Place each sentence on a new line."""


@app.get("/api/reading-test", response_model=ReadingTestResponse)
async def generate_reading_test(
    difficulty: Optional[str] = Query("intermediate", enum=["beginner", "intermediate", "advanced"]),
    current_user: dict = Depends(get_current_user)
):
    """Generate 8 random sentences for reading test using Gemini model"""
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
            
        # Load sentence history
        history = load_sentence_history()
        user_history = history.get(current_user["id"], {"sentences": [], "timestamp": datetime.utcnow().isoformat()})
        
        # Generate new sentences
        prompt = generate_reading_test_prompt()
        sentences_text = call_gemini_api(prompt, max_tokens=500)
        
        # Process and filter sentences
        new_sentences = sentences_text.strip().split('\n')
        new_sentences = [s.strip() for s in new_sentences if s.strip() 
                        and len(s.split()) >= 10  # Minimum 10 words
                        and len(s.split()) <= 18  # Maximum 18 words
                        and s not in user_history["sentences"]]  # Not in history
        
        # If we don't have enough new sentences, generate more
        attempts = 0
        while len(new_sentences) < 8 and attempts < 3:
            additional_sentences = call_gemini_api(prompt, max_tokens=500).strip().split('\n')
            additional_sentences = [s.strip() for s in additional_sentences if s.strip() 
                                 and len(s.split()) >= 10 
                                 and len(s.split()) <= 18
                                 and s not in user_history["sentences"]
                                 and s not in new_sentences]
            new_sentences.extend(additional_sentences)
            attempts += 1
        
        # Take only the first 8 sentences
        new_sentences = new_sentences[:8]
        
        # Update history with new sentences
        user_history["sentences"].extend(new_sentences)
        # Keep only last 100 sentences in history (more than enough for 10-15 rounds)
        user_history["sentences"] = user_history["sentences"][-100:]
        user_history["timestamp"] = datetime.utcnow().isoformat()
        history[current_user["id"]] = user_history
        save_sentence_history(history)
        
        # If we still don't have enough sentences, use backup sentences
        if len(new_sentences) < 8:
            backup_sentences = [
                "The implementation of quantum computing presents unprecedented challenges in cybersecurity protocols.",
                "Sustainable development requires careful consideration of environmental and economic factors.",
                "Recent advances in artificial intelligence have transformed modern medical diagnostic procedures.",
                "The correlation between educational achievement and socioeconomic status remains statistically significant.",
                "Global climate patterns demonstrate complex interactions between atmospheric and oceanic systems.",
                "Ethical considerations in biotechnology research continue to spark philosophical and moral debates.",
                "Advanced materials science innovations have revolutionized manufacturing processes across industries.",
                "Contemporary urban planning emphasizes sustainable infrastructure and community engagement principles."
            ]
            remaining_needed = 8 - len(new_sentences)
            new_sentences.extend(backup_sentences[:remaining_needed])
        
        return {
            "sentences": new_sentences,
            "difficulty_level": "C1-C2"
        }

    except Exception as e:
        logger.error(f"Error in generate_reading_test: {str(e)}")
        # Return backup sentences if any error occurs
        backup_sentences = [
            "The implementation of quantum computing presents unprecedented challenges in cybersecurity protocols.",
            "Sustainable development requires careful consideration of environmental and economic factors.",
            "Recent advances in artificial intelligence have transformed modern medical diagnostic procedures.",
            "The correlation between educational achievement and socioeconomic status remains statistically significant.",
            "Global climate patterns demonstrate complex interactions between atmospheric and oceanic systems.",
            "Ethical considerations in biotechnology research continue to spark philosophical and moral debates.",
            "Advanced materials science innovations have revolutionized manufacturing processes across industries.",
            "Contemporary urban planning emphasizes sustainable infrastructure and community engagement principles."
        ]
        return {
            "sentences": backup_sentences,
            "difficulty_level": "C1-C2"
        }

def generate_repeat_sentence_prompt(difficulty: str = "advanced") -> str:
    # Add randomization seed to make each generation unique
    import random
    random_seed = random.randint(1000, 9999)
    current_time = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    
    return f"""You are an English language test content generator for a high-level fluency assessment exam (e.g., academic or corporate communication).

Generate advanced, grammatically complex English sentences for a reading test. Each sentence must:

- Contain 15 to 25 words  
- Use formal or academic vocabulary (CEFR level C1–C2)  
- Reflect abstract, professional, or intellectual themes (e.g., technology, ethics, innovation, policy, science, global affairs)  
- Vary in structure, using compound or complex sentences  
- Avoid everyday routines, idioms, slang, or contractions  
- Be challenging to read aloud but still clear and meaningful

CRITICAL REQUIREMENTS:
1. Each sentence MUST be unique and significantly different from others
2. Focus on professional and technical topics:
   - Technology trends and digital transformation
   - Scientific research and methodology
   - Corporate strategy and management
   - Global economics and policy
   - Innovation and development
   - Professional ethics and responsibility

3. Use advanced sentence structures:
   - Complex subordinate clauses
   - Perfect continuous tenses
   - Passive voice constructions
   - Conditional statements
   - Advanced connectors and transitions

4. Include domain-specific vocabulary:
   - Technical terminology
   - Academic language
   - Professional jargon
   - Industry-specific terms

[Session ID: {random_seed}-{current_time}]

Output exactly 16 unique, well-formed sentences. Place each sentence on a new line.
DO NOT include any annotations, labels, or formatting - just output clean sentences."""

@app.get("/api/repeat-sentence", response_model=RepeatSentenceResponse)
async def generate_repeat_sentence(
    difficulty: Optional[str] = Query("advanced", enum=["beginner", "intermediate", "advanced"]),
    current_user: dict = Depends(get_current_user)
):
    """Generate 16 random sentences for repeat sentence test using Gemini model"""
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
            
        prompt = generate_repeat_sentence_prompt(difficulty)
        sentences_text = call_gemini_api(prompt, max_tokens=500)
        
        sentences = sentences_text.strip().split('\n')
        # Clean and filter sentences
        sentences = [s.strip() for s in sentences if s.strip() and len(s.split()) >= 8 and len(s.split()) <= 15]
        # Ensure exactly 8 sentences
        sentences = sentences[:16] if len(sentences) > 16 else sentences
        
        # If we don't have enough sentences, use backup sentences
        if len(sentences) < 16:
            backup_sentences = [
                "Could you please tell me where the nearest bus station is located?",
                "I'm planning to visit my family during the summer vacation.",
                "The new restaurant downtown serves delicious Italian cuisine.",
                "She has been working at this company for five years now.",
                "Would you mind helping me carry these books to the library?",
                "The weather forecast predicts rain for the entire weekend.",
                "My brother is studying computer science at the university.",
                "They're going to renovate the office building next month."
            ]
            sentences.extend(backup_sentences[:(8 - len(sentences))])
        
        return {
            "sentences": sentences,
            "difficulty_level": "A2-B1"  # Fixed CEFR level as per requirements
        }

    except Exception as e:
        logger.error(f"Error in generate_repeat_sentence: {str(e)}")
        # Return backup sentences if any error occurs
        backup_sentences = [
            "Could you please tell me where the nearest bus station is located?",
            "I'm planning to visit my family during the summer vacation.",
            "The new restaurant downtown serves delicious Italian cuisine.",
            "She has been working at this company for five years now.",
            "Would you mind helping me carry these books to the library?",
            "The weather forecast predicts rain for the entire weekend.",
            "My brother is studying computer science at the university.",
            "They're going to renovate the office building next month."
        ]
        return {
            "sentences": backup_sentences,
            "difficulty_level": "A2-B1"
        }

def generate_short_answer_prompt() -> str:
    return """You are a content generator for an advanced spoken English fluency test like the Versant test. Generate exactly 16 professional questions that test a candidate's ability to respond thoughtfully within 15 seconds.

QUESTION REQUIREMENTS:
- Each question must be 8–14 words long
- Must be clear and easy to understand in one listen
- Should require 1–2 sentence responses (no yes/no answers)
- Focus on workplace scenarios and professional development
- Use natural, formal language without idioms or slang

TOPICS TO COVER:
1. Professional Development
   - Skill improvement
   - Learning strategies
   - Career growth
   
2. Workplace Dynamics
   - Team collaboration
   - Communication
   - Problem-solving
   
3. Project Management
   - Time management
   - Resource allocation
   - Priority setting
   
4. Leadership & Initiative
   - Decision making
   - Team support
   - Conflict resolution

CRITICAL INSTRUCTIONS:
- DO NOT include any headers, numbering, or labels
- DO NOT use phrases like "Here are the questions" or similar
- Output ONLY the questions, one per line
- Each question must be unique and professionally relevant
- Questions should encourage analytical thinking and specific examples

[Session ID: {random.randint(1000, 9999)}]

Generate 16 questions now, one per line."""


@app.get("/api/short-answer", response_model=ShortAnswerResponse)
async def generate_short_answer(current_user: dict = Depends(get_current_user)):
    """Generate 24 random questions for short answer test using Gemini model"""
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
            
        # Load question history
        history = load_sentence_history()  # Reusing the sentence history system for questions
        user_history = history.get(current_user["id"], {"questions": [], "timestamp": datetime.utcnow().isoformat()})
        
        prompt = generate_short_answer_prompt()
        questions_text = call_gemini_api(prompt, max_tokens=1000)
        
        # Process and filter questions
        new_questions = questions_text.strip().split('\n')
        # Clean up questions - remove headers and numbering
        new_questions = [q.strip() for q in new_questions if q.strip() 
                        and not q.lower().startswith("here are")  # Remove headers
                        and not q.startswith("*")  # Remove any bullet points
                        and len(q.split()) >= 8  # Minimum 8 words
                        and len(q.split()) <= 14]  # Maximum 14 words
        
        # Remove numbering and clean up
        new_questions = [re.sub(r'^\d+\.\s*', '', q) for q in new_questions]
        new_questions = [q for q in new_questions if q.strip() 
                        and not q.lower().startswith("question")
                        and q not in user_history.get("questions", [])]  # Not in history
        
        # If we don't have enough new questions, generate more
        attempts = 0
        while len(new_questions) < 24 and attempts < 3:
            additional_questions = call_gemini_api(prompt, max_tokens=1000).strip().split('\n')
            additional_questions = [q.strip() for q in additional_questions if q.strip() 
                                 and len(q.split()) >= 8 
                                 and len(q.split()) <= 14
                                 and q not in user_history.get("questions", [])
                                 and q not in new_questions]
            new_questions.extend(additional_questions)
            attempts += 1
        
        # Take only the first 24 questions
        new_questions = new_questions[:24]
        
        # Update history with new questions
        if "questions" not in user_history:
            user_history["questions"] = []
        user_history["questions"].extend(new_questions)
        # Keep only last 300 questions in history (more than enough for 10-15 rounds)
        user_history["questions"] = user_history["questions"][-300:]
        user_history["timestamp"] = datetime.utcnow().isoformat()
        history[current_user["id"]] = user_history
        save_sentence_history(history)
        
        # If we still don't have enough questions, use backup questions
        if len(new_questions) < 24:
            backup_questions = [
                "How do you prioritize your tasks when facing multiple deadlines?",
                "What strategies do you use to stay focused during long meetings?",
                "How do you handle unexpected changes in your work schedule?",
                "What methods do you use to organize your digital workspace?",
                "How do you approach learning new technical skills for your job?",
                "What steps do you take to prepare for important presentations?",
                "How do you maintain work-life balance in a demanding role?",
                "What techniques do you use for effective time management?",
                "How do you collaborate with team members in different time zones?",
                "What strategies help you stay productive during remote work?",
                "How do you handle constructive feedback from your colleagues?",
                "What methods do you use to track project progress?",
                "How do you approach solving complex technical problems?",
                "What steps do you take to improve team communication?",
                "How do you maintain focus during long coding sessions?",
                "What strategies do you use for effective code review?",
                "How do you handle disagreements in technical discussions?",
                "What methods help you stay updated with industry trends?",
                "How do you approach mentoring junior team members?",
                "What techniques do you use for debugging complex issues?",
                "How do you maintain documentation for your projects?",
                "What strategies do you use for continuous learning?",
                "How do you handle tight project deadlines effectively?",
                "What methods do you use to ensure code quality?"
            ]
            remaining_needed = 24 - len(new_questions)
            new_questions.extend(backup_questions[:remaining_needed])
        
        return {
            "questions": new_questions,
            "difficulty_level": "B2-C1"
        }

    except Exception as e:
        logger.error(f"Error in generate_short_answer: {str(e)}")
        # Return backup questions if any error occurs
        backup_questions = [
            "How do you prioritize your tasks when facing multiple deadlines?",
            "What strategies do you use to stay focused during long meetings?",
            "How do you handle unexpected changes in your work schedule?",
            "What methods do you use to organize your digital workspace?",
            "How do you approach learning new technical skills for your job?",
            "What steps do you take to prepare for important presentations?",
            "How do you maintain work-life balance in a demanding role?",
            "What techniques do you use for effective time management?",
            "How do you collaborate with team members in different time zones?",
            "What strategies help you stay productive during remote work?",
            "How do you handle constructive feedback from your colleagues?",
            "What methods do you use to track project progress?",
            "How do you approach solving complex technical problems?",
            "What steps do you take to improve team communication?",
            "How do you maintain focus during long coding sessions?",
            "What strategies do you use for effective code review?",
            "How do you handle disagreements in technical discussions?",
            "What methods help you stay updated with industry trends?",
            "How do you approach mentoring junior team members?",
            "What techniques do you use for debugging complex issues?",
            "How do you maintain documentation for your projects?",
            "What strategies do you use for continuous learning?",
            "How do you handle tight project deadlines effectively?",
            "What methods do you use to ensure code quality?"
        ]
        return {
            "questions": backup_questions,
            "difficulty_level": "B2-C1"
        }

def generate_story_teller_prompt() -> str:
    # Add randomization seed to make each generation unique
    import random
    random_seed = random.randint(1000, 9999)
    current_time = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    
    return f"""You are a language assessment assistant trained to generate unique short stories for the "Story Retelling" section of a Versant-style English speaking test.

Your goal is to create short spoken stories that test a user's ability to listen, understand, and then retell the main points in their own words.

STORY REQUIREMENTS:
- Each story must be 3 to 5 sentences long
- Use clear English (CEFR B1–B2 level)
- Follow a logical structure: beginning, middle, and end
- Create engaging, unexpected situations
- Avoid slang, idioms, or complex vocabulary
- Keep stories culturally universal

CRITICAL DIVERSITY RULES:
1. Each set of 3 stories MUST:
   - Use completely different situations (no repeating themes like "improvement" or "learning")
   - Have different types of outcomes (not all positive/success stories)
   - Include different scales (personal, local, global)
   - Use different time frames (immediate events, gradual changes, sudden discoveries)

2. Story Patterns to AVOID:
   - Learning/improvement journeys
   - Community service projects
   - Technology adoption stories
   - Simple problem-solution narratives

3. Required Variety:
   - Story 1: Must be from Category A (Adventure & Discovery)
   - Story 2: Must be from Category B (Work & Innovation)
   - Story 3: Must be from Category C (Society & Culture)

CRITICAL INSTRUCTIONS:
1. Character Names:
   - Use diverse, international names
   - Never use common names like "Sarah", "David", "John", "Mary"
   - Vary gender and backgrounds
   - Don't reuse names across stories

2. Story Types (MUST use one from each category):

   Category A - Adventure & Discovery:
   - Scientific breakthrough or invention
   - Unexpected travel experience
   - Sports competition or challenge
   - Wildlife or nature encounter
   
   Category B - Work & Innovation:
   - Startup or business venture
   - Creative problem-solving at work
   - Industry innovation
   - Market research findings
   
   Category C - Society & Culture:
   - Cultural festival or event
   - Historical preservation
   - Art exhibition or performance
   - Food and culinary traditions

3. Story Structure:
   - Clear problem or goal
   - Action or effort taken
   - Resolution or outcome
   - Meaningful lesson or impact

[Session ID: {random_seed}-{current_time}]

Generate 3 unique stories. Format each as:
Story 1: <text>
Story 2: <text>
Story 3: <text>"""

@app.get("/api/story-teller")
async def get_story_teller(current_user: dict = Depends(get_current_user)):
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
            
        # Load story history
        history = load_sentence_history()  # Reusing the sentence history system for stories
        user_history = history.get(current_user["id"], {"stories": [], "timestamp": datetime.utcnow().isoformat()})
        
        prompt = generate_story_teller_prompt()
        stories_text = call_gemini_api(prompt, max_tokens=1000)  # Increased tokens for better stories
        
        # Robustly extract each story using regex
        pattern = re.compile(r"Story\s*\d+:\s*(.*?)(?=Story\s*\d+:|$)", re.DOTALL)
        matches = pattern.findall(stories_text)
        stories = [m.strip().replace('\n', ' ') for m in matches if m.strip()]

        # Filter out stories that are in history
        stories = [s for s in stories if s not in user_history.get("stories", [])]

        # If we don't have enough new stories, generate more with different prompts
        attempts = 0
        while len(stories) < 3 and attempts < 3:
            additional_prompt = generate_story_teller_prompt()  # New prompt for more variation
            additional_text = call_gemini_api(additional_prompt, max_tokens=1000)
            additional_matches = pattern.findall(additional_text)
            additional_stories = [m.strip().replace('\n', ' ') for m in additional_matches if m.strip()]
            additional_stories = [s for s in additional_stories 
                                if s not in user_history.get("stories", [])
                                and s not in stories]
            stories.extend(additional_stories)
            attempts += 1

        # Take only the first 3 stories
        stories = stories[:3]

        # Update history with new stories
        if "stories" not in user_history:
            user_history["stories"] = []
        user_history["stories"].extend(stories)
        # Keep only last 30 stories in history (10 rounds × 3 stories)
        user_history["stories"] = user_history["stories"][-30:]
        user_history["timestamp"] = datetime.utcnow().isoformat()
        history[current_user["id"]] = user_history
        save_sentence_history(history)

        # Return all stories as a list
        if stories and len(stories) == 3:
            return {"stories": stories}
        else:
            logger.error("No stories generated from API response or incorrect count")
            raise Exception("No stories generated or incorrect count")

    except Exception as e:
        logger.error(f"Error in story generation: {str(e)}")
        # Return a backup story if API fails
        backup_stories = [
            "Last weekend, Sarah decided to try a new hobby - painting. She bought some basic art supplies and set up a small studio in her spare room. After watching a few online tutorials, she created her first landscape painting. Though it wasn't perfect, she felt proud of her accomplishment and discovered a new passion.",
            "A young programmer named Alex spent weeks developing a helpful app for his local community. The app helped people find and share fresh produce from their gardens. His neighbors loved the idea, and soon the whole neighborhood was using it to share their homegrown vegetables and fruits.",
            "Maria had always dreamed of opening her own bakery. She started small, selling cupcakes at local markets on weekends. Her unique flavors and beautiful decorations quickly gained popularity. After a year of hard work, she finally saved enough to open her own small shop in the city center."
        ]
        return {"stories": backup_stories}

def generate_sentence_build_prompt() -> str:
    return (
        "You are a test assistant for English fluency exams like the Versant Speaking Test.\n"
        "Generate exactly 8 sentence building questions. For each question:\n"
        "- Provide three jumbled sentence fragments (not in correct order), separated by commas.\n"
        "- The correct answer must be a simple, complete sentence (4-8 words), using all three fragments in the right order.\n"
        "- The fragments must be short, natural, and not full sentences.\n"
        "- The answer must NOT repeat the fragments in parentheses or as a list—just the correct sentence.\n"
        "- The content must be simple, grammatically correct, and suitable for B1–B2 level learners.\n"
        "\nFor each question, output as:\n"
        "Phrases: fragment1, fragment2, fragment3\n"
        "Answer: The correct sentence.\n"
        "\nDo NOT output anything except the 8 question blocks in the format above. Do NOT number them. Do NOT include the fragments in the answer. Do NOT use parentheses. Example:\n"
        "Phrases: went to, yesterday, the market\n"
        "Answer: She went to the market yesterday.\n"
        "\nNow generate 8 such questions."
    )

@app.get("/api/sentence-build")
async def generate_sentence_build(current_user: dict = Depends(get_current_user)):
    """Generate 8 sentence building questions for the Versant round using Gemini."""
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
            
        prompt = generate_sentence_build_prompt()
        content = call_gemini_api(prompt, max_tokens=800)
        
        # Robust parser using regex
        questions = []
        pattern = re.compile(r"Phrases:\s*(.+)\s*Answer:\s*(.+)", re.IGNORECASE)
        matches = pattern.findall(content)
        for phrases_line, answer_line in matches:
            phrases = [p.strip() for p in phrases_line.split(',')]
            questions.append({
                'phrases': phrases,
                'correct': answer_line.strip()
            })
        # Fallback if nothing parsed
        if not questions:
            questions = [
                {
                    'phrases': ["went to", "yesterday", "the market"],
                    'correct': "She went to the market yesterday."
                },
                {
                    'phrases': ["very fast", "runs", "he"],
                    'correct': "He runs very fast."
                },
                {
                    'phrases': ["was raining", "outside", "heavily"],
                    'correct': "It was raining heavily outside."
                },
                {
                    'phrases': ["homework", "my", "finished", "I"],
                    'correct': "I finished my homework."
                },
                {
                    'phrases': ["lunch", "we", "together", "had"],
                    'correct': "We had lunch together."
                },
                {
                    'phrases': ["dog", "in the park", "walked"],
                    'correct': "She walked the dog in the park."
                },
                {
                    'phrases': ["early", "woke up", "I"],
                    'correct': "I woke up early."
                },
                {
                    'phrases': ["the news", "heard", "just"],
                    'correct': "I just heard the news."
                }
            ][:8]
        return {"questions": questions}
        
    except Exception as e:
        logger.error(f"Error in generate_sentence_build: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate sentence build questions: {str(e)}"
        )

@app.get("/api/profile/scores", response_model=ScoresResponse)
async def get_user_scores(current_user: dict = Depends(get_current_user)):
    """Get user's scores array"""
    try:
        # Get profile
        profile = await get_profile_by_user_id(current_user["id"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return {
            "scores": profile.get("scores", [])  # Return just the scores array
        }
  
        
    except Exception as e:
        logger.error(f"Error getting score data: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch score data"
        )

def generate_open_questions_prompt() -> str:
    return (
        "You are an expert English language assessor for a professional language proficiency test.\n"
        "Generate exactly 2 open-ended questions that test the speaker's ability to express complex thoughts, opinions, and experiences in English.\n\n"
        "Guidelines:\n"
        "1. Questions must require detailed responses (at least 1-2 minutes of speaking).\n"
        "2. Questions should test critical thinking and ability to structure a response.\n"
        "3. Focus on professional and academic topics like:\n"
        "   - Career development and workplace challenges\n"
        "   - Technology and innovation impact\n"
        "   - Education and learning experiences\n"
        "   - Global issues and cultural perspectives\n"
        "4. Format: Output exactly 2 questions, one per line, no numbering or extra text.\n"
        "5. Each question should be 1-2 sentences, clear and direct.\n"
        "6. Avoid yes/no questions or simple opinion questions.\n"
    )

@app.get("/api/open-questions")
async def get_open_questions(current_user: dict = Depends(get_current_user)):
    """Generate 2 open-ended questions for the Open Question Round using Gemini."""
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
            
        # Load question history
        history = load_sentence_history()  # Reusing the sentence history system
        user_history = history.get(current_user["id"], {"open_questions": [], "timestamp": datetime.utcnow().isoformat()})
        
        # Generate new questions with multiple attempts
        attempts = 0
        questions = []
        while len(questions) < 2 and attempts < 3:
            try:
                prompt = generate_open_questions_prompt()
                # Use lower temperature for more focused responses
                generation_config = genai.types.GenerationConfig(
                    max_output_tokens=200,
                    temperature=0.7
                )
                
                questions_text = call_gemini_api(prompt, max_tokens=200)
                questions_raw = questions_text.strip().split('\n')
                
                # Clean and filter questions
                for line in questions_raw:
                    line = line.strip()
                    # Skip preambles or empty lines
                    if not line or line.lower().startswith(("okay", "here", "question")):
                        continue
                    # Remove numbering and clean up
                    line = re.sub(r"^(\d+\.|\d+\)|-|\*)\s*", "", line).strip()
                    # Only keep lines that look like questions
                    if len(line) > 20 and (line.endswith('?') or line.endswith('.')) and line not in user_history.get("open_questions", []):
                        questions.append(line)
                
                # Only keep unique questions not in history
                questions = [q for q in questions if q not in user_history.get("open_questions", [])]
                questions = questions[:2]  # Keep only first 2 questions
                attempts += 1
                
            except Exception as e:
                logger.error(f"Error in question generation attempt {attempts}: {str(e)}")
                attempts += 1
                continue
        
        # If we have valid questions, update history
        if len(questions) == 2:
            if "open_questions" not in user_history:
                user_history["open_questions"] = []
            user_history["open_questions"].extend(questions)
            # Keep only last 20 questions in history (10 rounds × 2 questions)
            user_history["open_questions"] = user_history["open_questions"][-20:]
            user_history["timestamp"] = datetime.utcnow().isoformat()
            history[current_user["id"]] = user_history
            save_sentence_history(history)
            return {"questions": questions}
        
        # If we still don't have enough questions, use diverse backup questions
        backup_questions = [
            "Describe a significant challenge you faced in your professional life and explain how you overcame it, including the specific strategies you used.",
            "What impact do you think artificial intelligence will have on your field of work in the next decade, and how are you preparing for these changes?",
            "Discuss a time when you had to adapt to a major change in your workplace or studies, and what lessons you learned from this experience.",
            "How has technology transformed the way we learn and work in your industry, and what further changes do you anticipate in the future?",
            "Describe a situation where you had to collaborate with people from different cultural backgrounds and how you ensured effective communication.",
            "What do you consider to be the most pressing global challenge today, and how do you think it should be addressed?",
            "Explain how your educational or professional background has prepared you for future career opportunities in your field.",
            "Describe a project where you had to demonstrate leadership skills and how you ensured its successful completion.",
            "How do you think the concept of work-life balance has evolved in recent years, and what strategies do you use to maintain it?",
            "What role do you think continuous learning plays in professional development, and how do you pursue it in your own career?"
        ]
        
        # Select 2 random questions from backup that aren't in history
        available_questions = [q for q in backup_questions if q not in user_history.get("open_questions", [])]
        if len(available_questions) >= 2:
            selected_questions = random.sample(available_questions, 2)
        else:
            selected_questions = random.sample(backup_questions, 2)
        
        # Update history with selected backup questions
        if "open_questions" not in user_history:
            user_history["open_questions"] = []
        user_history["open_questions"].extend(selected_questions)
        user_history["open_questions"] = user_history["open_questions"][-20:]
        user_history["timestamp"] = datetime.utcnow().isoformat()
        history[current_user["id"]] = user_history
        save_sentence_history(history)
        
        return {"questions": selected_questions}
        
    except Exception as e:
        logger.error(f"Error in get_open_questions: {str(e)}")
        # Use different default questions that are more professional
        return {"questions": [
            "Describe a significant challenge you faced in your professional life and explain how you overcame it, including the specific strategies you used.",
            "What impact do you think artificial intelligence will have on your field of work in the next decade, and how are you preparing for these changes?"
        ]}

@app.post("/api/interview-feedback")
async def save_interview_feedback(feedback_data: dict, current_user: dict = Depends(get_current_user)):
    """Save interview feedback and update user's scores"""
    try:
        # Add user_id to feedback data
        feedback_data["user_id"] = current_user["id"]
        
        # Save feedback
        saved_feedback = await create_interview_feedback(feedback_data)
        if not saved_feedback:
            raise HTTPException(
                status_code=500,
                detail="Failed to save feedback"
            )
        
        # Extract duration in minutes from metadata
        duration_str = feedback_data.get("metadata", {}).get("duration", "10min")
        duration_minutes = int(duration_str.replace("min", ""))
        
        # Extract score from various possible locations in the feedback data
        score = (
            feedback_data.get("overall_score") or 
            feedback_data.get("score") or 
            feedback_data.get("summary", {}).get("overall_score", 0)
        )
        
        # Update interview stats with score
        await update_interview_stats(current_user["id"], duration_minutes, score)
        
        return saved_feedback
        
    except Exception as e:
        logger.error(f"Error saving interview feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save interview feedback: {str(e)}"
        )
        
# Add this after other global variables
SENTENCE_HISTORY_FILE = "sentence_history.json"
HISTORY_EXPIRY_HOURS = 24  # History entries older than this will be cleared

def load_sentence_history():
    try:
        if os.path.exists(SENTENCE_HISTORY_FILE):
            with open(SENTENCE_HISTORY_FILE, 'r') as f:
                history = json.load(f)
                # Clean up old entries
                current_time = datetime.utcnow()
                history = {
                    user_id: {
                        'sentences': sentences['sentences'],
                        'timestamp': sentences['timestamp']
                    }
                    for user_id, sentences in history.items()
                    if datetime.fromisoformat(sentences['timestamp']) + timedelta(hours=HISTORY_EXPIRY_HOURS) > current_time
                }
                return history
        return {}
    except Exception as e:
        logger.error(f"Error loading sentence history: {e}")
        return {}

def save_sentence_history(history):
    try:
        with open(SENTENCE_HISTORY_FILE, 'w') as f:
            json.dump(history, f)
    except Exception as e:
        logger.error(f"Error saving sentence history: {e}")

def generate_repeat_sentence_prompt(difficulty: str = "advanced") -> str:
    # Add randomization seed to make each generation unique
    import random
    random_seed = random.randint(1000, 9999)
    current_time = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    
    return f"""You are an English language test content generator for a high-level fluency assessment exam (e.g., academic or corporate communication).

Generate advanced, grammatically complex English sentences for a reading test. Each sentence must:

- Contain 15 to 25 words  
- Use formal or academic vocabulary (CEFR level C1–C2)  
- Reflect abstract, professional, or intellectual themes (e.g., technology, ethics, innovation, policy, science, global affairs)  
- Vary in structure, using compound or complex sentences  
- Avoid everyday routines, idioms, slang, or contractions  
- Be challenging to read aloud but still clear and meaningful

CRITICAL REQUIREMENTS:
1. Each sentence MUST be unique and significantly different from others
2. Focus on professional and technical topics:
   - Technology trends and digital transformation
   - Scientific research and methodology
   - Corporate strategy and management
   - Global economics and policy
   - Innovation and development
   - Professional ethics and responsibility

3. Use advanced sentence structures:
   - Complex subordinate clauses
   - Perfect continuous tenses
   - Passive voice constructions
   - Conditional statements
   - Advanced connectors and transitions

4. Include domain-specific vocabulary:
   - Technical terminology
   - Academic language
   - Professional jargon
   - Industry-specific terms

[Session ID: {random_seed}-{current_time}]

Output exactly 16 unique, well-formed sentences. Place each sentence on a new line.
DO NOT include any annotations, labels, or formatting - just output clean sentences."""

@app.get("/api/repeat-sentence", response_model=RepeatSentenceResponse)
async def generate_repeat_sentence(
    difficulty: Optional[str] = Query("advanced", enum=["beginner", "intermediate", "advanced"]),
    current_user: dict = Depends(get_current_user)
):
    """Generate 16 random sentences for repeat sentence test using Gemini model"""
    try:
        # Check subscription status for Versant access
        subscription = await check_user_subscription(current_user["id"])
        if not subscription["can_access_versant"]:
            raise HTTPException(
                status_code=403,
                detail="Versant rounds are only available for premium users. Please upgrade to access this feature."
            )
        
        # Load sentence history
        history = load_sentence_history()
        user_history = history.get(current_user["id"], {"sentences": [], "timestamp": datetime.utcnow().isoformat()})
        
        # Generate new sentences
        prompt = generate_repeat_sentence_prompt(difficulty)
        sentences_text = call_gemini_api(prompt, max_tokens=1500)  # Increased tokens for longer sentences
        
        # Process and filter sentences
        new_sentences = sentences_text.strip().split('\n')
        new_sentences = [s.strip() for s in new_sentences if s.strip() 
                        and len(s.split()) >= 15  # Minimum 15 words for advanced
                        and len(s.split()) <= 25  # Maximum 25 words
                        and s not in user_history.get("sentences", [])]  # Not in history
        
        # If we don't have enough new sentences, generate more with different prompts
        attempts = 0
        while len(new_sentences) < 16 and attempts < 3:
            # Add attempt number to session ID for more variation
            additional_prompt = generate_repeat_sentence_prompt(difficulty)
            additional_sentences = call_gemini_api(additional_prompt, max_tokens=1500).strip().split('\n')
            additional_sentences = [s.strip() for s in additional_sentences if s.strip() 
                                 and len(s.split()) >= 15 
                                 and len(s.split()) <= 25
                                 and s not in user_history.get("sentences", [])
                                 and s not in new_sentences]
            new_sentences.extend(additional_sentences)
            attempts += 1
        
        # Take only the first 16 sentences
        new_sentences = new_sentences[:16]
        
        # Update history with new sentences
        if "sentences" not in user_history:
            user_history["sentences"] = []
        user_history["sentences"].extend(new_sentences)
        # Keep only last 160 sentences in history (exactly 10 rounds worth of sentences)
        user_history["sentences"] = user_history["sentences"][-160:]
        user_history["timestamp"] = datetime.utcnow().isoformat()
        history[current_user["id"]] = user_history
        save_sentence_history(history)
        
        # If we still don't have enough sentences, use backup sentences
        if len(new_sentences) < 16:
            backup_sentences = [
                "The implementation of artificial intelligence in healthcare systems has revolutionized patient diagnosis and treatment planning across multiple medical disciplines.",
                "Environmental scientists have discovered that the complex interaction between oceanic currents and atmospheric conditions significantly impacts global climate patterns.",
                "The rapid advancement of quantum computing technology presents both unprecedented opportunities and significant challenges for cybersecurity infrastructure.",
                "Recent archaeological discoveries in the ancient ruins have provided compelling evidence about sophisticated urban planning systems in early civilizations.",
                "The integration of sustainable practices in corporate strategies has become increasingly crucial for maintaining competitive advantage in the global market.",
                "Researchers have demonstrated that neuroplasticity continues throughout adulthood, challenging previous assumptions about brain development and learning capacity.",
                "The emergence of decentralized financial systems has fundamentally transformed traditional banking paradigms and monetary policy implementation.",
                "Contemporary urban development must carefully balance population density requirements with environmental sustainability and quality of life considerations.",
                "The proliferation of artificial intelligence applications in legal practice has significantly impacted document review and case law analysis procedures.",
                "Advances in renewable energy technology have accelerated the transition toward sustainable power generation and distribution systems worldwide.",
                "The correlation between socioeconomic factors and educational outcomes requires comprehensive policy solutions addressing multiple systemic variables.",
                "Modern diplomatic relations increasingly incorporate economic cooperation and technological exchange alongside traditional political considerations.",
                "The development of advanced materials science has revolutionized manufacturing processes across numerous industrial sectors globally.",
                "Researchers investigating cognitive development have identified critical periods for language acquisition and skill formation in early childhood.",
                "The implementation of machine learning algorithms in financial markets has transformed traditional approaches to risk assessment and portfolio management.",
                "Contemporary approaches to organizational management emphasize adaptive leadership strategies and continuous professional development programs."
            ]
            remaining_needed = 16 - len(new_sentences)
            new_sentences.extend(backup_sentences[:remaining_needed])
        
        return {
            "sentences": new_sentences,
            "difficulty_level": "C1-C2"
        }

    except Exception as e:
        logger.error(f"Error in generate_repeat_sentence: {str(e)}")
        # Return backup sentences if any error occurs
        backup_sentences = [
            "The implementation of artificial intelligence in healthcare systems has revolutionized patient diagnosis and treatment planning across multiple medical disciplines.",
            "Environmental scientists have discovered that the complex interaction between oceanic currents and atmospheric conditions significantly impacts global climate patterns.",
            "The rapid advancement of quantum computing technology presents both unprecedented opportunities and significant challenges for cybersecurity infrastructure.",
            "Recent archaeological discoveries in the ancient ruins have provided compelling evidence about sophisticated urban planning systems in early civilizations.",
            "The integration of sustainable practices in corporate strategies has become increasingly crucial for maintaining competitive advantage in the global market.",
            "Researchers have demonstrated that neuroplasticity continues throughout adulthood, challenging previous assumptions about brain development and learning capacity.",
            "The emergence of decentralized financial systems has fundamentally transformed traditional banking paradigms and monetary policy implementation.",
            "Contemporary urban development must carefully balance population density requirements with environmental sustainability and quality of life considerations.",
            "The proliferation of artificial intelligence applications in legal practice has significantly impacted document review and case law analysis procedures.",
            "Advances in renewable energy technology have accelerated the transition toward sustainable power generation and distribution systems worldwide.",
            "The correlation between socioeconomic factors and educational outcomes requires comprehensive policy solutions addressing multiple systemic variables.",
            "Modern diplomatic relations increasingly incorporate economic cooperation and technological exchange alongside traditional political considerations.",
            "The development of advanced materials science has revolutionized manufacturing processes across numerous industrial sectors globally.",
            "Researchers investigating cognitive development have identified critical periods for language acquisition and skill formation in early childhood.",
            "The implementation of machine learning algorithms in financial markets has transformed traditional approaches to risk assessment and portfolio management.",
            "Contemporary approaches to organizational management emphasize adaptive leadership strategies and continuous professional development programs."
        ]
        return {
            "sentences": backup_sentences,
            "difficulty_level": "C1-C2"
        }
