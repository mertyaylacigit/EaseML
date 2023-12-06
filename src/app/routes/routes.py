from flask import Blueprint, render_template, jsonify
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD
import numpy as np
import queue

from ...ml.models.model import ConvolutionalNeuralNetwork
from ...ml.trainers.training import training

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
  # ensure that these variables are the same as those outside this method
  global q, seed, stop_training_flag
  # determine pseudo-random number generation
  manual_seed(seed)
  np.random.seed(seed)
  # initialize training
  model = ConvolutionalNeuralNetwork()
  opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
  # execute training
  training(model=model,
           optimizer=opt,
           cuda=False,
           n_epochs=10,
           batch_size=256,
           stop=stop_training_flag,     # added stop flag: dict 
           queue=q
           )
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



@bp.route("/get_accuracy")
def get_accuracy():
    global metrics
    return jsonify(metrics)
