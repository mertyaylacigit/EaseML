from queue import Queue
import sys

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

def train_step(model: Module, optimizer: Optimizer, data: Tensor,
               target: Tensor, cuda: bool):
    model.train()
    if cuda:
        data, target = data.cuda(), target.cuda()
    prediction = model(data)
    loss = F.cross_entropy(prediction, target)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()


def check_for_updates(config_path):
    try:
        with open(config_path, 'r') as file:
            config = json.load(file)
        return config['optimizer_params'], config['batch_size']
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


def training(model: Module, cuda: bool, n_epochs: int, stop: dict, queue: Queue = None):
    config_path = 'config/training_config.json'
    optimizer_params, batch_size = check_for_initial_params(config_path)

    while True:
        if not stop['stop']:  # If not stopped, start/resume training
            train_loader, test_loader = get_data_loaders(batch_size=batch_size)
            if cuda:
                model.cuda()

            optimizer = create_optimizer(model, optimizer_params)  # Create optimizer with parameters

            for epoch in range(n_epochs):
                batchCounter = 1
                for batch in train_loader:
                    data, target = batch
                    train_step(model=model, optimizer=optimizer, cuda=cuda, data=data, target=target)
                    test_loss, test_acc = accuracy(model, test_loader, cuda)
                    if queue is not None:
                        queue.put({"acc": test_acc, "loss": test_loss})
                    print(f"epoch={epoch}, batch={batchCounter}, test accuracy={test_acc}, loss={test_loss}")

                    batchCounter += 1
                    print("batch done")
                    
                    while stop['stop']:
                        time.sleep(0.1)  # Sleep to prevent busy waiting
                        # Check for updates only if stop flag is active
                        if stop['stop']:
                            optimizer_params, batch_size = check_for_updates(config_path)
                            optimizer = create_optimizer(model, optimizer_params)  # Update optimizer if necessary

        else:
            time.sleep(0.1)  # Sleep if training is stopped
            

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
