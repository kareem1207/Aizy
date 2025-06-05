from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ai import EcommerceAI
import os
from typing import Optional
import asyncio

app = FastAPI(title="Ecommerce AI API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI instance globally
ai_instance = None

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

def initialize_ai_models():
    """Initialize AI models synchronously"""
    global ai_instance
    try:
        # Create directories if they don't exist
        os.makedirs("data", exist_ok=True)
        os.makedirs("plots", exist_ok=True)
        os.makedirs("models", exist_ok=True)
        
        print("🚀 Initializing AI models...")
        
        # Initialize AI instance
        ai_instance = EcommerceAI()
        
        # Fashion Assistant
        try:
            ai_instance.train_fashion_assistant("./data/fashion.csv")
            print("✅ Fashion assistant initialized")
        except Exception as e:
            print(f"⚠️ Fashion assistant initialization failed: {e}")
        
        # Sales Forecaster (if data exists)
        try:
            if os.path.exists("./data/products.csv"):
                ai_instance.train_sales_forecaster("./data/products.csv")
                print("✅ Sales forecaster initialized")
            else:
                print("ℹ️ No products.csv found, sales forecaster will be trained on first request")
        except Exception as e:
            print(f"⚠️ Sales forecaster initialization failed: {e}")
            
        print("✅ AI models initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Error during AI initialization: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize AI models when the API starts"""
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, initialize_ai_models)
        
        # Mount static files after AI initialization - only once
        if os.path.exists("plots") and not hasattr(app, '_plots_mounted'):
            app.mount("/plots", StaticFiles(directory="plots"), name="plots")
            app._plots_mounted = True
            print("📁 Static plots directory mounted at /plots")
    except Exception as e:
        print(f"⚠️ Startup error: {e}")

@app.get("/")
def read_root():
    return {"message": "Ecommerce AI API is running", "status": "active"}

@app.get("/health")
def health_check():
    global ai_instance
    return {
        "status": "healthy", 
        "ai_ready": ai_instance is not None,
        "plots_available": os.path.exists("plots")
    }

# Fashion Assistant Endpoints
@app.post("/ai/fashion/query", response_model=AIResponse)
async def fashion_query(query: FashionQuery):
    """Get fashion recommendations from AI"""
    global ai_instance
    try:
        if ai_instance is None:
            ai_instance = EcommerceAI()
            
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
    global ai_instance
    try:
        if ai_instance is None:
            ai_instance = EcommerceAI()
            
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
    global ai_instance
    try:
        print("📊 Starting sales forecast generation...")
        
        if ai_instance is None:
            print("🔄 AI instance not found, initializing...")
            ai_instance = EcommerceAI()
            
        result = ai_instance.sales_forecaster()
        print("✅ Sales forecast completed successfully")
        
        # Add plot URLs to the result
        if result:
            plot_base_url = "http://127.0.0.1:8000/plots"
            best_product = result.get('best_overall_product', 'product')
            safe_product_name = best_product.replace(' ', '_').replace('/', '_').replace('\\', '_')
            
            result["plot_urls"] = {
                "comprehensive_analysis": f"{plot_base_url}/comprehensive_seller_analysis.png",
                "detailed_analysis": f"{plot_base_url}/{safe_product_name}_detailed_analysis.png"
            }
            print(f"📈 Added plot URLs to response")
        
        return AIResponse(
            success=True,
            message="Sales forecast generated successfully",
            data={"forecast": result}
        )
    except Exception as e:
        print(f"❌ Error in get_sales_forecast: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting sales forecast: {str(e)}")

@app.post("/ai/sales/train", response_model=AIResponse)
async def train_sales_model(request: TrainingRequest):
    """Train or retrain the sales forecasting model"""
    global ai_instance
    try:
        if ai_instance is None:
            ai_instance = EcommerceAI()
            
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
    global ai_instance
    try:
        if ai_instance is None:
            ai_instance = EcommerceAI()
            
        filepath = request.filepath or "./data/fake_accounts.csv"
        ai_instance.train_admin_ai(filepath)
        return AIResponse(success=True, message="Admin AI model training initiated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training admin model: {str(e)}")