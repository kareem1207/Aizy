"""
Simple FastAPI server starter
Run this instead of using uvicorn directly
"""
import subprocess
import sys
import os

def start_server():
    """Start the FastAPI server using the fastapi CLI"""
    try:
        print("Starting Ecommerce AI API Server...")
        print("Server will be available at: http://127.0.0.1:8000")
        print("API Documentation: http://127.0.0.1:8000/docs")
        print("Health Check: http://127.0.0.1:8000/health")
        print("Plots: http://127.0.0.1:8000/plots")
        print("\n" + "="*60)
        print("Note: Auto-reload disabled for stability")
        
        # Use fastapi run for production (no auto-reload to prevent constant restarts)
        cmd = [sys.executable, "-m", "fastapi", "run", "main.py", "--host", "127.0.0.1", "--port", "8000"]
        
        # Start the server
        subprocess.run(cmd, cwd=os.path.dirname(__file__))
        
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Try running: python -m fastapi run main.py --host 127.0.0.1 --port 8000")

if __name__ == "__main__":
    start_server()
