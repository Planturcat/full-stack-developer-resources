#!/usr/bin/env python3
"""
Simple Flask application for Docker demonstration
"""

import os
import time
import socket
from datetime import datetime
from flask import Flask, jsonify, render_template_string

app = Flask(__name__)

# HTML template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Python Flask Docker App</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background-color: #f5f5f5; 
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            max-width: 800px;
            margin: 0 auto;
        }
        .info { 
            background: #e8f5e8; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 15px 0; 
            border-left: 4px solid #4caf50;
        }
        .header {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        ul { list-style-type: none; padding: 0; }
        li { padding: 5px 0; }
        .endpoint { 
            background: #fff3cd; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">🐍 Python Flask Docker Application</h1>
        <p>This is a Flask web application running inside a Docker container.</p>
        
        <div class="info">
            <h3>Container Information:</h3>
            <ul>
                <li><strong>Hostname:</strong> {{ hostname }}</li>
                <li><strong>Timestamp:</strong> {{ timestamp }}</li>
                <li><strong>Python Version:</strong> {{ python_version }}</li>
                <li><strong>Flask Version:</strong> {{ flask_version }}</li>
                <li><strong>Platform:</strong> {{ platform }}</li>
                <li><strong>Uptime:</strong> {{ uptime }} seconds</li>
            </ul>
        </div>
        
        <div class="info">
            <h3>Environment Variables:</h3>
            <ul>
                <li><strong>FLASK_ENV:</strong> {{ flask_env }}</li>
                <li><strong>PORT:</strong> {{ port }}</li>
                <li><strong>DEBUG:</strong> {{ debug }}</li>
            </ul>
        </div>
        
        <div class="endpoint">
            <h3>Available Endpoints:</h3>
            <ul>
                <li><a href="/">/ - This page</a></li>
                <li><a href="/health">GET /health - Health check</a></li>
                <li><a href="/api/info">GET /api/info - JSON info</a></li>
                <li><a href="/api/time">GET /api/time - Current time</a></li>
            </ul>
        </div>
    </div>
</body>
</html>
"""

# Store start time for uptime calculation
start_time = time.time()

@app.route('/')
def home():
    """Home page with container information"""
    import sys
    import platform
    import flask
    
    return render_template_string(HTML_TEMPLATE,
        hostname=socket.gethostname(),
        timestamp=datetime.now().isoformat(),
        python_version=sys.version,
        flask_version=flask.__version__,
        platform=platform.platform(),
        uptime=int(time.time() - start_time),
        flask_env=os.environ.get('FLASK_ENV', 'not set'),
        port=os.environ.get('PORT', '5000'),
        debug=app.debug
    )

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'hostname': socket.gethostname(),
        'uptime': int(time.time() - start_time),
        'version': '1.0.0'
    })

@app.route('/api/info')
def api_info():
    """API endpoint with container information"""
    import sys
    import platform
    import flask
    
    return jsonify({
        'container': {
            'hostname': socket.gethostname(),
            'platform': platform.platform(),
            'python_version': sys.version,
            'flask_version': flask.__version__
        },
        'environment': {
            'flask_env': os.environ.get('FLASK_ENV'),
            'port': os.environ.get('PORT', '5000'),
            'debug': app.debug
        },
        'runtime': {
            'timestamp': datetime.now().isoformat(),
            'uptime': int(time.time() - start_time)
        }
    })

@app.route('/api/time')
def api_time():
    """Simple time API endpoint"""
    return jsonify({
        'current_time': datetime.now().isoformat(),
        'unix_timestamp': int(time.time()),
        'timezone': str(datetime.now().astimezone().tzinfo)
    })

@app.errorhandler(404)
def not_found(error):
    """Custom 404 handler"""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested endpoint does not exist',
        'status_code': 404
    }), 404

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Get debug mode from environment
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting Flask application on port {port}")
    print(f"Debug mode: {debug}")
    print(f"Container hostname: {socket.gethostname()}")
    
    # Run the application
    app.run(
        host='0.0.0.0',  # Listen on all interfaces
        port=port,
        debug=debug
    )
