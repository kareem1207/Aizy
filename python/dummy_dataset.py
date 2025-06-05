import random
import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta

class Dummy_Dataset:
    def __init__(self):
        pass

    def _create_dummy_fashion_data(self, filepath):
        categories = ['Shirts', 'Dresses', 'Jeans', 'Shoes', 'Accessories', 'Jackets', 'Skirts', 'Bags']
        genders = ['Male', 'Female', 'Unisex']
        regions = ['North', 'South', 'East', 'West', 'Central']
        occasions = ['Casual', 'Formal', 'Party', 'Wedding', 'Office', 'Sports', 'Beach']
        
        dummy_data = []
        for i in range(200):
            category = np.random.choice(categories)
            gender = np.random.choice(genders)
            region = np.random.choice(regions)
            occasion = np.random.choice(occasions)
            product_name = f"{gender} {category} for {occasion}"
            
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
        products = [
            'Summer Dress', 'Winter Jacket', 'Running Shoes', 'Casual Shirt',
            'Formal Pants', 'Handbag', 'Sunglasses', 'Watch', 'Sneakers',
            'T-Shirt', 'Jeans', 'Blazer', 'Sandals', 'Backpack', 'Scarf'
        ]
        
        # Create 12 months of data
        start_date = datetime.now() - timedelta(days=365)
        dummy_data = []
        
        for i in range(365):
            current_date = start_date + timedelta(days=i)
            for product in products:
                # Simulate seasonal trends
                base_sales = random.randint(100, 1000)
                seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * i / 365)
                
                sales = int(base_sales * seasonal_factor)
                profit = sales * random.uniform(0.15, 0.35)  # 15-35% profit margin
                
                dummy_data.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'product_name': product,
                    'sales': sales,
                    'profit': round(profit, 2)
                })
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        pd.DataFrame(dummy_data).to_csv(filepath, index=False)
        print(f"✅ Dummy sales data created at '{filepath}'")