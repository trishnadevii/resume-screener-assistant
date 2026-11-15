
import os

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config
from app.extensions import db


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}}
    )

    # Register API routes
    from app.routes.health_routes import health_bp
    from app.routes.screening_routes import screening_bp
    from app.routes.history_routes import history_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(screening_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")

    # Import models and create database tables
    from app.models import Analysis

    with app.app_context():
        db.create_all()

    return app
