from flask import Flask
from .routes.routes import bp
 
def create_app():
  app = Flask(__name__)

  # configurations

  # import and register blueprints/routes
  app.register_blueprint(bp)
  return app