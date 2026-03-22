from flask import Blueprint, request, jsonify
from services.crisis_service import CrisisService
import requests

map_bp = Blueprint('map', __name__, url_prefix='/api/map')

@map_bp.route('/facilities', methods=['GET'])
def get_facilities():
    """Get nearby mental health facilities"""
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    radius = request.args.get('radius', 10000, type=int)
    
    if not lat or not lon:
        return jsonify({'success': False, 'error': 'Latitude and longitude required'}), 400
    
    facilities = CrisisService.search_nearby_facilities(lat, lon, radius)
    
    return jsonify({
        'success': True,
        'facilities': facilities,
        'count': len(facilities)
    }), 200

@map_bp.route('/geocode', methods=['GET'])
def geocode():
    """Geocode address to coordinates using Nominatim"""
    address = request.args.get('address')
    
    if not address:
        return jsonify({'success': False, 'error': 'Address required'}), 400
    
    try:
        # Use Nominatim for geocoding
        headers = {
            'User-Agent': 'MentalHealthCrisisCompanion/1.0 (research project)'
        }
        
        response = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={
                'q': address,
                'format': 'json',
                'limit': 5
            },
            headers=headers
        )
        
        if response.status_code != 200:
            return jsonify({'success': False, 'error': 'Geocoding failed'}), 500
        
        results = response.json()
        
        return jsonify({
            'success': True,
            'results': [
                {
                    'lat': float(r['lat']),
                    'lon': float(r['lon']),
                    'display_name': r['display_name'],
                    'importance': r.get('importance', 0)
                }
                for r in results
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@map_bp.route('/directions', methods=['GET'])
def get_directions():
    """Get directions between two points using OSRM"""
    from_lat = request.args.get('from_lat', type=float)
    from_lon = request.args.get('from_lon', type=float)
    to_lat = request.args.get('to_lat', type=float)
    to_lon = request.args.get('to_lon', type=float)
    
    if not all([from_lat, from_lon, to_lat, to_lon]):
        return jsonify({'success': False, 'error': 'All coordinates required'}), 400
    
    try:
        # Use OSRM for routing
        response = requests.get(
            f'http://router.project-osrm.org/route/v1/driving/{from_lon},{from_lat};{to_lon},{to_lat}',
            params={
                'overview': 'full',
                'geometries': 'geojson',
                'steps': 'true'
            }
        )
        
        if response.status_code != 200:
            return jsonify({'success': False, 'error': 'Routing failed'}), 500
        
        data = response.json()
        
        if data['code'] != 'Ok' or not data['routes']:
            return jsonify({'success': False, 'error': 'No route found'}), 404
        
        route = data['routes'][0]
        
        return jsonify({
            'success': True,
            'route': {
                'distance': route['distance'],
                'duration': route['duration'],
                'geometry': route['geometry'],
                'steps': [
                    {
                        'instruction': step['maneuver']['type'],
                        'distance': step['distance'],
                        'duration': step['duration'],
                        'name': step.get('name', '')
                    }
                    for step in route['legs'][0]['steps']
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@map_bp.route('/static-resources', methods=['GET'])
def get_static_resources():
    """Get static crisis resources by country/region"""
    country = request.args.get('country', 'kenya')
    
    resources = {
        'kenya': [
            {
                'name': 'Befrienders Kenya',
                'phone': '0800723253',
                'description': 'Free, confidential emotional support',
                'hours': '24/7',
                'free': True
            },
            {
                'name': 'Mathare Hospital',
                'phone': '0202724840',
                'description': 'National psychiatric referral, Nairobi',
                'type': 'hospital'
            },
            {
                'name': 'Kenya Red Cross',
                'phone': '1199',
                'description': 'Psychosocial support line',
                'free': True
            },
            {
                'name': 'Emergency Services',
                'phone': '999',
                'description': 'Police / Ambulance',
                'free': True
            }
        ],
        'us': [
            {
                'name': '988 Suicide & Crisis Lifeline',
                'phone': '988',
                'description': 'Free, confidential 24/7 support',
                'free': True
            },
            {
                'name': 'Crisis Text Line',
                'phone': '741741',
                'description': 'Text HOME to connect',
                'type': 'text',
                'free': True
            }
        ]
    }
    
    return jsonify({
        'success': True,
        'country': country,
        'resources': resources.get(country.lower(), [])
    }), 200