from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, db
from services.auth_service import AuthService
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    required_fields = ['email', 'password', 'username']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'error': f'{field} is required'}), 400

    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, data['email']):
        return jsonify({'success': False, 'error': 'Invalid email format'}), 400

    if len(data['password']) < 8:
        return jsonify({'success': False, 'error': 'Password must be at least 8 characters'}), 400

    result = AuthService.register_user(
        email=data['email'],
        password=data['password'],
        username=data['username'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )

    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'error': 'Email and password required'}), 400

    result = AuthService.login_user(data['email'], data['password'])

    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 401

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()

    if not data.get('refresh_token'):
        return jsonify({'success': False, 'error': 'Refresh token required'}), 400

    result = AuthService.refresh_token(data['refresh_token'])

    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    return jsonify({'success': True, 'user': user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'success': False, 'error': 'Old and new password required'}), 400

    if len(data['new_password']) < 8:
        return jsonify({'success': False, 'error': 'New password must be at least 8 characters'}), 400

    result = AuthService.change_password(user_id, data['old_password'], data['new_password'])

    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400