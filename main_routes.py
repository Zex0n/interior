from flask import Blueprint, request, jsonify, send_from_directory
from src.models import db
from src.models.main_models import Project, FurnitureModel
import os
from werkzeug.utils import secure_filename
import json

# Define a Blueprint for project and furniture related routes
main_bp = Blueprint("main_bp", __name__)

UPLOAD_FOLDER_MODELS = os.path.abspath("src/static/models")
UPLOAD_FOLDER_THUMBNAILS = os.path.abspath("src/static/thumbnails")
ALLOWED_EXTENSIONS_MODELS = {"gltf", "glb"}
ALLOWED_EXTENSIONS_THUMBNAILS = {"png", "jpg", "jpeg", "webp"}

if not os.path.exists(UPLOAD_FOLDER_MODELS):
    os.makedirs(UPLOAD_FOLDER_MODELS)
if not os.path.exists(UPLOAD_FOLDER_THUMBNAILS):
    os.makedirs(UPLOAD_FOLDER_THUMBNAILS)

def allowed_file(filename, allowed_extensions):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions

# --- Project Routes ---
@main_bp.route("/projects", methods=["POST"])
def create_project():
    data = request.json
    new_project = Project(
        name=data.get("name", "Новый проект"),
        room_data=data.get("room_data"),
        placed_furniture_data=data.get("placed_furniture_data")
        # user_id could be added if auth is implemented
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({"message": "Проект создан", "project_id": new_project.id}), 201

@main_bp.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({
        "id": project.id,
        "name": project.name,
        "room_data": project.room_data,
        "placed_furniture_data": project.placed_furniture_data,
        "created_at": project.created_at,
        "updated_at": project.updated_at
    })

@main_bp.route("/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.json
    project.name = data.get("name", project.name)
    project.room_data = data.get("room_data", project.room_data)
    project.placed_furniture_data = data.get("placed_furniture_data", project.placed_furniture_data)
    db.session.commit()
    return jsonify({"message": "Проект обновлен"})

@main_bp.route("/projects", methods=["GET"])
def list_projects():
    # Add pagination later if needed
    projects = Project.query.order_by(Project.updated_at.desc()).all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "updated_at": p.updated_at
    } for p in projects])

# --- Furniture Routes ---
@main_bp.route("/furniture", methods=["GET"])
def get_furniture_list():
    # For now, only default furniture. Add user-uploaded later or filter by user.
    furniture_items = FurnitureModel.query.filter_by(is_default=True).all()
    return jsonify([item.to_dict() for item in furniture_items])

@main_bp.route("/furniture/upload", methods=["POST"])
def upload_furniture_model():
    if "modelFile" not in request.files:
        return jsonify({"error": "Отсутствует файл модели"}), 400
    
    model_file = request.files["modelFile"]
    thumbnail_file = request.files.get("thumbnailFile")
    name = request.form.get("name", "Новая модель")
    description = request.form.get("description", "")
    category = request.form.get("category", "Пользовательские")

    if model_file.filename == "":
        return jsonify({"error": "Файл модели не выбран"}), 400

    model_filename_secure = ""
    if model_file and allowed_file(model_file.filename, ALLOWED_EXTENSIONS_MODELS):
        model_filename_secure = secure_filename(model_file.filename)
        # To avoid overwrites, add a unique prefix or check existence
        model_file.save(os.path.join(UPLOAD_FOLDER_MODELS, model_filename_secure))
    else:
        return jsonify({"error": "Недопустимый тип файла модели"}), 400

    thumbnail_filename_secure = None
    if thumbnail_file and thumbnail_file.filename != "" and allowed_file(thumbnail_file.filename, ALLOWED_EXTENSIONS_THUMBNAILS):
        thumbnail_filename_secure = secure_filename(thumbnail_file.filename)
        thumbnail_file.save(os.path.join(UPLOAD_FOLDER_THUMBNAILS, thumbnail_filename_secure))
    
    new_model = FurnitureModel(
        name=name,
        description=description,
        model_file_name=model_filename_secure,
        thumbnail_file_name=thumbnail_filename_secure,
        category=category,
        is_default=False # User uploaded models are not default
        # uploaded_by_user_id could be added here
    )
    db.session.add(new_model)
    db.session.commit()

    return jsonify({"message": "Модель успешно загружена", "model": new_model.to_dict()}), 201

# --- Export Route (Placeholder, GLTF generation might be complex on backend from scratch) ---
# For now, the frontend handles GLTF export. If backend export is needed, this would be more involved.
# A simpler backend approach for "export" might be to just gather all project data (walls, furniture with model URLs)
# and provide it as a JSON that a Blender Python script could then parse.

@main_bp.route("/projects/<int:project_id>/export_blender_data", methods=["GET"])
def export_project_data_for_blender(project_id):
    project = Project.query.get_or_404(project_id)
    # This data structure should be designed to be easily parsable by a Blender Python script
    export_data = {
        "project_name": project.name,
        "room_walls": project.room_data.get("walls", []), # Assuming walls are stored like this
        "placed_furniture": []
    }
    if project.placed_furniture_data:
        for item_data in project.placed_furniture_data:
            # We need the actual model URL that Blender can access or a reference to it
            # If models are served by this app, their URLs are fine.
            # If they are local files for Blender, paths might need adjustment.
            model_info = FurnitureModel.query.get(item_data.get("id")) # Assuming furniture ID is stored
            if model_info:
                export_data["placed_furniture"].append({
                    "name": model_info.name,
                    "model_url": model_info.to_dict().get("modelUrl"), # Get the served URL
                    "position": item_data.get("position"),
                    "rotation": item_data.get("rotation"),
                    "scale": item_data.get("scale", [1,1,1])
                })
            else: # Fallback if model not in DB, use stored URL if available
                 export_data["placed_furniture"].append({
                    "name": item_data.get("name", "Unknown Model"),
                    "model_url": item_data.get("modelUrl"), 
                    "position": item_data.get("position"),
                    "rotation": item_data.get("rotation"),
                    "scale": item_data.get("scale", [1,1,1])
                })

    # Instead of generating GLTF, we provide JSON data for a Blender script
    # The Blender script would then fetch models by URL and place them.
    return jsonify(export_data)

# It's good practice to also serve the static files (models, thumbnails) through Flask if they are stored locally
# The create_flask_app template already configures a static folder, but that's for the frontend's static assets.
# We might need a separate route or configuration if these models are not part of the frontend's build.
# For simplicity, if UPLOAD_FOLDER_MODELS is src/static/models, and static_folder in app is src/static, it should work.


