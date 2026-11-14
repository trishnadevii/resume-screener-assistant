from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/*": {"origins": "http://localhost:5173"}
        }
    )

    from app.routes.health_routes import health_bp
    app.register_blueprint(health_bp, url_prefix="/api")

    return app