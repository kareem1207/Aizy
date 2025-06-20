import warnings
from model import Models
from pathlib import Path

warnings.filterwarnings("ignore")

class EcommerceAI:
    def __init__(self):
        print("🤖 Initializing EcommerceAI...")
        self.models = Models()
        self.fashion_model = None
        self.sales_model = None
        print("✅ EcommerceAI initialized")


    def train_fashion_assistant(self, filepath:str="fashion.csv"):
        try:
            print(f"👗 Training fashion assistant with data from {filepath}")
            self.fashion_model = self.models.create_fashion_model(filepath)
            if self.fashion_model:
                print("✅ Fashion Assistant AI ready.")
                return True
            else:
                print("❌ Fashion Assistant training failed.")
                return False
        except Exception as e:
            print(f"❌ Error training fashion assistant: {e}")
            return False

    def fashion_assistant(self, prompt:str):
        try:
            if self.fashion_model is None:
                print("⚠️ Fashion model not trained, training now...")
                self.train_fashion_assistant("./data/fashion.csv")
            
            if self.fashion_model is None:
                return "Fashion assistant is not available. Please train the model first."
            
            predictions = self.fashion_model.predict([prompt])
            return f"Based on your request '{prompt}', I recommend: {predictions[0]}"
        except Exception as e:
            print(f"❌ Error in fashion assistant: {e}")
            return f"Sorry, I couldn't process your request: {str(e)}"

    def train_sales_forecaster(self, filepath:str="products.csv", months_to_forecast:int=3):
        try:
            print(f"📈 Training sales forecaster with data from {filepath}")
            self.sales_model = self.models.create_sales_forecasting_model(filepath, months_to_forecast)
            if self.sales_model:
                self.models.create_forecast_visualizations(self.sales_model)
                print("✅ Sales Forecaster AI ready.")
                return True
            else:
                print("❌ Sales Forecaster training failed.")
                return False
        except Exception as e:
            print(f"❌ Error training sales forecaster: {e}")
            return False

    def sales_forecaster(self):
        try:
            print("📊 Generating sales forecast...")
            
            if self.sales_model is None:
                print("⚠️ Sales model not trained, training now...")
                if not self.train_sales_forecaster("./data/products.csv"):
                    raise Exception("Failed to train sales model")
            
            if self.sales_model is None:
                raise Exception("Sales model is unexpectedly None prior to forecasting.")

            forecast_data = self.sales_model.copy()
            
            if 'sales_data' in forecast_data:
                del forecast_data['sales_data']
            if 'profit_data' in forecast_data:
                del forecast_data['profit_data']
                
            print("✅ Sales forecast generated successfully")
            return forecast_data
            
        except Exception as e:
            print(f"❌ Error in sales forecaster: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Sales forecasting failed: {str(e)}")

if __name__ == "__main__":
    ai = EcommerceAI()
    print("\n" + "="*60)
    print("🚀 ECOMMERCE AI SYSTEM TESTING")
    print("="*60)

    print("\n--- TRAINING FASHION ASSISTANT ---")
    ai.train_fashion_assistant("./data/fashion.csv")

    print("\n--- FASHION STYLIST RECOMMENDATIONS ---")
    fashion_queries = [
        "girl birthday party all",
        "boy festival north_india ethnic wear",
        "Suggest an outfit for a boy attending a college fest in Bangalore",
        "Suggest an outfit for a girl for ramzan festival",
        "Suggest an outfit for a boy for a wedding in Mumbai",
        "I need a dress for a dasara, i am a girl",
        "Suggest an outfit for a girl for a cristhmas party",
        "I am a boy and i need to attend a client meeting in a corporate office",
        "Suggest an outfit for a girl for attending a conference at Delhi",
        "I have a party coming up on Sunday, i am a girl",
        "I have a party coming up on Sunday, i am a boy",
        "This is test to find boy dress"
    ]
    
    for query in fashion_queries:
        print(ai.fashion_assistant(query))

    print("\n--- ADVANCED SALES FORECASTING & PROFIT ANALYSIS ---")
    print("🔄 Training sales forecasting model...")
    
    ai.train_sales_forecaster("./data/products.csv", months_to_forecast=12)
    
    forecast_results = ai.sales_forecaster()
    
    if forecast_results:
        print(forecast_results)
    else:
        print("❌ Could not generate seller recommendations. Check your data files.")
    
    print(f"\n" + "="*60)
    print("✅ ECOMMERCE AI SYSTEM TEST COMPLETED")
    print("="*60)