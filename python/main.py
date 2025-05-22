import pandas as pd
import joblib
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from statsmodels.tsa.arima.model import ARIMA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
import os
import warnings
from model import Models
from datetime import datetime, timedelta

plt.style.use('seaborn-v0_8')
warnings.filterwarnings("ignore")

class EcommerceAI:
    def __init__(self):
        self.admin_model = None
        self.fashion_model = None
        self.sales_forecasting_data = None
        self.profit_data = None
        self.models_creator = Models()

    # ----------- ADMIN AI: Fake Account Detection(not implemented) -----------
    def train_admin_ai(self, filepath="datasets/fake_accounts.csv"):
        print(f"\n--- Training Admin AI from {filepath} ---")
        try:
            if not os.path.exists(filepath):
                print(f"⚠️ Admin AI dataset '{filepath}' not found. Skipping training.")
                return

            data = pd.read_csv(filepath)
            if "label" not in data.columns or len(data.columns) <= 1:
                print(f"❌ Admin AI data file '{filepath}' must contain a 'label' column and at least one feature column.")
                return

            X = data.drop("label", axis=1)
            y = data["label"]
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            self.admin_model = RandomForestClassifier(random_state=42)
            self.admin_model.fit(X_train, y_train)
            y_pred = self.admin_model.predict(X_test)
            
            print("Admin AI Classification Report:\n", classification_report(y_test, y_pred))
            joblib.dump(self.admin_model, "models/admin_fake_account_model.pkl")
            print("✅ Admin AI Model Trained and Saved to models/admin_fake_account_model.pkl")

        except FileNotFoundError:
            print(f"❌ Admin AI data file not found at '{filepath}'.")
        except Exception as e:
            print(f"❌ Error training Admin AI: {e}")

    # ----------- CUSTOMER AI: Fashion Assistant -----------
    def train_fashion_assistant(self, filepath="fashion.csv"):
        self.fashion_model = self.models_creator.create_fashion_model(filepath)
        if self.fashion_model:
            print("✅ Fashion Assistant AI ready.")
        else:
            print("⚠️ Fashion Assistant AI could not be initialized.")

    def fashion_assistant(self, prompt: str) -> str:
        if not self.fashion_model:
            try:
                self.fashion_model = joblib.load("models/fashion_assistant_model_created.pkl")
                print("✅ Loaded pre-existing Fashion Assistant Model.")
            except:
                return "\n⚠️ Fashion Assistant model not trained. Call `train_fashion_assistant()` first."
        
        print(f"\n🔍 Fashion Assistant received prompt: \"{prompt}\"")
        try:
            prediction = self.fashion_model.predict([prompt])
            
            if prediction.size > 0:
                response = prediction[0]
                return f"\n✨ Fashion Advice:\n   For '{prompt}', we recommend: **{response}**"
            else:
                return "\n⚠️ Could not generate fashion advice for this query."
        except Exception as e:
            return f"\n⚠️ Error generating fashion advice: {e}"

    # ----------- SELLER AI: Enhanced Sales Forecasting & Profit Analysis -----------
    def prepare_sales_data(self, filepath="products.csv"):
        result = self.models_creator.create_sales_data_preprocessor(filepath)
        if result and len(result) == 2:
            self.sales_forecasting_data, self.profit_data = result
            if self.sales_forecasting_data is not None:
                print("✅ Sales and profit data prepared for forecasting.")
                return True
        print("⚠️ Sales data could not be prepared.")
        return False

    def forecast_sales(self, data_filepath="products.csv", months_to_forecast=3):
        if self.sales_forecasting_data is None or self.profit_data is None:
            print("Sales data not yet prepared. Preparing now...")
            if not self.prepare_sales_data(data_filepath):
                print("❌ Cannot proceed with sales forecasting due to data preparation issues.")
                return None, 0.0, None

        print(f"\n--- Advanced Sales & Profit Analysis for next {months_to_forecast} month(s) ---")
        
        sales_forecasts = {}
        profit_forecasts = {}
        historical_performance = {}
        
        for product in self.sales_forecasting_data.columns:
            sales_series = self.sales_forecasting_data[product].astype(float)
            profit_series = self.profit_data[product].astype(float) if product in self.profit_data.columns else sales_series * 0.2
            
            if sales_series.sum() == 0:
                continue
            
            try:
                if len(sales_series) >= 5:
                    sales_model = ARIMA(sales_series, order=(1, 1, 1), enforce_stationarity=False, enforce_invertibility=False)
                    sales_fit = sales_model.fit()
                    sales_forecast = sales_fit.forecast(steps=months_to_forecast)
                else:
                    sales_forecast = pd.Series([sales_series.mean()] * months_to_forecast)

                if len(profit_series) >= 5:
                    profit_model = ARIMA(profit_series, order=(1, 1, 1), enforce_stationarity=False, enforce_invertibility=False)
                    profit_fit = profit_model.fit()
                    profit_forecast = profit_fit.forecast(steps=months_to_forecast)
                else:
                    profit_forecast = pd.Series([profit_series.mean()] * months_to_forecast)
                
                sales_forecasts[product] = max(0, sales_forecast.sum())
                profit_forecasts[product] = max(0, profit_forecast.sum())
                
                historical_performance[product] = {
                    'avg_monthly_sales': sales_series.mean(),
                    'avg_monthly_profit': profit_series.mean(),
                    'sales_trend': self._calculate_trend(sales_series),
                    'profit_margin': (profit_series.sum() / sales_series.sum()) * 100 if sales_series.sum() > 0 else 0,
                    'consistency': 1 / (sales_series.std() + 1)  
                }
                
            except Exception as e:
                print(f"⚠️ Error forecasting for {product}: {e}")
                continue

        if not sales_forecasts:
            print("📉 No products available for forecasting.")
            return None, 0.0, None

        best_sales_product = max(sales_forecasts, key=sales_forecasts.get)
        best_profit_product = max(profit_forecasts, key=profit_forecasts.get)
        
        profitability_scores = {}
        for product in profit_forecasts:
            if product in historical_performance:
                score = (profit_forecasts[product] * 
                        historical_performance[product]['consistency'] * 
                        (1 + historical_performance[product]['sales_trend']))
                profitability_scores[product] = max(0, score)
        
        best_overall_product = max(profitability_scores, key=profitability_scores.get) if profitability_scores else best_profit_product

        print(f"\n📊 SALES FORECASTING RESULTS")
        print(f"{'='*50}")
        print(f"🏆 Best Product for SALES Volume: **{best_sales_product}**")
        print(f"   Forecasted Sales: ${sales_forecasts[best_sales_product]:,.2f}")
        
        print(f"\n💰 Best Product for PROFIT: **{best_profit_product}**")
        print(f"   Forecasted Profit: ${profit_forecasts[best_profit_product]:,.2f}")
        
        print(f"\n🎯 RECOMMENDED Product (Overall Best): **{best_overall_product}**")
        print(f"   Forecasted Profit: ${profit_forecasts[best_overall_product]:,.2f}")
        print(f"   Profitability Score: {profitability_scores[best_overall_product]:,.2f}")
        
        self.create_comprehensive_plots(sales_forecasts, profit_forecasts, historical_performance, months_to_forecast)
        
        return best_overall_product, profit_forecasts[best_overall_product], profitability_scores

    def _calculate_trend(self, series):
        if len(series) < 2:
            return 0
        x = np.arange(len(series))
        slope = np.polyfit(x, series, 1)[0]
        return slope / series.mean() if series.mean() != 0 else 0

    def create_comprehensive_plots(self, sales_forecasts, profit_forecasts, historical_performance, months_to_forecast):
        
        plt.style.use('seaborn-v0_8')
        fig = plt.figure(figsize=(20, 15))
        
        # 1. Sales Forecast Comparison
        plt.subplot(2, 3, 1)
        products = list(sales_forecasts.keys())[:10]  # Top 10 products
        sales_values = [sales_forecasts[p] for p in products]
        bars = plt.bar(products, sales_values, color='skyblue', alpha=0.7)
        plt.title(f'Sales Forecast - Next {months_to_forecast} Months', fontsize=14, fontweight='bold')
        plt.xlabel('Products')
        plt.ylabel('Forecasted Sales ($)')
        plt.xticks(rotation=45, ha='right')
        # Add value labels on bars
        for bar, value in zip(bars, sales_values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(sales_values)*0.01,
                    f'${value:,.0f}', ha='center', va='bottom', fontsize=8)
        plt.tight_layout()
        
        # 2. Profit Forecast Comparison
        plt.subplot(2, 3, 2)
        profit_values = [profit_forecasts[p] for p in products]
        bars = plt.bar(products, profit_values, color='lightgreen', alpha=0.7)
        plt.title(f'Profit Forecast - Next {months_to_forecast} Months', fontsize=14, fontweight='bold')
        plt.xlabel('Products')
        plt.ylabel('Forecasted Profit ($)')
        plt.xticks(rotation=45, ha='right')
        # Add value labels on bars
        for bar, value in zip(bars, profit_values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(profit_values)*0.01,
                    f'${value:,.0f}', ha='center', va='bottom', fontsize=8)
        plt.tight_layout()
        
        # 3. Profit Margin Analysis
        plt.subplot(2, 3, 3)
        margins = [historical_performance[p]['profit_margin'] for p in products if p in historical_performance]
        product_names = [p for p in products if p in historical_performance]
        colors = ['red' if m < 15 else 'orange' if m < 25 else 'green' for m in margins]
        bars = plt.bar(product_names, margins, color=colors, alpha=0.7)
        plt.title('Profit Margin by Product (%)', fontsize=14, fontweight='bold')
        plt.xlabel('Products')
        plt.ylabel('Profit Margin (%)')
        plt.xticks(rotation=45, ha='right')
        plt.axhline(y=20, color='red', linestyle='--', alpha=0.5, label='Target: 20%')
        plt.legend()
        plt.tight_layout()
        
        # 4. Sales Trend Analysis
        plt.subplot(2, 3, 4)
        trends = [historical_performance[p]['sales_trend'] for p in products if p in historical_performance]
        colors = ['red' if t < 0 else 'green' for t in trends]
        bars = plt.bar(product_names, trends, color=colors, alpha=0.7)
        plt.title('Sales Trend Direction', fontsize=14, fontweight='bold')
        plt.xlabel('Products')
        plt.ylabel('Trend Score')
        plt.xticks(rotation=45, ha='right')
        plt.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        plt.tight_layout()
        
        # 5. Revenue vs Profit Scatter
        plt.subplot(2, 3, 5)
        x_sales = [sales_forecasts[p] for p in products]
        y_profit = [profit_forecasts[p] for p in products]
        plt.scatter(x_sales, y_profit, alpha=0.7, s=100, c='purple')
        for i, product in enumerate(products):
            plt.annotate(product[:15], (x_sales[i], y_profit[i]), 
                        xytext=(5, 5), textcoords='offset points', fontsize=8)
        plt.title('Revenue vs Profit Forecast', fontsize=14, fontweight='bold')
        plt.xlabel('Forecasted Sales ($)')
        plt.ylabel('Forecasted Profit ($)')
        plt.grid(True, alpha=0.3)
        
        # 6. Top 5 Recommended Products
        plt.subplot(2, 3, 6)
        # Calculate overall scores for top recommendations
        overall_scores = {}
        for product in products:
            if product in historical_performance:
                score = (profit_forecasts[product] * 0.4 + 
                        sales_forecasts[product] * 0.3 + 
                        historical_performance[product]['consistency'] * 1000 * 0.3)
                overall_scores[product] = score
        
        top_5 = sorted(overall_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        top_products, top_scores = zip(*top_5)
        
        bars = plt.barh(top_products, top_scores, color='gold', alpha=0.7)
        plt.title('Top 5 Recommended Products\n(Overall Score)', fontsize=14, fontweight='bold')
        plt.xlabel('Overall Score')
        plt.gca().invert_yaxis()
        
        # Add value labels
        for bar, score in zip(bars, top_scores):
            plt.text(bar.get_width() + max(top_scores)*0.01, bar.get_y() + bar.get_height()/2,
                    f'{score:,.0f}', ha='left', va='center', fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        
        plt.savefig('plots/comprehensive_seller_analysis.png', dpi=300, bbox_inches='tight')
        print(f"✅ Comprehensive analysis plot saved as 'plots/comprehensive_seller_analysis.png'")
        
        self.plot_individual_forecast(top_products[0])

        plt.show()

    def plot_individual_forecast(self, product_name):
        if product_name not in self.sales_forecasting_data.columns:
            return
            
        plt.figure(figsize=(12, 8))
        
        historical_sales = self.sales_forecasting_data[product_name]
        historical_profit = self.profit_data[product_name] if product_name in self.profit_data.columns else historical_sales * 0.2
        
        plt.subplot(2, 1, 1)
        plt.plot(historical_sales.index, historical_sales.values, marker='o', linewidth=2, label='Historical Sales', color='blue')
        plt.title(f'Sales Analysis for {product_name}', fontsize=16, fontweight='bold')
        plt.ylabel('Sales ($)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.subplot(2, 1, 2)
        plt.plot(historical_profit.index, historical_profit.values, marker='s', linewidth=2, label='Historical Profit', color='green')
        plt.title(f'Profit Analysis for {product_name}', fontsize=16, fontweight='bold')
        plt.xlabel('Date')
        plt.ylabel('Profit ($)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        safe_filename = product_name.replace(' ', '_').replace('/', '_')
        plt.savefig(f'plots/{safe_filename}_detailed_analysis.png', dpi=300, bbox_inches='tight')
        print(f"✅ Detailed analysis for {product_name} saved as 'plots/{safe_filename}_detailed_analysis.png'")

if __name__ == "__main__":
    ai = EcommerceAI()
    # Optional, you can delete it but recommended to keep it
    os.makedirs("data", exist_ok=True)
    os.makedirs("plots", exist_ok=True)
    
    fake_accounts_filepath = "data/fake_accounts.csv"
    if not os.path.exists(fake_accounts_filepath):
        print(f"Creating dummy file for Admin AI testing at {fake_accounts_filepath}")
        dummy_admin_data = {
            'followers_count': np.random.randint(0, 1000, 100),
            'friends_count': np.random.randint(0, 500, 100),
            'posts_count': np.random.randint(0, 200, 100),
            'has_profile_pic': np.random.randint(0, 2, 100),
            'name_length': np.random.randint(3, 15, 100),
            'label': np.random.randint(0, 2, 100)
        }
        pd.DataFrame(dummy_admin_data).to_csv(fake_accounts_filepath, index=False)
        print(f"✅ Dummy {fake_accounts_filepath} created.")

    print("\n" + "="*60)
    print("🚀 ECOMMERCE AI SYSTEM TESTING")
    print("="*60)

    print("\n--- (OPTIONAL) TRAINING ADMIN AI ---")
    ai.train_admin_ai(filepath=fake_accounts_filepath)

    print("\n--- TRAINING FASHION ASSISTANT ---")
    ai.train_fashion_assistant("./data/fashion.csv")

    print("\n--- FASHION STYLIST RECOMMENDATIONS ---")
    fashion_queries = [
        "girl birthday party all",
        "boy festival north_india ethnic wear",
        "Suggest an outfit for a boy attending a college fest in Bangalore",
        "Suggest an outfit for a girl for ramzan festival"
    ]
    
    for query in fashion_queries:
        print(ai.fashion_assistant(query))

    print("\n--- ADVANCED SALES FORECASTING & PROFIT ANALYSIS ---")
    print("🔄 Preparing sales data and generating forecasts...")
    
    best_product, best_profit, scores = ai.forecast_sales("./data/products.csv", months_to_forecast=3)
    
    if best_product:
        print(f"\n" + "="*60)
        print("📋 SELLER RECOMMENDATIONS SUMMARY")
        print("="*60)
        print(f"🎯 PRIMARY RECOMMENDATION: Focus on **{best_product}**")
        print(f"💰 Expected Profit (3 months): ${best_profit:,.2f}")
        print(f"📈 Profitability Score: {scores[best_product]:,.2f}")
        
        print(f"\n📊 KEY INSIGHTS:")
        print(f"   • This product shows the best combination of profit potential and market consistency")
        print(f"   • Focus your inventory and marketing efforts on this product")
        print(f"   • Monitor the generated plots for detailed market analysis")
        
        print(f"\n📁 Generated Analysis Files:")
        print(f"   • Comprehensive analysis: plots/comprehensive_seller_analysis.png")
        print(f"   • Detailed product analysis: plots/{best_product.replace(' ', '_').replace('/', '_')}_detailed_analysis.png")
        
    else:
        print("❌ Could not generate seller recommendations. Check your data files.")
    
    print(f"\n" + "="*60)
    print("✅ ECOMMERCE AI SYSTEM TEST COMPLETED")
    print("="*60)