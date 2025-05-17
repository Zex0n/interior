from . import db
import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True) # Assuming nullable for now if no user auth
    name = db.Column(db.String(100), nullable=False, default='Новый проект')
    room_data = db.Column(db.JSON, nullable=True) # Stores walls, etc.
    placed_furniture_data = db.Column(db.JSON, nullable=True) # Stores placed furniture info
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<Project {self.name}>'

class FurnitureModel(db.Model):
    __tablename__ = 'furniture_models'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    model_file_name = db.Column(db.String(255), nullable=False) # Name of the file stored on server
    # model_url will be constructed: /static/models/<model_file_name>
    thumbnail_file_name = db.Column(db.String(255), nullable=True)
    # thumbnail_url will be constructed: /static/thumbnails/<thumbnail_file_name>
    category = db.Column(db.String(50), nullable=True)
    is_default = db.Column(db.Boolean, default=False) # True for pre-loaded models
    uploaded_by_user_id = db.Column(db.Integer, nullable=True) # If uploaded by a user
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<FurnitureModel {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'modelUrl': f'/static/models/{self.model_file_name}', # Assuming models are served from static/models
            'thumbnailUrl': f'/static/thumbnails/{self.thumbnail_file_name}' if self.thumbnail_file_name else None,
            'category': self.category,
            'is_default': self.is_default
        }

