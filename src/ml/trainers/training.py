from queue import Queue
import sys

import threading
import torch
sys.path.append("ml_utils")

import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch.optim import Optimizer, SGD

from ..importers.data import get_data_loaders
from ..monitors.evaluate import accuracy
from ..models.model import ConvolutionalNeuralNetwork

import json
import time

def train_step(model: Module, optimizer: Optimizer, data: Tensor, target: Tensor, loss_function, cuda: bool, apply_log_softmax: bool):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()

    optimizer.zero_grad()
    prediction = model(data)

    if apply_log_softmax:
        prediction = F.log_softmax(prediction, dim=1)

    loss = loss_function(prediction, target)
    loss.backward()
    optimizer.step()
    return loss


def check_for_updates(config_path):
    try:
        with open(config_path, 'r') as file:
            config = json.load(file)
        optimizer_params = config['optimizer_params']
        batch_size = config['batch_size']
        loss_function = config.get('loss_function', 'cross_entropy')  # Default to 'cross_entropy' if not specified
        return optimizer_params, batch_size, loss_function
    except KeyError as e:
        print(f"Key error: {e}")
        raise
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        raise


def check_for_initial_params(config_path):
    return check_for_updates(config_path)

def create_optimizer(model, optimizer_params):
    if optimizer_params['type'].lower() == 'sgd':
        return torch.optim.SGD(model.parameters(), **optimizer_params['args'])
    # Add more conditions for other optimizers

def get_loss_function(name): # The boolean indicates wether we need to apply the LogSoftmax layer to our model output
    if name == 'cross_entropy':
        return torch.nn.CrossEntropyLoss(), False
    elif name == 'nll_loss':
        return torch.nn.NLLLoss(), True
    else:
        raise ValueError(f"Unknown loss function: {name}")


def training(model: Module, cuda: bool, n_epochs: int, stop: dict, kill: dict, doUpdate: bool, endTempThread: dict, queue: Queue = None):
    config_path = 'config/training_config.json'

    id = threading.get_ident()
    print("Hello My Thread id is:", id)

    optimizer_params, batch_size, loss_function_name = check_for_initial_params(config_path)
    loss_function, apply_log_softmax = get_loss_function(loss_function_name)

    while kill['alive']:
        if not stop['stop']:  # If not stopped, start/resume training
            train_loader, test_loader = get_data_loaders(batch_size=batch_size)
            if cuda:
                model.cuda()

            optimizer = create_optimizer(model, optimizer_params)  # Create optimizer with parameters

            for epoch in range(n_epochs):
                batchCounter = 1
                for batch in train_loader:
                    data, target = batch
                    train_step(model, optimizer, data, target, loss_function, cuda, apply_log_softmax)
                    test_loss, test_acc = accuracy(model, test_loader, cuda)
                    if queue is not None:
                        queue.put({"acc": test_acc, "loss": test_loss, "id": id})
                    print(f"epoch={epoch}, batch={batchCounter}, test accuracy={test_acc}, loss={test_loss}, ID={id}")

                    batchCounter += 1
                    print("batch done")
                    
                    while stop['stop']:
                        time.sleep(0.1)  # Sleep to prevent busy waiting
                        # Check for updates only if stop flag is active
                        if stop['stop']:
                            if (doUpdate):
                                optimizer_params, batch_size, loss_function_name = check_for_updates(config_path)
                                optimizer = create_optimizer(model, optimizer_params)  # Update optimizer if necessary
                                loss_function, apply_log_softmax = get_loss_function(loss_function_name)
                            
                            else:
                                if (endTempThread["end"]):
                                    return
                            if not kill["alive"]:
                                return
        else:
            time.sleep(0.1)  # Sleep if training is stopped
            if (endTempThread["end"]):
                return



def copyModel(model):

    new_model = model
    new_model.load_state_dict(model.state_dict())



def main(seed):
    print("init...")
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork()
    print("train...")

    training(
        model=model,
        cuda=False,     # change to True to run on nvidia gpu
        n_epochs=10,
    )


if __name__ == "__main__":
    main(seed=0)
