import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

from models.user import db, bcrypt
from config import config

from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.voice_control import voice_bp

# map_bp removed — not used in current codebase


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # ── CORS ──────────────────────────────────────────────────────────────
    # Reads allowed origins from environment so Vercel URL can be set
    # without a code change. Fallback covers local dev.
    raw_origins = os.environ.get(
        'ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173'
    )
    allowed_origins = [o.strip() for o in raw_origins.split(',') if o.strip()]

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )

    # ── Extensions ────────────────────────────────────────────────────────
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    # ── Blueprints ────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(voice_bp)

    # ── Health check (Railway uses this to verify the app is running) ─────
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'environment': config_name,
            'version': '1.0.0'
        }), 200

    # ── Error handlers ────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

    # ── DB init ───────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()

    return app


# ── Entry point ───────────────────────────────────────────────────────────
if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))   # Railway injects PORT
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)