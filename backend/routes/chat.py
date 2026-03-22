from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.session import Session, db
from services.ai_service import AIService
from services.crisis_service import CrisisService
from datetime import datetime
import uuid

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

ai_service = AIService()
crisis_service = CrisisService()

@chat_bp.record_once
def on_blueprint_init(state):
    ai_service.init_app(state.app)


@chat_bp.route('/message', methods=['POST'])
def send_message():
    """Send a message and get AI response (works with or without authentication)"""
    data = request.get_json()

    if not data.get('message'):
        return jsonify({'success': False, 'error': 'Message is required'}), 400

    # ── Extract language-aware system prompt from frontend ─────────────────
    # Frontend sends this when language detection switches between
    # English and Swahili. Falls back to ai_service default if absent.
    system_prompt = data.get('system_prompt', None)

    # ── Auth (optional) ────────────────────────────────────────────────────
    user_id = None
    user = None
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                user = User.query.get(user_id)
        except:
            pass

    # ── Session ────────────────────────────────────────────────────────────
    session_id = data.get('session_id')
    if not session_id and user:
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        session = Session(session_id=session_id, user_id=user.id)
        db.session.add(session)
        db.session.commit()
    elif session_id:
        session = Session.query.filter_by(session_id=session_id).first()
    else:
        session_id = f"anon_{uuid.uuid4().hex[:12]}"
        session = None

    # ── Risk detection ─────────────────────────────────────────────────────
    messages = data.get('messages', [])
    risk_level = crisis_service.detect_risk_level(data['message'])

    if session:
        session.add_message('user', data['message'], risk_level)
        db.session.commit()

    # ── AI response ────────────────────────────────────────────────────────
    user_context = None
    if user:
        user_context = {
            'name': user.username,
            'has_history': user.total_sessions > 0
        }

    # Pass system_prompt through — ai_service uses it if provided,
    # falls back to DEFAULT_SYSTEM_PROMPT otherwise
    ai_response = ai_service.generate_response(
        messages,
        user_context=user_context,
        system_prompt=system_prompt
    )

    if not ai_response['success']:
        return jsonify(ai_response), 500

    # ── Risk in response ───────────────────────────────────────────────────
    response_risk = crisis_service.detect_risk_level(ai_response['response'])
    max_risk = max(risk_level, response_risk)

    if session:
        session.add_message('assistant', ai_response['response'], response_risk)

        if user:
            if hasattr(user, 'total_messages'):
                user.total_messages += 2
            if hasattr(user, 'highest_risk_level') and max_risk > user.highest_risk_level:
                user.highest_risk_level = max_risk
            if hasattr(user, 'last_active_at'):
                user.last_active_at = datetime.utcnow()

        db.session.commit()

    # ── Crisis resources ───────────────────────────────────────────────────
    crisis_resources = None
    if max_risk >= 2:
        location = data.get('location')
        crisis_resources = crisis_service.get_crisis_resources(max_risk, location)

        if max_risk >= 3 and session:
            crisis_service.log_crisis_event(session_id, max_risk, 'crisis_protocol_activated')

    return jsonify({
        'success': True,
        'response': ai_response['response'],
        'risk_level': max_risk,
        'crisis_resources': crisis_resources,
        'session_id': session_id,
        'usage': ai_response.get('usage')
    }), 200


@chat_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    sessions = Session.query.filter_by(user_id=user_id)\
        .order_by(Session.last_message_at.desc())\
        .limit(50).all()
    return jsonify({'success': True, 'sessions': [s.to_dict() for s in sessions]}), 200


@chat_bp.route('/sessions/<session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id):
    user_id = get_jwt_identity()
    session = Session.query.filter_by(session_id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'success': False, 'error': 'Session not found'}), 404
    return jsonify({'success': True, 'session': session.get_full_session()}), 200


@chat_bp.route('/sessions/<session_id>', methods=['DELETE'])
@jwt_required()
def delete_session(session_id):
    user_id = get_jwt_identity()
    session = Session.query.filter_by(session_id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({'success': False, 'error': 'Session not found'}), 404
    db.session.delete(session)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Session deleted'}), 200


@chat_bp.route('/export', methods=['POST'])
@jwt_required()
def export_sessions():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    sessions = Session.query.filter_by(user_id=user_id).all()
    export_data = {
        'user': user.to_dict() if user else {},
        'exported_at': datetime.utcnow().isoformat(),
        'sessions': [s.get_full_session() for s in sessions]
    }
    return jsonify({'success': True, 'data': export_data}), 200


@chat_bp.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.get_json()
    if not data.get('text'):
        return jsonify({'success': False, 'error': 'Text required'}), 400
    risk_level = crisis_service.detect_risk_level(data['text'])
    crisis_resources = None
    if risk_level >= 2 and data.get('location'):
        crisis_resources = crisis_service.get_crisis_resources(risk_level, data['location'])
    return jsonify({'success': True, 'risk_level': risk_level, 'crisis_resources': crisis_resources}), 200