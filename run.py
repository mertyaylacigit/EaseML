import threading
import webbrowser
import time

from src.app import create_app
from src.app.routes.routes import listener


if __name__ == "__main__":
  host = "localhost"
  port = 5000

  app = create_app()
  print("App started")
  threading.Thread(target=listener, daemon=True).start()
  webbrowser.open(f"http://{host}:{port}")
  app.run(host=host, port=port, debug=True) # issue: debug=True causes double-opening browser tab when starting app   