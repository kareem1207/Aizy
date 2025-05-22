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
from datetime import datetime, timedelta

plt.style.use('seaborn-v0_8')
warnings.filterwarnings("ignore")

class Models:
    def __init__(self):
        # Optional, you can delete it but recommended to keep it
        os.makedirs("models", exist_ok=True)
        os.makedirs("plots", exist_ok=True)
    
    def create_fashion_model(self, filepath="./data/fashion.csv"):
        print(f"\n--- Creating Fashion Model from {filepath} ---")
        try:
            if not os.path.exists(filepath):
                print(f"⚠️ Fashion data file '{filepath}' not found. Creating dummy data.")
                self._create_dummy_fashion_data(filepath)
            
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
                ('tfidf', TfidfVectorizer(stop_words='english', max_features=1000)),
                ('clf', RandomForestClassifier(random_state=42, n_estimators=100))
            ])
            
            model_pipeline.fit(X, y)
            print("✅ Fashion Model Created and Trained Successfully.")
            
            joblib.dump(model_pipeline, "models/fashion_assistant_model_created.pkl")
            print("✅ Fashion Model saved to models/fashion_assistant_model_created.pkl")
            return model_pipeline
            
        except FileNotFoundError:
            print(f"❌ Fashion data file not found at '{filepath}'. Creating dummy data.")
            self._create_dummy_fashion_data(filepath)
            return self.create_fashion_model(filepath)
        except Exception as e:
            print(f"❌ Error creating fashion model: {e}")
            return None
    
    def _create_dummy_fashion_data(self, filepath):
        categories = ['shirt', 'dress', 'jeans', 'saree', 'kurta', 'tshirt', 'skirt']
        genders = ['male', 'female', 'unisex']
        regions = ['north_india', 'south_india', 'west_india', 'east_india']
        occasions = ['casual', 'formal', 'party', 'wedding', 'festival', 'office']
        
        dummy_data = []
        for i in range(100):
            category = np.random.choice(categories)
            gender = np.random.choice(genders)
            region = np.random.choice(regions)
            occasion = np.random.choice(occasions)
            product_name = f"{category}_{gender}_{occasion}_{i%20}"
            
            dummy_data.append({
                'category': category,
                'gender': gender,
                'region': region,
                'occasion': occasion,
                'product_name': product_name
            })
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        pd.DataFrame(dummy_data).to_csv(filepath, index=False)
        print(f"✅ Dummy fashion data created at '{filepath}'")
    
    def create_sales_data_preprocessor(self, filepath="./data/products.csv"):
        print(f"\n--- Preprocessing Sales Data from {filepath} for Forecasting ---")
        try:
            if not os.path.exists(filepath):
                print(f"⚠️ Sales data file '{filepath}' not found. Creating dummy data.")
                self._create_dummy_sales_data(filepath)
            
            sales_data = pd.read_csv(filepath)
            if sales_data.empty:
                print(f"❌ Sales data file '{filepath}' is empty.")
                return None, None
            
            date_col = None
            product_col = None
            sales_col = None
            profit_col = None
            
            for col in sales_data.columns:
                col_lower = col.lower()
                if 'date' in col_lower:
                    date_col = col
                elif 'product' in col_lower and 'name' in col_lower:
                    product_col = col
                elif col_lower in ['sales', 'revenue', 'amount']:
                    sales_col = col
                elif col_lower in ['profit', 'margin']:
                    profit_col = col
            
            if not all([date_col, product_col, sales_col]):
                print(f"❌ Required columns not found. Available columns: {list(sales_data.columns)}")
                return None, None
            
            sales_data[date_col] = pd.to_datetime(sales_data[date_col], dayfirst=True, errors='coerce')
            sales_data.dropna(subset=[date_col], inplace=True)
            if profit_col is None:
                sales_data['Profit'] = sales_data[sales_col] * 0.2
                profit_col = 'Profit'
                print("⚠️ No profit column found. Using estimated 20% profit margin.")
            
            monthly_data = sales_data.groupby([
                sales_data[date_col].dt.to_period("M"), 
                product_col
            ]).agg({
                sales_col: 'sum',
                profit_col: 'sum'
            }).reset_index()
            
            sales_pivot = monthly_data.pivot(index=date_col, columns=product_col, values=sales_col).fillna(0)
            profit_pivot = monthly_data.pivot(index=date_col, columns=product_col, values=profit_col).fillna(0)
            
            sales_pivot.index = sales_pivot.index.to_timestamp()
            profit_pivot.index = profit_pivot.index.to_timestamp()
            
            if sales_pivot.empty:
                print(f"❌ No sales data available after preprocessing '{filepath}'.")
                return None, None
            
            print("✅ Sales Data Preprocessed Successfully.")
            return sales_pivot, profit_pivot
            
        except FileNotFoundError:
            print(f"❌ Sales data file not found at '{filepath}'. Creating dummy data.")
            self._create_dummy_sales_data(filepath)
            return self.create_sales_data_preprocessor(filepath)
        except Exception as e:
            print(f"❌ Error preprocessing sales data: {e}")
            return None, None
    
    def _create_dummy_sales_data(self, filepath):
        products = ['iPhone 13', 'Samsung Galaxy S22', 'MacBook Air', 'Dell Laptop', 
                   'Nike Shoes', 'Adidas T-Shirt', 'Sony Headphones', 'Canon Camera']
        
        start_date = datetime.now() - timedelta(days=365)
        dates = pd.date_range(start=start_date, periods=100, freq='D')
        
        dummy_data = []
        for date in dates:
            for _ in range(np.random.randint(1, 5)):  
                product = np.random.choice(products)
                sales = np.random.uniform(100, 2000)
                profit = sales * np.random.uniform(0.1, 0.3)  
                
                dummy_data.append({
                    'Order Date': date.strftime('%d/%m/%Y'),
                    'Product Name': product,
                    'Sales': round(sales, 2),
                    'Profit': round(profit, 2)
                })
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        pd.DataFrame(dummy_data).to_csv(filepath, index=False)
        print(f"✅ Dummy sales data created at '{filepath}'")