import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS # Import CORS

from src.models import db # Updated import for db from models/__init__.py
from src.models.main_models import Project, FurnitureModel # Import new models
# from src.models.user import db # This was the old db import, now using the one from __init__
# from src.routes.user import user_bp # Keep if user routes are still needed, otherwise remove

from src.routes.main_routes import main_bp # Import the new blueprint

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
CORS(app) # Enable CORS for all routes, or configure more specifically

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'a_very_secret_key_that_should_be_changed')

# Configure PostgreSQL
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3254')
DB_NAME = os.getenv('DB_NAME', 'homedesign')
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Define upload folder for Flask app config if needed for direct access, though routes handle it
app.config['UPLOAD_FOLDER_MODELS'] = os.path.join(app.static_folder, 'models')
app.config['UPLOAD_FOLDER_THUMBNAILS'] = os.path.join(app.static_folder, 'thumbnails')

# Ensure upload directories exist (routes.py also does this, but good to have here too)
if not os.path.exists(app.config['UPLOAD_FOLDER_MODELS']):
    os.makedirs(app.config['UPLOAD_FOLDER_MODELS'])
if not os.path.exists(app.config['UPLOAD_FOLDER_THUMBNAILS']):
    os.makedirs(app.config['UPLOAD_FOLDER_THUMBNAILS'])

db.init_app(app)

# Register blueprints
# app.register_blueprint(user_bp, url_prefix='/api') # Uncomment if user_bp is still used
app.register_blueprint(main_bp, url_prefix='/api/v1') # Register new blueprint for projects and furniture

# Serve React App (static files)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    frontend_static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '/app/frontend_dist'))
    print(frontend_static_folder)
    if path != "" and os.path.exists(os.path.join(frontend_static_folder, path)):
        return send_from_directory(frontend_static_folder, path)
    else:
        index_path = os.path.join(frontend_static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(frontend_static_folder, 'index.html')
        else:
            # Fallback if frontend is not built or not found
            return "Frontend not found. Build the React app and ensure it's in home_design_app_frontend/dist", 404

# Serve model and thumbnail static files (already handled by Flask's static folder if structured correctly)
# The static_folder for the app is src/static. So files in src/static/models and src/static/thumbnails
# will be available at /static/models/<filename> and /static/thumbnails/<filename> respectively.
# The FurnitureModel.to_dict() method already constructs URLs like this.

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # This will create tables based on all imported models
        # You might want to add some default furniture items here if they don't exist
        if not FurnitureModel.query.filter_by(is_default=True).first():
            print("Adding default furniture items...")
            default_sofa = FurnitureModel(
                name='Стандартный диван',
                model_file_name='default_sofa.gltf', # Ensure this file exists in src/static/models
                thumbnail_file_name='default_sofa.png', # Ensure this file exists in src/static/thumbnails
                category='Диваны',
                is_default=True
            )
            default_table = FurnitureModel(
                name='Стандартный стол',
                model_file_name='default_table.gltf',
                thumbnail_file_name='default_table.png',
                category='Столы',
                is_default=True
            )
            db.session.add_all([default_sofa, default_table])
            db.session.commit()
            print("Default furniture items added.")

    app.run(host='0.0.0.0', port=8100, debug=True)

