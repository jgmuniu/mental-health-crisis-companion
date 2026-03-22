from datetime import datetime
from .user import db

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Session data
    messages = db.Column(db.JSON, nullable=False, default=list)
    risk_levels = db.Column(db.JSON, default=list)
    max_risk_level = db.Column(db.Integer, default=0)
    
    # Metadata
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Statistics
    message_count = db.Column(db.Integer, default=0)
    crisis_detected = db.Column(db.Boolean, default=False)
    map_shown = db.Column(db.Boolean, default=False)
    resources_shared = db.Column(db.JSON, default=list)
    
    # Location (if shared)
    location_lat = db.Column(db.Float)
    location_lon = db.Column(db.Float)
    location_accuracy = db.Column(db.Float)
    
    def add_message(self, role, content, risk_level=0):
        """Add a message to the session"""
        message = {
            'role': role,
            'content': content,
            'timestamp': datetime.utcnow().isoformat(),
            'risk_level': risk_level
        }
        
        if not self.messages:
            self.messages = []
        
        self.messages.append(message)
        self.message_count = len(self.messages)
        self.last_message_at = datetime.utcnow()
        
        # Track risk levels
        if risk_level > 0:
            self.risk_levels.append({
                'level': risk_level,
                'timestamp': datetime.utcnow().isoformat(),
                'message_preview': content[:100]
            })
            
            if risk_level > self.max_risk_level:
                self.max_risk_level = risk_level
            
            if risk_level >= 3:
                self.crisis_detected = True
        
        return message
    
    def end_session(self):
        """Mark session as ended"""
        self.ended_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'session_id': self.session_id,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'message_count': self.message_count,
            'max_risk_level': self.max_risk_level,
            'crisis_detected': self.crisis_detected,
            'messages': self.messages[-10:] if self.messages else []  # Last 10 messages only
        }
    
    def get_full_session(self):
        """Get full session data (for export/analysis)"""
        return {
            'session_id': self.session_id,
            'user_id': self.user_id,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'message_count': self.message_count,
            'max_risk_level': self.max_risk_level,
            'crisis_detected': self.crisis_detected,
            'risk_levels': self.risk_levels,
            'messages': self.messages,
            'location': {
                'lat': self.location_lat,
                'lon': self.location_lon,
                'accuracy': self.location_accuracy
            } if self.location_lat else None
        }