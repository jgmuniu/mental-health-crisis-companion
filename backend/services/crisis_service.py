import requests
from datetime import datetime
import math
from models.session import db, Session
from flask import current_app

class CrisisService:
    """Handles crisis detection and emergency response"""
    
    # Crisis keywords by level
    LEVEL3_KEYWORDS = [
        "kill myself", "end my life", "suicide", "suicidal", "want to die",
        "don't want to live", "no reason to live", "better off dead",
        "can't go on", "end it all", "take my life", "overdose",
        "hang myself", "slit", "jump off", "harm myself tonight",
        "do it tonight", "goodbye forever", "last message", "final goodbye"
    ]
    
    LEVEL2_KEYWORDS = [
        "hurt myself", "self harm", "cutting", "burn myself",
        "feeling hopeless", "no hope", "burden", "everyone hates me",
        "can't take it anymore", "tired of life", "nothing matters",
        "feel empty", "want to disappear", "wish i wasn't here",
        "don't want to wake up", "feeling worthless", "hate myself"
    ]
    
    LEVEL1_KEYWORDS = [
        "depressed", "depression", "anxious", "anxiety", "sad", "alone",
        "lonely", "lost", "struggling", "suffering", "dark thoughts",
        "not okay", "falling apart", "breaking down", "can't cope",
        "overwhelmed", "hopeless", "numb", "exhausted", "crying", "pain"
    ]
    
    @staticmethod
    def detect_risk_level(text):
        """Detect crisis risk level (0-3)"""
        if not text:
            return 0
        
        text_lower = text.lower()
        
        # Check highest risk first
        if any(keyword in text_lower for keyword in CrisisService.LEVEL3_KEYWORDS):
            return 3
        
        # Then elevated risk
        if any(keyword in text_lower for keyword in CrisisService.LEVEL2_KEYWORDS):
            return 2
        
        # Then moderate risk
        if any(keyword in text_lower for keyword in CrisisService.LEVEL1_KEYWORDS):
            return 1
        
        return 0
    
    @staticmethod
    def get_crisis_resources(risk_level, location=None):
        """Get appropriate crisis resources based on risk level"""
        resources = {
            'immediate': [],
            'local': [],
            'national': []
        }
        
        # Always include national resources
        resources['national'] = [
            {
                'name': '988 Suicide & Crisis Lifeline',
                'phone': '988',
                'description': 'Free, confidential 24/7 support',
                'type': 'call'
            },
            {
                'name': 'Crisis Text Line',
                'contact': 'HOME to 741741',
                'description': 'Text with a trained crisis counselor',
                'type': 'text'
            },
            {
                'name': 'Befrienders Kenya',
                'phone': '0800723253',
                'description': 'Free, confidential emotional support',
                'type': 'call',
                'free': True
            }
        ]
        
        # Add immediate resources for high risk
        if risk_level >= 3:
            resources['immediate'] = [
                {
                    'name': '🚨 EMERGENCY',
                    'phone': '911',
                    'description': 'If you are in immediate danger'
                },
                {
                    'name': '988 Lifeline',
                    'phone': '988',
                    'description': 'Call now - press 1 for immediate connection'
                }
            ]
        
        # Add local resources if location provided
        if location:
            resources['local'] = CrisisService.search_nearby_facilities(
                location['lat'], 
                location['lon']
            )
        
        return resources
    
    @staticmethod
    def search_nearby_facilities(lat, lon, radius=10000):
        """Search for mental health facilities using Overpass API"""
        try:
            # Overpass API query
            query = f"""
            [out:json][timeout:25];
            (
              node["amenity"="hospital"]["healthcare:speciality"~"psychiatry|mental_health",i](around:{radius},{lat},{lon});
              node["amenity"="clinic"]["healthcare:speciality"~"psychiatry|mental_health",i](around:{radius},{lat},{lon});
              node["amenity"="hospital"](around:{radius},{lat},{lon});
              node["healthcare"="hospital"](around:{radius},{lat},{lon});
              way["amenity"="hospital"](around:{radius},{lat},{lon});
            );
            out center 15;
            """
            
            response = requests.post(
                "https://overpass-api.de/api/interpreter",
                data=query,
                timeout=10
            )
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            facilities = []
            
            for element in data.get('elements', []):
                element_lat = element.get('lat') or element.get('center', {}).get('lat')
                element_lon = element.get('lon') or element.get('center', {}).get('lon')
                
                if not element_lat or not element_lon:
                    continue
                
                # Calculate distance
                distance = CrisisService.calculate_distance(
                    lat, lon, element_lat, element_lon
                )
                
                facility = {
                    'id': element['id'],
                    'name': element.get('tags', {}).get('name', 'Mental Health Facility'),
                    'type': element.get('tags', {}).get('amenity', 'healthcare'),
                    'address': CrisisService.format_address(element.get('tags', {})),
                    'phone': element.get('tags', {}).get('phone') or element.get('tags', {}).get('contact:phone'),
                    'lat': element_lat,
                    'lon': element_lon,
                    'distance': round(distance),
                    'emergency': element.get('tags', {}).get('emergency') == 'yes'
                }
                
                facilities.append(facility)
            
            # Sort by distance and return top 10
            facilities.sort(key=lambda x: x['distance'])
            return facilities[:10]
            
        except Exception as e:
            print(f"Error searching facilities: {e}")
            return []
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + \
            math.cos(lat1_rad) * math.cos(lat2_rad) * \
            math.sin(delta_lon/2)**2
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    @staticmethod
    def format_address(tags):
        """Format address from OSM tags"""
        parts = []
        
        if tags.get('addr:housenumber'):
            parts.append(tags['addr:housenumber'])
        if tags.get('addr:street'):
            parts.append(tags['addr:street'])
        if tags.get('addr:city'):
            parts.append(tags['addr:city'])
        if tags.get('addr:state'):
            parts.append(tags['addr:state'])
        
        return ', '.join(parts) if parts else 'Address not available'
    
    @staticmethod
    def log_crisis_event(session_id, risk_level, action_taken):
        """Log crisis event for monitoring"""
        crisis_log = {
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat(),
            'risk_level': risk_level,
            'action_taken': action_taken
        }
        
        # In production, save to database or monitoring system
        print(f"CRISIS EVENT: {crisis_log}")
        return crisis_log