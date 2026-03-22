#!/usr/bin/env python
"""Seed database with initial data"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.models.user import db, User
from backend.models.session import Session
from datetime import datetime, timedelta
import random

def seed_database():
    """Seed the database with sample data"""
    app = create_app('development')
    
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("Creating sample users...")
        
        # Create sample users
        users = [
            {
                'email': 'john.doe@example.com',
                'password': 'Password123!',
                'username': 'john_doe',
                'first_name': 'John',
                'last_name': 'Doe'
            },
            {
                'email': 'jane.smith@example.com',
                'password': 'Password123!',
                'username': 'jane_smith',
                'first_name': 'Jane',
                'last_name': 'Smith'
            }
        ]
        
        created_users = []
        for user_data in users:
            user = User(
                email=user_data['email'],
                username=user_data['username'],
                password=user_data['password']
            )
            user.first_name = user_data.get('first_name')
            user.last_name = user_data.get('last_name')
            user.is_verified = True
            
            db.session.add(user)
            db.session.commit()
            created_users.append(user)
            print(f"  Created user: {user.email}")
        
        print("Creating sample sessions...")
        
        # Create sample sessions
        sample_messages = [
            {
                'role': 'user',
                'content': "I've been feeling really down lately. I don't know what to do.",
                'risk_level': 1
            },
            {
                'role': 'assistant',
                'content': "I hear you. It sounds like you're carrying a heavy weight right now. Can you tell me more about what's been going on?",
                'risk_level': 0
            },
            {
                'role': 'user',
                'content': "Everything feels hopeless. I don't see the point anymore.",
                'risk_level': 2
            },
            {
                'role': 'assistant',
                'content': "I'm really glad you're sharing this with me. These feelings of hopelessness are incredibly difficult to carry alone. Have you had thoughts about hurting yourself?",
                'risk_level': 2
            }
        ]
        
        for i, user in enumerate(created_users):
            # Create 3 sessions per user
            for j in range(3):
                session = Session(
                    session_id=f"session_{user.id}_{j}_{random.randint(1000, 9999)}",
                    user_id=user.id
                )
                
                # Add random messages
                for k, msg in enumerate(sample_messages):
                    session.add_message(
                        msg['role'],
                        msg['content'],
                        msg['risk_level']
                    )
                    
                    # Adjust timestamps to look realistic
                    session.last_message_at = datetime.utcnow() - timedelta(
                        days=random.randint(1, 30),
                        hours=random.randint(1, 23),
                        minutes=random.randint(1, 59)
                    )
                
                session.started_at = session.last_message_at - timedelta(
                    minutes=random.randint(10, 30)
                )
                
                session.max_risk_level = max(msg['risk_level'] for msg in sample_messages)
                session.crisis_detected = session.max_risk_level >= 2
                
                db.session.add(session)
                print(f"  Created session for user {user.email}")
            
            # Update user stats
            user.total_sessions = 3
            user.total_messages = 3 * len(sample_messages)
            user.last_active_at = datetime.utcnow()
            db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()