# import pandas as pd
import joblib
# import numpy as np
# import os
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

    # ----------- ADMIN AI: Fake Account Detection(not implemented) -----------
    def train_admin_ai(self, filepath: str="fake_accounts.csv"):
        #? Not implemented
        pass

    # ----------- CUSTOMER AI: Fashion Assistant -----------
    def train_fashion_assistant(self, filepath:str="fashion.csv"):
        """Train the fashion assistant model"""
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
        """Get fashion recommendations"""
        try:
            if self.fashion_model is None:
                print("⚠️ Fashion model not trained, training now...")
                self.train_fashion_assistant("./data/fashion.csv")
            
            if self.fashion_model is None:
                return "Fashion assistant is not available. Please train the model first."
            
            # Simple recommendation based on the prompt
            predictions = self.fashion_model.predict([prompt])
            return f"Based on your request '{prompt}', I recommend: {predictions[0]}"
        except Exception as e:
            print(f"❌ Error in fashion assistant: {e}")
            return f"Sorry, I couldn't process your request: {str(e)}"

    # ----------- SELLER AI: Enhanced Sales Forecasting & Profit Analysis -----------
    def train_sales_forecaster(self, filepath:str="products.csv", months_to_forecast:int=3):
        """Train the sales forecasting model"""
        try:
            print(f"📈 Training sales forecaster with data from {filepath}")
            self.sales_model = self.models.create_sales_forecasting_model(filepath, months_to_forecast)
            if self.sales_model:
                # Generate visualizations
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
        """Get sales forecasting results"""
        try:
            print("📊 Generating sales forecast...")
            
            if self.sales_model is None:
                print("⚠️ Sales model not trained, training now...")
                if not self.train_sales_forecaster("./data/products.csv"):
                    raise Exception("Failed to train sales model")
            
            # Ensure the sales model is available before proceeding
            if self.sales_model is None:
                # This state implies an issue with the training logic if it was attempted,
                # as train_sales_forecaster should ensure the model is set if it returns True.
                raise Exception("Sales model is unexpectedly None prior to forecasting.")

            # Return the forecast results
            forecast_data = self.sales_model.copy()
            
            # Remove large data objects to avoid serialization issues
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
    # Optional, you can delete it but recommended to keep it
    # os.makedirs("data", exist_ok=True)
    # os.makedirs("plots", exist_ok=True)
    
    # fake_accounts_filepath = "data/fake_accounts.csv"
    # if not os.path.exists(fake_accounts_filepath):
    #     print(f"Creating dummy file for Admin AI testing at {fake_accounts_filepath}")
    #     dummy_admin_data = {
    #         'followers_count': np.random.randint(0, 1000, 100),
    #         'friends_count': np.random.randint(0, 500, 100),
    #         'posts_count': np.random.randint(0, 200, 100),
    #         'has_profile_pic': np.random.randint(0, 2, 100),
    #         'name_length': np.random.randint(3, 15, 100),
    #         'label': np.random.randint(0, 2, 100)
    #     }
    #     pd.DataFrame(dummy_admin_data).to_csv(fake_accounts_filepath, index=False)
    #     print(f"✅ Dummy {fake_accounts_filepath} created.")

    print("\n" + "="*60)
    print("🚀 ECOMMERCE AI SYSTEM TESTING")
    print("="*60)

    # print("\n--- (OPTIONAL) TRAINING ADMIN AI ---")
    # ai.train_admin_ai(filepath=fake_accounts_filepath)

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