import threading
import webbrowser
import time
import torch

from src.app import create_app
from src.app.routes.routes import listener1, listener2


if __name__ == "__main__":
  host = "localhost"
  port = 5001 # iOS runs something on 5000

  app = create_app()
  print("App started")
  threading.Thread(target=listener1, daemon=True).start()
  threading.Thread(target=listener2, daemon=True).start()
  #webbrowser.open(f"http://{host}:{port}")
  app.run(host=host, port=port, debug=True) # issue: debug=True causes double-opening browser tab when starting app   