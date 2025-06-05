from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai import EcommerceAI
import os
from typing import Optional

app = FastAPI(title="Ecommerce AI API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI instance
ai_instance = EcommerceAI()

# Pydantic models for request/response
class FashionQuery(BaseModel):
    prompt: str

class TrainingRequest(BaseModel):
    filepath: Optional[str] = None
    months_to_forecast: Optional[int] = 3

class AIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# Initialize AI models on startup
@app.on_event("startup")
async def startup_event():
    """Initialize AI models when the API starts"""
    try:
        # Create directories if they don't exist
        os.makedirs("data", exist_ok=True)
        os.makedirs("plots", exist_ok=True)
        os.makedirs("models", exist_ok=True)
        
        # Try to load existing models or train new ones
        print("🚀 Initializing AI models...")
        
        # Fashion Assistant
        ai_instance.train_fashion_assistant("./data/fashion.csv")
        
        # Sales Forecaster (if data exists)
        if os.path.exists("./data/products.csv"):
            ai_instance.train_sales_forecaster("./data/products.csv")
            
        print("✅ AI models initialized successfully")
    except Exception as e:
        print(f"⚠️ Error during startup: {e}")

@app.get("/")
def read_root():
    return {"message": "Ecommerce AI API is running", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "ai_ready": True}

# Fashion Assistant Endpoints
@app.post("/ai/fashion/query", response_model=AIResponse)
async def fashion_query(query: FashionQuery):
    """Get fashion recommendations from AI"""
    try:
        result = ai_instance.fashion_assistant(query.prompt)
        return AIResponse(
            success=True,
            message="Fashion recommendation generated",
            data={"recommendation": result}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting fashion advice: {str(e)}")

@app.post("/ai/fashion/train", response_model=AIResponse)
async def train_fashion_model(request: TrainingRequest):
    """Train or retrain the fashion assistant model"""
    try:
        filepath = request.filepath or "./data/fashion.csv"
        ai_instance.train_fashion_assistant(filepath)
        return AIResponse(
            success=True,
            message="Fashion assistant model trained successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training fashion model: {str(e)}")

# Sales Forecasting Endpoints
@app.post("/ai/sales/forecast", response_model=AIResponse)
async def get_sales_forecast():
    """Get sales forecasting results"""
    try:
        result = ai_instance.sales_forecaster()
        return AIResponse(
            success=True,
            message="Sales forecast generated",
            data={"forecast": result}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sales forecast: {str(e)}")

@app.post("/ai/sales/train", response_model=AIResponse)
async def train_sales_model(request: TrainingRequest):
    """Train or retrain the sales forecasting model"""
    try:
        filepath = request.filepath or "./data/products.csv"
        months = request.months_to_forecast or 3
        
        success = ai_instance.train_sales_forecaster(filepath, months)
        if success:
            return AIResponse(
                success=True,
                message="Sales forecasting model trained successfully"
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to train sales model")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training sales model: {str(e)}")

# Admin AI Endpoints (placeholder for future implementation)
@app.post("/ai/admin/train", response_model=AIResponse)
async def train_admin_model(request: TrainingRequest):
    """Train admin AI model (fake account detection)"""
    try:
        filepath = request.filepath or "./data/fake_accounts.csv"
        ai_instance.train_admin_ai(filepath)
        return AIResponse(success=True, message="Admin AI model training initiated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training admin model: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)