
import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "development-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    JSON_SORT_KEYS = False

    SQLALCHEMY_DATABASE_URI = "sqlite:///resume_screener.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
