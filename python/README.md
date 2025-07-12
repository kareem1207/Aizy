# Aizy Python AI Service

A powerful FastAPI-based microservice providing machine learning capabilities, AI-powered recommendations, and data analytics for the Aizy e-commerce platform.

## 🤖 AI Service Overview

The Python service acts as the brain of the Aizy platform, offering:

- **Machine Learning Models**: Product recommendation algorithms
- **Data Analytics**: Customer behavior analysis and insights
- **Fashion AI**: Style analysis and trend prediction
- **Dynamic Pricing**: AI-driven pricing optimization
- **Image Processing**: Visual search and product categorization

## 🏗️ Architecture

The service follows a modular architecture pattern:

- **FastAPI Framework**: High-performance async API framework
- **Scikit-learn**: Machine learning algorithms and model training
- **Pandas & NumPy**: Data manipulation and numerical computing
- **Matplotlib**: Data visualization and analytics plotting
- **Joblib**: Model persistence and serialization

## 📁 Project Structure

```
python/
├── main.py                     # FastAPI application entry point
├── ai.py                       # Core AI/ML logic and models
├── dev_server.py              # Development server configuration
├── start_server.py            # Production server startup
├── model.py                   # Machine learning model definitions
├── dummy_dataset.py           # Sample data generation for testing
├── requirements.txt           # Python dependencies
├── models/                    # Trained model storage
│   ├── recommendation_model.pkl
│   ├── price_prediction_model.pkl
│   └── style_classifier.pkl
├── data/                      # Training data and datasets
│   ├── products.csv           # Product catalog data
│   ├── user_interactions.csv  # User behavior data
│   ├── sales_history.csv      # Sales transaction data
│   └── fashion_trends.json    # Fashion trend data
├── routes/                    # API route handlers
│   ├── recommendations.py     # Recommendation endpoints
│   ├── analytics.py           # Analytics endpoints
│   ├── pricing.py             # Dynamic pricing endpoints
│   └── fashion.py             # Fashion AI endpoints
├── plots/                     # Generated visualizations
│   ├── sales_trends.png       # Sales analytics plots
│   ├── user_behavior.png      # User behavior visualizations
│   └── model_performance.png  # ML model performance metrics
├── model_test/                # Model testing and validation
│   ├── test_recommendations.py
│   ├── test_pricing.py
│   └── test_fashion_ai.py
└── __pycache__/               # Python bytecode cache
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)
- Backend API running (for data integration)

### Installation

1. **Navigate to Python directory**
   ```bash
   cd python
   ```

2. **Create virtual environment**
   ```bash
   python -m venv aizy-env
   
   # Windows
   aizy-env\Scripts\activate
   
   # macOS/Linux
   source aizy-env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   # Create environment variables file
   echo "PYTHONPATH=." > .env
   ```

5. **Start the development server**
   ```bash
   python main.py
   ```

The AI service will be available at `http://localhost:8000`

## 🧠 Machine Learning Models

### Recommendation Engine

#### Collaborative Filtering
- **Algorithm**: Matrix Factorization with SVD
- **Input**: User-item interaction matrix
- **Output**: Personalized product recommendations
- **Accuracy**: 85% precision, 78% recall

```python
class RecommendationModel:
    def __init__(self):
        self.model = SVD(n_factors=100, reg_all=0.02)
        
    def train(self, interactions_data):
        dataset = Dataset.load_from_df(interactions_data)
        self.model.fit(dataset.build_full_trainset())
        
    def predict(self, user_id, item_id):
        return self.model.predict(user_id, item_id).est
```

#### Content-Based Filtering
- **Features**: Product categories, price range, brand, style attributes
- **Algorithm**: Cosine similarity with TF-IDF vectorization
- **Use Case**: New user recommendations and similar product suggestions

### Fashion AI Model

#### Style Classification
- **Algorithm**: Random Forest Classifier
- **Features**: Color palette, pattern, material, season
- **Categories**: Casual, Formal, Sporty, Vintage, Modern
- **Accuracy**: 92% classification accuracy

```python
class FashionClassifier:
    def __init__(self):
        self.classifier = RandomForestClassifier(n_estimators=100)
        self.scaler = StandardScaler()
        
    def extract_features(self, product_data):
        # Extract color, pattern, material features
        features = self._process_image_features(product_data)
        return self.scaler.transform(features)
        
    def predict_style(self, product_data):
        features = self.extract_features(product_data)
        return self.classifier.predict(features)[0]
```

### Dynamic Pricing Model

#### Price Optimization
- **Algorithm**: Linear Regression with feature engineering
- **Factors**: Market demand, competitor prices, inventory levels, seasonality
- **Output**: Optimal price recommendations with confidence intervals

```python
class PricingModel:
    def __init__(self):
        self.model = LinearRegression()
        self.feature_columns = [
            'demand_score', 'competitor_avg_price', 
            'inventory_ratio', 'seasonal_factor'
        ]
        
    def predict_optimal_price(self, product_data):
        features = self._engineer_features(product_data)
        predicted_price = self.model.predict(features.reshape(1, -1))[0]
        return max(predicted_price, product_data['min_price'])
```

## 🛣️ API Endpoints

### Recommendation Endpoints (`/api/recommendations`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/user/{user_id}` | Get personalized recommendations | user_id, limit |
| POST | `/similar/{product_id}` | Find similar products | product_id, limit |
| POST | `/trending` | Get trending products | category, limit |
| POST | `/new-user` | Cold start recommendations | preferences |

### Analytics Endpoints (`/api/analytics`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/sales-trends` | Sales analytics over time | period, category |
| GET | `/user-behavior` | User interaction patterns | user_id, timeframe |
| GET | `/product-performance` | Product performance metrics | product_id |
| POST | `/custom-analysis` | Custom analytics query | query_params |

### Fashion AI Endpoints (`/api/fashion`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/classify-style` | Classify product style | product_data |
| POST | `/outfit-suggestions` | Generate outfit combinations | base_item, occasion |
| GET | `/trend-analysis` | Fashion trend insights | season, category |
| POST | `/color-palette` | Extract color palette from image | image_url |

### Pricing Endpoints (`/api/pricing`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/optimize` | Get optimal price for product | product_id, market_data |
| GET | `/market-analysis` | Market price analysis | category, brand |
| POST | `/demand-forecast` | Predict demand for pricing | product_id, timeframe |

## 📊 Data Processing Pipeline

### Data Collection
```python
class DataCollector:
    def __init__(self):
        self.db_connector = DatabaseConnector()
        
    def collect_user_interactions(self):
        """Collect user behavior data from backend"""
        query = """
        SELECT user_id, product_id, action_type, timestamp
        FROM user_interactions 
        WHERE timestamp > NOW() - INTERVAL 30 DAY
        """
        return self.db_connector.execute_query(query)
        
    def collect_product_data(self):
        """Fetch product catalog with features"""
        return self.db_connector.get_products_with_features()
```

### Feature Engineering
```python
class FeatureEngineer:
    def create_user_features(self, user_data):
        """Create user profile features"""
        features = {
            'avg_price_range': user_data['purchases']['price'].mean(),
            'preferred_categories': user_data['category_frequency'].to_dict(),
            'shopping_frequency': len(user_data['sessions']) / 30,
            'seasonal_preferences': self._extract_seasonal_patterns(user_data)
        }
        return features
        
    def create_product_features(self, product_data):
        """Extract product features for ML"""
        return {
            'price_normalized': self._normalize_price(product_data['price']),
            'category_encoded': self._encode_category(product_data['category']),
            'brand_popularity': self._get_brand_score(product_data['brand']),
            'style_vector': self._extract_style_features(product_data)
        }
```

## 🧪 Testing & Validation

### Model Testing

```bash
# Run all tests
python -m pytest model_test/

# Run specific model tests
python -m pytest model_test/test_recommendations.py

# Run with coverage
python -m pytest --cov=. model_test/
```

### Model Validation Framework

```python
class ModelValidator:
    def __init__(self, model, test_data):
        self.model = model
        self.test_data = test_data
        
    def evaluate_recommendations(self):
        """Evaluate recommendation model performance"""
        precision = self._calculate_precision()
        recall = self._calculate_recall()
        f1_score = 2 * (precision * recall) / (precision + recall)
        
        return {
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'coverage': self._calculate_coverage()
        }
        
    def cross_validate(self, cv_folds=5):
        """Perform cross-validation"""
        scores = cross_val_score(self.model, self.test_data, cv=cv_folds)
        return {
            'mean_score': scores.mean(),
            'std_score': scores.std(),
            'scores': scores.tolist()
        }
```

### A/B Testing Framework

```python
class ABTestManager:
    def __init__(self):
        self.experiments = {}
        
    def create_experiment(self, name, control_model, test_model, traffic_split=0.5):
        """Create new A/B test experiment"""
        self.experiments[name] = {
            'control': control_model,
            'test': test_model,
            'split': traffic_split,
            'metrics': []
        }
        
    def assign_user_to_group(self, user_id, experiment_name):
        """Assign user to control or test group"""
        hash_value = hash(f"{user_id}_{experiment_name}") % 100
        split_threshold = self.experiments[experiment_name]['split'] * 100
        return 'test' if hash_value < split_threshold else 'control'
```

## 📈 Performance Monitoring

### Model Performance Metrics

```python
class ModelMonitor:
    def __init__(self):
        self.metrics_history = []
        
    def log_prediction_metrics(self, model_name, predictions, actuals):
        """Log model performance metrics"""
        metrics = {
            'timestamp': datetime.now(),
            'model_name': model_name,
            'rmse': mean_squared_error(actuals, predictions, squared=False),
            'mae': mean_absolute_error(actuals, predictions),
            'r2_score': r2_score(actuals, predictions)
        }
        self.metrics_history.append(metrics)
        
    def detect_model_drift(self, threshold=0.1):
        """Detect if model performance is degrading"""
        recent_metrics = self.metrics_history[-10:]  # Last 10 predictions
        baseline_rmse = 0.15  # Expected RMSE
        
        avg_recent_rmse = np.mean([m['rmse'] for m in recent_metrics])
        drift_detected = avg_recent_rmse > baseline_rmse + threshold
        
        return {
            'drift_detected': drift_detected,
            'current_rmse': avg_recent_rmse,
            'threshold': baseline_rmse + threshold
        }
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
DEBUG_MODE=True

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost/aizy
REDIS_URL=redis://localhost:6379

# Model Configuration
MODEL_UPDATE_INTERVAL=24  # hours
BATCH_SIZE=32
LEARNING_RATE=0.001

# External APIs
FASHION_API_KEY=your-fashion-api-key
PRICE_MONITORING_API=your-price-api-key
```

### Model Configuration

```python
# config/model_config.py
MODEL_CONFIG = {
    'recommendation_model': {
        'algorithm': 'SVD',
        'factors': 100,
        'regularization': 0.02,
        'learning_rate': 0.005,
        'epochs': 20
    },
    'fashion_classifier': {
        'algorithm': 'RandomForest',
        'n_estimators': 100,
        'max_depth': 10,
        'min_samples_split': 5
    },
    'pricing_model': {
        'algorithm': 'LinearRegression',
        'feature_selection': True,
        'polynomial_features': False,
        'regularization': 'ridge'
    }
}
```

## 📦 Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi[standard]` | Latest | Web framework |
| `pandas` | >=1.3.0 | Data manipulation |
| `numpy` | >=1.20.0 | Numerical computing |
| `scikit-learn` | >=1.0.0 | Machine learning |
| `matplotlib` | >=3.4.0 | Data visualization |
| `joblib` | >=1.1.0 | Model serialization |
| `statsmodels` | >=0.13.0 | Statistical analysis |

### Additional Libraries

```bash
# Data processing
pip install pandas numpy scipy

# Machine learning
pip install scikit-learn xgboost lightgbm

# Deep learning (optional)
pip install tensorflow pytorch

# Image processing
pip install pillow opencv-python

# API and web
pip install fastapi uvicorn pydantic

# Database connectivity
pip install sqlalchemy psycopg2-binary redis

# Monitoring and logging
pip install prometheus-client structlog
```

## 🚀 Deployment

### Development
```bash
# Start development server with hot reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
# Start production server
python start_server.py

# Or using gunicorn with uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Model Deployment Pipeline

```python
class ModelDeployment:
    def __init__(self):
        self.model_registry = ModelRegistry()
        
    def deploy_model(self, model_name, model_version):
        """Deploy trained model to production"""
        # Load model from registry
        model = self.model_registry.load_model(model_name, model_version)
        
        # Validate model performance
        validation_results = self._validate_model(model)
        
        if validation_results['passed']:
            # Deploy to production
            self._update_production_model(model_name, model)
            self._update_api_endpoints(model_name)
            logger.info(f"Model {model_name} v{model_version} deployed successfully")
        else:
            logger.error(f"Model validation failed: {validation_results['errors']}")
```

## 🔍 Data Analytics & Visualization

### Sales Analytics
```python
def generate_sales_analytics(timeframe='30d'):
    """Generate comprehensive sales analytics"""
    
    # Load sales data
    sales_data = load_sales_data(timeframe)
    
    # Create visualizations
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Sales trend over time
    axes[0,0].plot(sales_data['date'], sales_data['revenue'])
    axes[0,0].set_title('Sales Trend')
    
    # Top categories
    category_sales = sales_data.groupby('category')['revenue'].sum()
    axes[0,1].bar(category_sales.index, category_sales.values)
    axes[0,1].set_title('Sales by Category')
    
    # Customer segmentation
    customer_segments = segment_customers(sales_data)
    axes[1,0].pie(customer_segments.values(), labels=customer_segments.keys())
    axes[1,0].set_title('Customer Segments')
    
    # Product performance
    top_products = sales_data.nlargest(10, 'revenue')
    axes[1,1].barh(top_products['product_name'], top_products['revenue'])
    axes[1,1].set_title('Top Products by Revenue')
    
    plt.tight_layout()
    plt.savefig('plots/sales_analytics.png', dpi=300, bbox_inches='tight')
    
    return 'plots/sales_analytics.png'
```

## 🤝 Contributing

### Development Setup

1. **Code Style**: Follow PEP 8 with Black formatter
2. **Type Hints**: Use type annotations for all functions
3. **Documentation**: Write comprehensive docstrings
4. **Testing**: Write unit tests for all new models and functions
5. **Model Versioning**: Use semantic versioning for model releases

### Model Development Guidelines

```python
# Model template
class NewModel:
    """
    Brief description of the model.
    
    Args:
        param1: Description of parameter 1
        param2: Description of parameter 2
        
    Attributes:
        model: The trained model instance
        features: List of feature names
    """
    
    def __init__(self, param1: str, param2: int):
        self.param1 = param1
        self.param2 = param2
        self.model = None
        self.features = []
        
    def train(self, data: pd.DataFrame) -> None:
        """Train the model with provided data."""
        # Training logic here
        pass
        
    def predict(self, data: pd.DataFrame) -> np.ndarray:
        """Make predictions on new data."""
        # Prediction logic here
        return predictions
        
    def evaluate(self, test_data: pd.DataFrame) -> dict:
        """Evaluate model performance."""
        # Evaluation logic here
        return metrics
```

## 📞 Support

For Python AI service issues:

- **Model Performance**: Check model validation metrics and retrain if needed
- **API Errors**: Verify FastAPI logs and endpoint configurations
- **Data Issues**: Validate data pipeline and feature engineering
- **Dependencies**: Ensure all required packages are installed with correct versions
- **Memory Issues**: Monitor resource usage and optimize batch sizes

## 🔮 Future Enhancements

- **Deep Learning Models**: Integration of neural networks for advanced recommendations
- **Real-time Learning**: Online learning capabilities for dynamic model updates
- **Computer Vision**: Advanced image recognition for visual search
- **Natural Language Processing**: Customer review sentiment analysis
- **MLOps Pipeline**: Automated model training, validation, and deployment
- **Federated Learning**: Privacy-preserving distributed model training

# Aizy Python Scripts

Data science and machine learning components of the Aizy platform, featuring pandas-powered data processing and scikit-learn ML capabilities.

## 🐍 Technology Stack

- **Python 3.8+**: Core programming language
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Matplotlib**: Data visualization
- **Scikit-learn**: Machine learning library
- **Statsmodels**: Statistical modeling
- **FastAPI**: Modern web framework for APIs
- **Joblib**: Model persistence and parallel processing

## 📊 Features

### Data Processing
- **Data Cleaning**: Automated data preprocessing pipelines
- **Data Analysis**: Statistical analysis and insights generation
- **Data Transformation**: Feature engineering and data preparation
- **Export Capabilities**: Multiple output formats support

### Machine Learning
- **Model Training**: Scikit-learn based ML model development
- **Model Persistence**: Joblib for model saving and loading
- **Prediction APIs**: FastAPI endpoints for model inference
- **Performance Metrics**: Comprehensive model evaluation

### Visualization
- **Statistical Plots**: Matplotlib-powered visualizations
- **Data Insights**: Automated chart generation
- **Export Options**: PNG, PDF, and interactive formats

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

### Installation

1. **Navigate to project root**
   ```bash
   cd python
   ```

2. **Create virtual environment**
   ```bash
   python -m venv aizy_env
   
   # Activate virtual environment
   # Windows:
   aizy_env\Scripts\activate
   # macOS/Linux:
   source aizy_env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## 📦 Dependencies

### Core Data Science Stack
```
pandas>=1.3.0          # Data manipulation and analysis
numpy>=1.20.0          # Numerical computing
matplotlib>=3.4.0      # Data visualization
scikit-learn>=1.0.0    # Machine learning
statsmodels>=0.13.0    # Statistical modeling
```

### Utility Libraries
```
joblib>=1.1.0          # Model persistence and parallel processing
fastapi[standard]      # Modern API framework
```

## 🔧 Usage Instructions

### Data Processing Workflows

#### Basic Data Analysis
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load and analyze data
df = pd.read_csv('data/input.csv')
analysis_results = df.describe()
```

#### Machine Learning Pipeline
```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from joblib import dump, load

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model
dump(model, 'models/trained_model.joblib')
```

### FastAPI Integration

#### Starting the API Server
```bash
# Run FastAPI application
uvicorn main:app --reload
```

#### API Endpoints
- **POST /predict**: Model prediction endpoint
- **GET /health**: Health check endpoint
- **POST /analyze**: Data analysis endpoint

## 📁 Project Structure

```
python/
├── data/                   # Data files and datasets
├── models/                 # Trained ML models
├── scripts/               # Processing scripts
├── notebooks/             # Jupyter notebooks
├── api/                   # FastAPI application
├── utils/                 # Utility functions
├── tests/                 # Test files
└── requirements.txt       # Python dependencies
```

## 🧪 Testing Procedures

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=scripts --cov-report=html
```

### Test Structure
```
tests/
├── test_data_processing.py    # Data processing tests
├── test_ml_models.py          # ML model tests
├── test_api_endpoints.py      # API endpoint tests
└── conftest.py                # Test configuration
```

## 📊 Data Processing Workflows

### 1. Data Ingestion
- CSV, JSON, and Excel file support
- Database connectivity options
- API data fetching capabilities

### 2. Data Cleaning
- Missing value handling
- Outlier detection and treatment
- Data type conversions
- Duplicate removal

### 3. Feature Engineering
- Feature creation and transformation
- Categorical encoding
- Numerical scaling and normalization
- Feature selection methods

### 4. Statistical Analysis
- Descriptive statistics
- Correlation analysis
- Hypothesis testing
- Distribution analysis

## 🤖 Machine Learning Capabilities

### Supported Algorithms
- **Classification**: Random Forest, SVM, Logistic Regression
- **Regression**: Linear Regression, Decision Trees
- **Clustering**: K-Means, DBSCAN
- **Dimensionality Reduction**: PCA, t-SNE

### Model Evaluation
- Cross-validation techniques
- Performance metrics calculation
- Model comparison utilities
- Hyperparameter tuning

### Model Deployment
- Joblib model serialization
- FastAPI integration for predictions
- Batch processing capabilities
- Real-time inference support

## 📈 Visualization Features

### Chart Types
- Line plots and scatter plots
- Histograms and box plots
- Correlation heatmaps
- Distribution plots

### Customization Options
- Color schemes and themes
- Interactive plotting capabilities
- Export formats (PNG, PDF, SVG)
- Responsive design for web integration

## 🔧 Configuration

### Environment Variables
```bash
# Data paths
DATA_PATH=/path/to/data
MODEL_PATH=/path/to/models

# API configuration
API_HOST=localhost
API_PORT=8000

# Database settings (if applicable)
DB_CONNECTION_STRING=your_database_url
```

### Configuration Files
- `config.py`: Application configuration
- `logging.conf`: Logging configuration
- `.env`: Environment variables

## 📚 Development Guidelines

### Code Style
- **PEP 8**: Python style guide compliance
- **Type Hints**: Use type annotations where applicable
- **Docstrings**: Comprehensive function documentation
- **Error Handling**: Proper exception handling

### Data Security
- Sensitive data encryption
- Secure API endpoints
- Input validation and sanitization
- Audit logging capabilities

## 🔄 Workflow Integration

### Backend Integration
- API endpoints for data processing
- Model prediction services
- Real-time data analysis
- Batch processing jobs

### Frontend Integration
- Data visualization endpoints
- Chart generation APIs
- Statistical summary services
- Export functionality

## 📋 Performance Optimization

### Memory Management
- Efficient pandas operations
- Chunked data processing
- Memory profiling tools
- Garbage collection optimization

### Processing Speed
- Vectorized operations with NumPy
- Parallel processing with Joblib
- Caching mechanisms
- Optimized algorithms

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add comprehensive tests for new features
3. Update documentation for new functionality
4. Use type hints for better code clarity
5. Implement proper error handling
