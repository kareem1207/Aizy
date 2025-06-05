import pandas as pd
import joblib
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend to avoid threading issues
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from statsmodels.tsa.arima.model import ARIMA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
import os
import warnings
from typing import cast

warnings.filterwarnings("ignore")
class Models:
    def __init__(self):
        #? Optional, you can delete it but recommended to keep it
        os.makedirs("models", exist_ok=True)
        os.makedirs("plots", exist_ok=True)
    
    def create_fashion_model(self, filepath:str="fashion.csv"):
        print(f"\n--- Creating Fashion Model from {filepath} ---")
        try:
            data = pd.read_csv(filepath)
            if data.empty:
                print(f"❌ Fashion data file '{filepath}' is empty.")
                return None
            for col in ['category', 'gender', 'region', 'occasion']:
                if col in data.columns:
                    data[col] = data[col].astype(str)
                else:
                    data[col] = 'unknown'
            
            data['features'] = data['category'] + " " + data['gender'] + " " + \
                                data['region'] + " " + data['occasion']
            
            X = data['features']
            y = data['product_name'] if 'product_name' in data.columns else data.iloc[:, -1]
            
            if X.empty or y.empty:
                print(f"❌ No features or target found after processing '{filepath}'.")
                return None
            model_pipeline = Pipeline([
                        ('count', TfidfVectorizer(stop_words='english', max_features=1000)),
                        ('clf', RandomForestClassifier(random_state=42, n_estimators=100))
            ])

            model_pipeline.fit(X, y)
            print("✅ Fashion Model Created and Trained Successfully.")
            joblib.dump(model_pipeline, "models/fashion_assistant_model_created.pkl")
            print("✅ Fashion Model saved to models/fashion_assistant_model_created.pkl")
            return model_pipeline
        except Exception as e:
            if e is FileNotFoundError:
                print(f"❌ Fashion data file not found at '{filepath}' will suggest to use the dummy_dataset.py code to generate few fake dataset.")
                return self.create_fashion_model(filepath)
            print(f"❌ Error creating fashion model: {e}")
            return None
    
    def create_sales_data_preprocessor(self, filepath:str="products.csv"):
        print(f"\n--- Preparing Sales Data from {filepath} ---")
        try: 
            sales_data = pd.read_csv(filepath)
            if sales_data.empty:
                print("❌ Sales data file is empty. Use the dummy_dataset.py code to generate a few fake datasets.")
                return None, None
            date_col = next((col for col in sales_data.columns if 'date' in col.lower()), None)
            product_col = next((col for col in sales_data.columns if 'product' in col.lower() and 'name' in col.lower()), None)
            sales_col = next((col for col in sales_data.columns if col.lower() in ['sales', 'revenue', 'amount']), None)
            profit_col = next((col for col in sales_data.columns if col.lower() in ['profit', 'margin']), None)

            if not all([date_col, product_col, sales_col]):
                print(f"❌ Required columns missing. Found: {list(sales_data.columns)}")
                return None, None

            sales_data[date_col] = pd.to_datetime(sales_data[date_col], errors='coerce')
            sales_data.dropna(subset=[date_col], inplace=True)
            
            if profit_col is None:
                profit_col = 'Profit'
                sales_data[profit_col] = sales_data[sales_col] * 0.2
                print("⚠️ No profit column found. Using 20% of sales as profit.")
                
            monthly_data = sales_data.groupby([
                sales_data[date_col].dt.to_period("M"), product_col
            ]).agg({
                sales_col: 'sum', profit_col: 'sum'
            }).reset_index()
            sales_pivot = monthly_data.pivot(index=date_col, columns=product_col, values=sales_col).fillna(0)
            profit_pivot = monthly_data.pivot(index=date_col, columns=product_col, values=profit_col).fillna(0)
            
            sales_pivot.index = cast(pd.PeriodIndex, sales_pivot.index).to_timestamp()
            profit_pivot.index = cast(pd.PeriodIndex, profit_pivot.index).to_timestamp()
            
            print("✅ Sales Data Prepared Successfully!")
            return sales_pivot, profit_pivot
            
        except FileNotFoundError:
            print(f"❌ Sales data file not found at '{filepath}'.")
            return None, None
        except Exception as e:
            print(f"❌ Error processing sales data: {e}")
            return None, None
    
    def _calculate_trend(self, series):
        if len(series) < 2:
            return 0
        x = np.arange(len(series))
        slope = np.polyfit(x, series, 1)[0]
        return slope / series.mean() if series.mean() != 0 else 0
        
    def create_sales_forecasting_model(self, filepath:str="./data/products.csv", months_to_forecast:int=3):
        print(f"\n--- Creating Sales Forecasting Model (forecasting {months_to_forecast} months) ---")
        try:
            result = self.create_sales_data_preprocessor(filepath)
            if result is None or len(result) != 2:  
                return None
            sales_data, profit_data = result
            if sales_data.empty or profit_data.empty:  
                print("❌ No data available for forecasting")
                return None
            forecasts = {
                'sales_forecasts': {},
                'profit_forecasts': {},
                'historical_performance': {}
            }
            for product in sales_data.columns:
                sales_series = sales_data[product].astype(float)
                profit_series = profit_data[product].astype(float)
                
                if sales_series.sum() == 0:
                    continue
                
                try:
                    has_enough_data = len(sales_series) >= 5
                    
                    if has_enough_data:
                        sales_model = ARIMA(sales_series, order=(1, 1, 1), 
                                            enforce_stationarity=False, enforce_invertibility=False)
                        sales_forecast = sales_model.fit().forecast(steps=months_to_forecast)
                    else:
                        sales_forecast = pd.Series([sales_series.mean()] * months_to_forecast)
                    if has_enough_data:
                        profit_model = ARIMA(profit_series, order=(1, 1, 1),
                                            enforce_stationarity=False, enforce_invertibility=False)
                        profit_forecast = profit_model.fit().forecast(steps=months_to_forecast)
                    else:
                        profit_forecast = pd.Series([profit_series.mean()] * months_to_forecast)
                    forecasts['sales_forecasts'][product] = max(0, sales_forecast.sum())
                    forecasts['profit_forecasts'][product] = max(0, profit_forecast.sum())
                    forecasts['historical_performance'][product] = {
                        'avg_monthly_sales': sales_series.mean(),
                        'avg_monthly_profit': profit_series.mean(),
                        'sales_trend': self._calculate_trend(sales_series),
                        'profit_margin': (profit_series.sum() / sales_series.sum()) * 100 if sales_series.sum() > 0 else 0,
                        'consistency': 1 / (sales_series.std() + 1)
                    }
                    
                except Exception as e:
                    print(f"⚠️ Skipping forecast for {product}: {str(e)[:100]}")
                    continue

            if not forecasts['sales_forecasts']:
                print("📉 No products available for forecasting.")
                return None

            sales_f = forecasts['sales_forecasts']
            profit_f = forecasts['profit_forecasts']
            hist_perf = forecasts['historical_performance']
            best_sales_product = max(sales_f, key=lambda k: sales_f[k])
            best_profit_product = max(profit_f, key=lambda k: profit_f[k])
            
            profitability_scores = {}
            for product in profit_f:
                if product in hist_perf:
                    score = (profit_f[product] * 
                           hist_perf[product]['consistency'] * 
                                (1 + hist_perf[product]['sales_trend']))
                    profitability_scores[product] = max(0, score)
            
            best_overall_product = max(profitability_scores, key=lambda k: profitability_scores[k]) if profitability_scores else best_profit_product
            forecasting_results = {
                'sales_forecasts': sales_f,
                'profit_forecasts': profit_f,
                'historical_performance': hist_perf,
                'best_sales_product': best_sales_product,
                'best_profit_product': best_profit_product,
                'best_overall_product': best_overall_product,
                'profitability_scores': profitability_scores,
                'months_forecasted': months_to_forecast,
                'sales_data': sales_data,
                'profit_data': profit_data
            }
            joblib.dump(forecasting_results, "models/sales_forecasting_model.pkl")
            print("✅ Sales Forecasting Model created and saved")
            return forecasting_results
        except Exception as e:
            print(f"❌ Error creating forecasting model: {e}")
            return None
        
    def create_forecast_visualizations(self, forecasting_results):
        if not forecasting_results:
            print("❌ No forecasting results available for visualization.")
            return False
            
        try:
            # Set matplotlib to use Agg backend to avoid GUI issues
            plt.switch_backend('Agg')
            
            sales_f = forecasting_results['sales_forecasts']
            profit_f = forecasting_results['profit_forecasts'] 
            hist_perf = forecasting_results['historical_performance']
            months = forecasting_results['months_forecasted']
            best_product = forecasting_results['best_overall_product']
            
            products = list(sales_f.keys())[:10]
            
            plt.figure(figsize=(20, 15))
            
            # 1. Sales forecast comparison
            plt.subplot(2, 3, 1)
            sales_values = [sales_f[p] for p in products]
            bars = plt.bar(products, sales_values, color='skyblue')
            plt.title(f'Sales Forecast - Next {months} Months', fontweight='bold')
            plt.xlabel('Products')
            plt.ylabel('Sales ($)')
            plt.xticks(rotation=45, ha='right')
            
            # 2. Profit forecast comparison
            plt.subplot(2, 3, 2)
            profit_values = [profit_f[p] for p in products]
            plt.bar(products, profit_values, color='lightgreen')
            plt.title(f'Profit Forecast - Next {months} Months', fontweight='bold')
            plt.xticks(rotation=45, ha='right')
            
            # 3. Profit Margin Analysis
            plt.subplot(2, 3, 3)
            margins = [hist_perf[p]['profit_margin'] for p in products if p in hist_perf]
            product_names = [p for p in products if p in hist_perf]
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
            trends = [hist_perf[p]['sales_trend'] for p in products if p in hist_perf]
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
            x_sales = [sales_f[p] for p in products]
            y_profit = [profit_f[p] for p in products]
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
                if product in hist_perf:
                    score = (profit_f[product] * 0.4 + 
                            sales_f[product] * 0.3 + 
                            hist_perf[product]['consistency'] * 1000 * 0.3)
                    overall_scores[product] = score
            
            top_5 = sorted(overall_scores.items(), key=lambda x: x[1], reverse=True)[:5]
            top_products, top_scores = zip(*top_5)
            
            bars = plt.barh(top_products, top_scores, color='gold', alpha=0.7)
            plt.title('Top 5 Recommended Products\n(Overall Score)', fontsize=14, fontweight='bold')
            plt.xlabel('Overall Score')
            plt.gca().invert_yaxis()
            
            for bar, score in zip(bars, top_scores):
                plt.text(bar.get_width() + max(top_scores)*0.01, bar.get_y() + bar.get_height()/2,
                        f'{score:,.0f}', ha='left', va='center', fontsize=10, fontweight='bold')
            
            plt.tight_layout()
            
            plt.savefig('plots/comprehensive_seller_analysis.png', dpi=300, bbox_inches='tight')
            print(f"✅ Comprehensive analysis plot saved as 'plots/comprehensive_seller_analysis.png'")
            
            self._plot_individual_forecast(best_product, forecasting_results['sales_data'], forecasting_results['profit_data'])
            
            plt.close('all')  # Close all figures to free memory
            return True
            
        except Exception as e:
            print(f"❌ Error creating forecast visualizations: {e}")
            import traceback
            traceback.print_exc()
            return False
            
    def _plot_individual_forecast(self, product_name : str, sales_data, profit_data):
        if product_name not in sales_data.columns:
            return
            
        plt.switch_backend('Agg')  # Ensure Agg backend
        plt.figure(figsize=(12, 8))
        
        historical_sales = sales_data[product_name]
        historical_profit = profit_data[product_name] if product_name in profit_data.columns else historical_sales * 0.2
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
        plt.close('all')  # Close all figures