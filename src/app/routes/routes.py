from flask import Blueprint, render_template, jsonify, request, send_file
from torch import manual_seed, Tensor
from torch.optim import Optimizer, SGD
import numpy as np
import queue, json, pickle, os, sys, re
import torch, flask
import copy

from src.ml.models.model import ConvolutionalNeuralNetwork
from src.ml.trainers.training import training

from threading import Thread

#blueprint that __init__.py accesses
bp = Blueprint("routes", __name__)

seed = 42
metricsOG = {"acc":  -1,
           "loss": -1,"id": -1}
metricsNew = {"acc":  -1,
           "loss": -1,"id": -1}

cuda = False

metrics = {"dict1": metricsOG, "dict2": metricsNew}
q = queue.Queue()
q2 = queue.Queue()
stop_training_flag = {"stop": False} # Use a dictionary with a mutable flag so when flag flips from False to True the function call training
                                     # receives the change because the function call takes the address of mutable objects rather than a copy 
                                     # of immutable objects like stop = False, so stop = {"stop": False} is better/necessary
kill_flag = {"alive": True}

manual_seed(seed)
np.random.seed(seed)
model = {}
thread0 = 0
thread1 = 0
current_model_training = 0
lazyFlag = False
threads_running = 0
endOldThreadFlag = {"end": False}
listeners = []
running = True

def listener1():
    print("started listening")
    global q, metricsOG, q2, metricsNew
    while True:
        new_metrics = q.get()
        metricsOG.update(new_metrics)
        q.task_done()

def listener2():
    print("started listening too")
    global q, metricsOG, q2, metricsNew
    while True:
        new_metrics = q2.get()
        metricsNew.update(new_metrics)
        q2.task_done()




@bp.route("/")
def render():
  return render_template("index.html")

@bp.route("/playground")
def render_playground():
  return render_template("playground.html")
  


@bp.route("/start_training")
def start_training():
  global stop_training_flag, model, current_model, training, lazyFlag, kill_flag, threads_running, endOldThreadFlag, listeners, thread0

  model[0] = ConvolutionalNeuralNetwork()  
  lazyFlag = True

  # start training process in seperate thread! 
  thread0 = Thread(target=training, args=(model[0], cuda, 10, stop_training_flag, kill_flag, True, endOldThreadFlag, q))
  thread0.start()
  threads_running += 1


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

@bp.route("/reset_training")
def reset_training():
    global thread1, thread0, kill_flag, lazyFlag, model, current_model, current_model_training, stop_training_flag, threads_running, listeners, running
    kill_flag["alive"] = False
    
    thread0.join()
    thread1.join()
    model = {}
    current_model_training = 0
    current_model = 0
    thread1 = 0
    thread0 = 0
    lazyFlag = False
    kill_flag["alive"] = True
    stop_training_flag["stop"] = False
    threads_running = 0

    metricsNew["acc"] = -1
    metricsNew["loss"] = -1
    metricsNew["id"] = -1

    metricsOG["acc"] = -1
    metricsOG["loss"] = -1
    metricsOG["id"] = -1

    return jsonify({"success": True})


@bp.route("/update_params", methods=['POST'])
def update_params():

    global current_model_training, lazyFlag, kill_flag, threads_running, endOldThreadFlag, q2, training, thread1, thread0
    
    # copy current modell

    if (lazyFlag):
        if (threads_running > 1):
            endOldThreadFlag["end"] = True

            print("waiting for Join")
            thread1.join()
            print("joined a Thread")
            endOldThreadFlag["end"] = False
            threads_running -= 1
            

        new_model = copy.deepcopy(model[0])
        threads_running += 1
        current_model_training += 1

        model[current_model_training] = new_model

        thread1 = Thread(target=training, args=(model[current_model_training], cuda, 10, stop_training_flag, kill_flag, False, endOldThreadFlag, q2))
        thread1.start()


    data = request.json
    try:
        config_path = 'config/training_config.json'
        if os.path.exists(config_path):
            with open(config_path, 'r') as file:
                current_config = json.load(file)

            # Update the config with new values
            current_config.update(data)
            # Update the config with new values
            current_config.update(data)

            with open(config_path, 'w') as file:
                json.dump(current_config, file)
            with open(config_path, 'w') as file:
                json.dump(current_config, file)

            return jsonify({"success": True})
        else:
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
            'momentum': config['optimizer_params']['args']['momentum'],
            'batch_size': config['batch_size'],
            'loss_function': config.get('loss_function')
        }
        return jsonify(current_params)
    except Exception as e:
        print("Error while fetching parameters:", str(e))  # Log the error
        return jsonify({"error": str(e)})

@bp.route("/get_accuracy")
def get_accuracy():
    global metrics
    #print(metrics)
    return jsonify(metrics)

@bp.route("/saveConfiguration")
def saveConfiguration():
    # get current configurations
    config_path = 'config/training_config.json'
    with open(config_path, 'r') as file:
        current_config = json.load(file)


    config_history_path = 'config/config_history.json'
    try:
        with open(config_history_path, 'r') as file:
            config_history = json.load(file)

    except FileNotFoundError:
        # If the file doesn't exist yet, create an empty dictionary
        config_history = {}

    next_index = len(config_history)
    config_history[next_index] = current_config  # add current config to config history

    with open(config_history_path, 'w') as file:
        json.dump(config_history, file)

    return jsonify({"config_id":next_index,
                    "config_body": current_config
                    })


@bp.route("/removeConfiguration")
def removeConfiguration():
    print(request.args.get("config_id"))
    return jsonify({"success":True})


@bp.route("/loadConfiguration")
def loadConfiguration():
    config_id = request.args.get("config_id")

    config_history_path = 'config/config_history.json'
    with open(config_history_path, 'r') as file:
        config_history = json.load(file)

    return jsonify(config_history[config_id])
    
    
@bp.route("/clearConfigurationHistory")
def clearConfigurationHistory():
    config_history_path = 'config/config_history.json'
    with open(config_history_path, 'w') as file:
        json.dump({},file)
    
    return jsonify({"success": True})











##----------------------------------------------------------------
##----------------------------------------------------------------




## Model history

@bp.route("/saveModel")
def saveModel():
    global model

    current_model = model

    model_history_path = 'config/model_history.pickle'  # Update the path to your model history file
    try:
        with open(model_history_path, 'rb') as file:
            model_history = pickle.load(file)
    except FileNotFoundError:
        # If the file doesn't exist yet, create an empty dictionary
        model_history = {}

    next_index = len(model_history)
    model_history[next_index] = current_model  # add current model to model history

    with open(model_history_path, 'wb') as file:
        pickle.dump(model_history, file)

    return jsonify({"model_id": next_index})


@bp.route("/removeModel")
def removeModel():
    print(request.args.get("model_id"))
    return jsonify({"success": True})


@bp.route("/clearModelHistory")
def clearModelHistory():
    model_history_path = 'config/model_history.pickle'  # Update the path to your model history file
    with open(model_history_path, 'wb') as file:
        pickle.dump({}, file)

    return jsonify({"success": True})

@bp.route("/downloadModel")
def downloadModel():
    model_history_path = 'config/model_history.pickle'
    model_id = int(request.args.get("model_id"))
    model_path = "config/model" + str(model_id) + ".pickle"

    print(model_id, type(model_id))

    with open(model_history_path, 'rb') as file:
        model_history = pickle.load(file)

    with open(model_path, 'wb') as file:
        pickle.dump(model_history[model_id], file)

    with open(model_path, "rb") as file:
        modeltest = pickle.load(file)
        print(type(modeltest))

    return send_file(os.getcwd() + "/" + model_path, as_attachment=True)

@bp.route("/deleteAfterDownloadModel")
def deleteAfterDownloadModel():
    model_id = int(request.args.get("model_id"))
    model_path = "config/model" + str(model_id) + ".pickle"

    try:
        os.remove(model_path)
        print(f"Deleted file: {model_path}")
    except OSError as e:
        print(f"Error deleting file: {model_path} - {e}")

    return jsonify({"success": True})







##----------------------------------------------------------------
##----------------------------------------------------------------




## Playground

@bp.route("/predict", methods=['POST'])
def predict():
    global selected_model

    batch_size = 1
    channels = 1  # Grayscale image
    height = 28
    width = 28

    data = request.json
    print(data) 
    data = np.array(data)
    print(data)
    data_reshaped = data.reshape(1,1,28,28)
    X = torch.Tensor(data_reshaped)
    print(X)


    try:
        selected_model.eval()
        with torch.no_grad():
            prediction_array = selected_model(X)
            prediction_array = prediction_array.numpy()
            prediction_array_softmax = np.exp(prediction_array) / np.sum(np.exp(prediction_array))
            print(prediction_array_softmax)
            prediction = {"label": int(np.argmax(prediction_array_softmax)),
                          "probability": round(float(np.max(prediction_array_softmax)), 2)}
        print(prediction)
        return jsonify(prediction)
    except Exception as e:
        print("hää")
        return jsonify({"error": str(e)})
    

@bp.route("/change_selected_model", methods=['POST'])
def change_selected_model():
    global selected_model, model

    data = request.json

    if (data == "current_model"):
        selected_model = model
        return jsonify({"success": True})
    if (data == "model_pretrained"):
        config_path = 'config/model_pretrained.pickle'
        with open(config_path, 'rb') as file:
            model_file = pickle.load(file)
            selected_model = model_file
            return jsonify({"success": True})
    else:
        
        model_history_path = 'config/model_history.pickle'  # Update the path to your model history file
        try:
            with open(model_history_path, 'rb') as file:
                model_history = pickle.load(file)

                model_index = int(re.search("[0-9]+", data).group())
                selected_model = model_history[model_index]
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        
        return jsonify({"success": True})



