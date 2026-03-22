import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Security ──────────────────────────────────────────────────────────
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production-32chars')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production-32chars')
    JWT_ACCESS_TOKEN_EXPIRES = 3600      # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 604800   # 7 days

    BCRYPT_LOG_ROUNDS = 13

    # ── Database ──────────────────────────────────────────────────────────
    # Railway Postgres URLs start with postgres:// — SQLAlchemy needs postgresql://
    _db_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── AI ────────────────────────────────────────────────────────────────
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

    # ── CORS ──────────────────────────────────────────────────────────────
    # Set CORS_ORIGINS in Railway env vars as comma-separated URLs:
    # e.g. https://yourapp.vercel.app,https://yourapp-git-main.vercel.app
    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:5173'
    ).split(',')

    # ── Kenya Crisis Lines ────────────────────────────────────────────────
    EMKF_HOTLINE = '0800723253'
    NISKIZE = '0900620800'
    BEFRIENDERS_KENYA = '+254722178177'
    EMERGENCY_KENYA = '999'


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # In-memory DB for tests
    JWT_ACCESS_TOKEN_EXPIRES = 60                   # Short expiry for test speed


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    # Enforce strong keys in production
    @classmethod
    def init_app(cls, app):
        assert os.environ.get('SECRET_KEY'), 'SECRET_KEY env var not set!'
        assert os.environ.get('JWT_SECRET_KEY'), 'JWT_SECRET_KEY env var not set!'
        assert os.environ.get('GROQ_API_KEY'), 'GROQ_API_KEY env var not set!'


config = {
    'development': DevelopmentConfig,
    'testing':     TestingConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig,
}