import random
import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta

class Dummy_Dataset:
    def __init__(self):
        pass

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