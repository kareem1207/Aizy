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
        self.admin_model = None
        self.fashion_model = None
        self.sales_forecasting_data = None
        self.profit_data = None
        self.models_creator = Models()

    # ----------- ADMIN AI: Fake Account Detection(not implemented) -----------
    def train_admin_ai(self, filepath: str="fake_accounts.csv"):
        #? Not implemented
        pass

    # ----------- CUSTOMER AI: Fashion Assistant -----------
    def train_fashion_assistant(self, filepath:str="fashion.csv"):
        self.fashion_model = self.models_creator.create_fashion_model(filepath)
        if self.fashion_model:
            print("✅ Fashion Assistant AI ready.")
        else:
            print("⚠️ Fashion Assistant AI could not be initialized.")

    def fashion_assistant(self, prompt:str):
        if not self.fashion_model:
            try:
                self.fashion_model = joblib.load("models/fashion_assistant_model_created.pkl")
                print("✅ Loaded pre-existing Fashion Assistant Model.")
            except:
                return "\n⚠️ Fashion Assistant model not trained. Call `train_fashion_assistant()` first."
        
        print(f"\n🔍 Fashion Assistant received prompt: \"{prompt}\"")
        try:
            prediction = self.fashion_model.predict([prompt])
            if len(prediction) > 0:
                response = prediction[0]
                return f"\n✨ Fashion Advice:\n   For '{prompt}', we recommend: **{response}**"
            else:
                return "\n⚠️ Could not generate fashion advice for this query."
        except Exception as e:
            return f"\n⚠️ Error generating fashion advice: {e}"

    # ----------- SELLER AI: Enhanced Sales Forecasting & Profit Analysis -----------
    def train_sales_forecaster(self, filepath:str="products.csv", months_to_forecast:int=3):
        self.forecasting_results = self.models_creator.create_sales_forecasting_model(
            filepath=filepath,
            months_to_forecast=months_to_forecast
        )
        
        if self.forecasting_results:
            self.models_creator.create_forecast_visualizations(self.forecasting_results)
            print("✅ Sales Forecaster AI ready.")
            return True
        else:
            print("⚠️ Sales Forecaster AI could not be initialized.")
            return False

    def sales_forecaster(self):
        if not hasattr(self, 'forecasting_results') or self.forecasting_results is None:
            try:
                self.forecasting_results = joblib.load("models/sales_forecasting_model.pkl")
                print("✅ Loaded pre-existing Sales Forecasting Model.")
            except:
                return "\n⚠️ No existing forecasting model found. Please train the model first by calling train_sales_forecaster()"
        
        if not self.forecasting_results:
            return "\n⚠️ Sales forecasting model contains no data. Please check your data file and retrain."
        
        try:
            best_overall_product = self.forecasting_results['best_overall_product']
            best_profit_product = self.forecasting_results['best_profit_product']
            best_sales_product = self.forecasting_results['best_sales_product']
            
            profit_forecasts = self.forecasting_results['profit_forecasts']
            sales_forecasts = self.forecasting_results['sales_forecasts']
            profitability_scores = self.forecasting_results['profitability_scores']
            
            response = f"\n📊 SALES FORECASTING RESULTS\n{'='*50}\n"
            response += f"🏆 Best Product for SALES Volume: **{best_sales_product}**\n"
            response += f"   Forecasted Sales: ${sales_forecasts[best_sales_product]:,.2f}\n\n"
            
            response += f"💰 Best Product for PROFIT: **{best_profit_product}**\n"
            response += f"   Forecasted Profit: ${profit_forecasts[best_profit_product]:,.2f}\n\n"
            
            response += f"🎯 RECOMMENDED Product (Overall Best): **{best_overall_product}**\n"
            response += f"   Forecasted Profit: ${profit_forecasts[best_overall_product]:,.2f}\n"
            response += f"   Profitability Score: {profitability_scores[best_overall_product]:,.2f}\n\n"
            
            response += f"📁 Generated Analysis Files:\n"
            response += f"   • Comprehensive analysis: plots/comprehensive_seller_analysis.png\n"
            response += f"   • Detailed product analysis: plots/{best_overall_product.replace(' ', '_').replace('/', '_')}_detailed_analysis.png"
            
            return response
        except Exception as e:
            return f"\n⚠️ Error generating sales forecast: {str(e)}"
    
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

    print("\n--- (OPTIONAL) TRAINING ADMIN AI ---")
    # ai.train_admin_ai(filepath=fake_accounts_filepath)

    # print("\n--- TRAINING FASHION ASSISTANT ---")
    # ai.train_fashion_assistant("./data/fashion.csv")

    # print("\n--- FASHION STYLIST RECOMMENDATIONS ---")
    # fashion_queries = [
    #     "girl birthday party all",
    #     "boy festival north_india ethnic wear",
    #     "Suggest an outfit for a boy attending a college fest in Bangalore",
    #     "Suggest an outfit for a girl for ramzan festival",
    #     "Suggest an outfit for a boy for a wedding in Mumbai",
    #     "I need a dress for a dasara, i am a girl",
    #     "Suggest an outfit for a girl for a cristhmas party",
    #     "I am a boy and i need to attend a client meeting in a corporate office",
    #     "Suggest an outfit for a girl for attending a conference at Delhi",
    #     "I have a party coming up on Sunday, i am a girl",
    #     "I have a party coming up on Sunday, i am a boy",
    #     "This is test to find boy dress"
    # ]
    
    # for query in fashion_queries:
    #     print(ai.fashion_assistant(query))

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