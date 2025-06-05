"""
Development FastAPI server with auto-reload
Use this only when actively developing
"""
import subprocess
import sys
import os

def start_dev_server():
    """Start the FastAPI development server with auto-reload"""
    try:
        print("🔧 Starting DEVELOPMENT server with auto-reload...")
        print("📡 Server will be available at: http://127.0.0.1:8000")
        print("📊 API Documentation: http://127.0.0.1:8000/docs")
        print("⚠️ Auto-reload is ON - server will restart on file changes")
        print("\n" + "="*60)
        
        # Use fastapi dev for development (with auto-reload)
        cmd = [sys.executable, "-m", "fastapi", "dev", "main.py", "--host", "127.0.0.1", "--port", "8000"]
        
        # Start the server
        subprocess.run(cmd, cwd=os.path.dirname(__file__))
        
    except KeyboardInterrupt:
        print("\n🛑 Development server stopped by user")
    except Exception as e:
        print(f"❌ Error starting development server: {e}")

if __name__ == "__main__":
    start_dev_server()
