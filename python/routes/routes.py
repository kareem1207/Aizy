from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from ai import EcommerceAI
from pydantic import BaseModel

router = APIRouter()

# Initialize AI instance for routes
ai_instance = EcommerceAI()

class FashionQuery(BaseModel):
    prompt: str

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page showing available AI services"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Ecommerce AI Services</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .service { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
            .endpoint { background: #e8f4f8; padding: 10px; margin: 5px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <h1>🚀 Ecommerce AI API Services</h1>
        
        <div class="service">
            <h2>👗 Fashion Assistant</h2>
            <div class="endpoint">POST /ai/fashion/query - Get fashion recommendations</div>
            <div class="endpoint">POST /ai/fashion/train - Train fashion model</div>
        </div>
        
        <div class="service">
            <h2>📊 Sales Forecasting</h2>
            <div class="endpoint">POST /ai/sales/forecast - Get sales predictions</div>
            <div class="endpoint">POST /ai/sales/train - Train forecasting model</div>
        </div>
        
        <div class="service">
            <h2>🛡️ Admin AI</h2>
            <div class="endpoint">POST /ai/admin/train - Train admin model</div>
        </div>
        
        <p><a href="/docs">📖 View Interactive API Documentation</a></p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.post("/fashion/recommend")
async def fashion_recommend(query: FashionQuery):
    """Fashion recommendation endpoint for routes"""
    try:
        result = ai_instance.fashion_assistant(query.prompt)
        return {"success": True, "recommendation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))