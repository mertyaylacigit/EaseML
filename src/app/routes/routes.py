from flask import Blueprint, render_template, jsonify, request
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD
import numpy as np
import queue
import json

from ...ml.models.model import ConvolutionalNeuralNetwork
from ...ml.trainers.training import training

from threading import Thread

#blueprint that __init__.py accesses
bp = Blueprint("routes", __name__)

seed = 42
metrics = {"acc":  -1,
           "loss": -1}
q = queue.Queue()
stop_training_flag = {"stop": False} # Use a dictionary with a mutable flag so when flag flips from False to True the function call training
                                     # receives the change because the function call takes the address of mutable objects rather than a copy 
                                     # of immutable objects like stop = False, so stop = {"stop": False} is better/necessary

def listener():
    global q, metrics
    while True:
        metrics = q.get()
        q.task_done()


@bp.route("/")
def render():
  return render_template("index.html")


@bp.route("/start_training")
def start_training():
  global q, seed, stop_training_flag
  manual_seed(seed)
  np.random.seed(seed)
  model = ConvolutionalNeuralNetwork()

  # start training process in seperate thread! 
  training_thread = Thread(target=training, args=(model, False, 10, stop_training_flag, q))
  training_thread.start()

  return jsonify({"success": True})



@bp.route("/stop_training")
def stop_training():
  global stop_training_flag
  stop_training_flag["stop"] = True

  return jsonify(stop_training_flag)

@bp.route("/continue_training")
def continue_training():
  global stop_training_flag
  stop_training_flag["stop"] = False

  return jsonify(stop_training_flag)

@bp.route("/update_params", methods=['POST'])
def update_params():
    data = request.json # Training parameters should be saved in json format
    try:
        config_path = 'config/training_config.json'
        with open(config_path, 'w') as file:
            json.dump(data, file)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
@bp.route("/get_current_params")
def get_current_params():
    try:
        config_path = 'config/training_config.json'
        with open(config_path, 'r') as file:
            config = json.load(file)
        # Extract learning rate and batch size
        current_params = {
            'lr': config['optimizer_params']['args']['lr'],
            'batch_size': config['batch_size']
        }
        return jsonify(current_params)
    except Exception as e:
        return jsonify({"error": str(e)})

@bp.route("/get_accuracy")
def get_accuracy():
    global metrics
    return jsonify(metrics)
