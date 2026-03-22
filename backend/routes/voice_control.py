# backend/routes/voice_control.py
# Add to your Flask app — allows remote voice toggle per user

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.session import db
from datetime import datetime

voice_bp = Blueprint('voice', __name__, url_prefix='/api/voice')

# In-memory store for anonymous/quick toggles
# For production, add a voice_enabled column to User model instead
_voice_states = {}  # { user_id: { enabled: bool, updated_at: str } }


@voice_bp.route('/state', methods=['GET'])
@jwt_required(optional=True)
def get_voice_state():
    """Get current voice state for this user"""
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({'success': True, 'voice_enabled': True, 'source': 'default'}), 200

    state = _voice_states.get(str(user_id))
    if state is None:
        # Check User model if column exists
        user = User.query.get(user_id)
        enabled = getattr(user, 'voice_enabled', True)
        return jsonify({'success': True, 'voice_enabled': enabled, 'source': 'default'}), 200

    return jsonify({
        'success': True,
        'voice_enabled': state['enabled'],
        'updated_at': state['updated_at'],
        'source': 'remote'
    }), 200


@voice_bp.route('/state', methods=['POST'])
@jwt_required()
def set_voice_state():
    """Set voice state — call this from another device to toggle"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if 'voice_enabled' not in data:
        return jsonify({'success': False, 'error': 'voice_enabled is required'}), 400

    enabled = bool(data['voice_enabled'])
    _voice_states[str(user_id)] = {
        'enabled': enabled,
        'updated_at': datetime.utcnow().isoformat()
    }

    # Also update User model if column exists
    user = User.query.get(user_id)
    if user and hasattr(user, 'voice_enabled'):
        user.voice_enabled = enabled
        db.session.commit()

    return jsonify({
        'success': True,
        'voice_enabled': enabled,
        'message': f"Voice {'enabled' if enabled else 'muted'} remotely"
    }), 200


@voice_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle_voice():
    """Flip the current voice state"""
    user_id = get_jwt_identity()
    state = _voice_states.get(str(user_id))
    current = state['enabled'] if state else True
    new_state = not current

    _voice_states[str(user_id)] = {
        'enabled': new_state,
        'updated_at': datetime.utcnow().isoformat()
    }

    return jsonify({
        'success': True,
        'voice_enabled': new_state,
        'message': f"Voice {'enabled' if new_state else 'muted'}"
    }), 200