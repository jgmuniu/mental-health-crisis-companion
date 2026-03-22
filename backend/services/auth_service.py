from datetime import datetime
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from models.user import User, db


class AuthService:
    """Handles authentication and token management using flask_jwt_extended"""

    @staticmethod
    def generate_tokens(user_id):
        """Generate access and refresh tokens using flask_jwt_extended"""
        # ✅ Fixed: use flask_jwt_extended instead of raw jwt — must match app.py setup
        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': 3600
        }

    @staticmethod
    def verify_token(token, token_type='access'):
        """Verify JWT token"""
        try:
            decoded = decode_token(token)
            return decoded
        except Exception:
            return None

    @staticmethod
    def register_user(email, password, username, first_name=None, last_name=None):
        """Register a new user"""
        if User.query.filter_by(email=email.lower()).first():
            return {'success': False, 'error': 'Email already registered'}

        user = User(
            email=email.lower(),
            username=username,
            password=password
        )

        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        try:
            db.session.add(user)
            db.session.commit()

            tokens = AuthService.generate_tokens(user.id)

            return {
                'success': True,
                'user': user.to_dict(),
                # ✅ Fixed: return access_token at top level so AuthContext can read it
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token']
            }
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    @staticmethod
    def login_user(email, password):
        """Login user"""
        user = User.query.filter_by(email=email.lower()).first()

        if not user or not user.check_password(password):
            return {'success': False, 'error': 'Invalid email or password'}

        if not user.is_active:
            return {'success': False, 'error': 'Account is deactivated'}

        user.update_login_stats()
        db.session.commit()

        tokens = AuthService.generate_tokens(user.id)

        return {
            'success': True,
            'user': user.to_dict(),
            # ✅ Fixed: access_token at top level — AuthContext does const { access_token, user } = response.data
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }

    @staticmethod
    def refresh_token(refresh_token_str):
        """Get new access token using refresh token"""
        payload = AuthService.verify_token(refresh_token_str, 'refresh')

        if not payload:
            return {'success': False, 'error': 'Invalid refresh token'}

        user_id = payload.get('sub')
        tokens = AuthService.generate_tokens(user_id)

        return {
            'success': True,
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token']
        }

    @staticmethod
    def change_password(user_id, old_password, new_password):
        """Change user password"""
        user = User.query.get(user_id)

        if not user or not user.check_password(old_password):
            return {'success': False, 'error': 'Current password is incorrect'}

        from models.user import bcrypt
        user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()

        return {'success': True}

    @staticmethod
    def verify_email(user_id):
        """Mark email as verified"""
        user = User.query.get(user_id)
        if user:
            user.is_verified = True
            db.session.commit()
            return True
        return False