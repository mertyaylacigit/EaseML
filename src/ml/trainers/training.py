from queue import Queue
import sys
sys.path.append("ml_utils")

import numpy as np
from torch import manual_seed, Tensor
from torch.cuda import empty_cache
from torch.nn import Module, functional as F
from torch.optim import Optimizer, SGD

from ..importers.data import get_data_loaders
from ..monitors.evaluate import accuracy
from ..models.model import ConvolutionalNeuralNetwork


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


def training(model: Module, optimizer: Optimizer, cuda: bool, n_epochs: int,
             batch_size: int, stop: dict, queue: Queue = None):

    train_loader, test_loader = get_data_loaders(batch_size=batch_size)
    if cuda:
        model.cuda()
    for epoch in range(n_epochs):
        batchCounter = 1
        for batch in train_loader:
            data, target = batch
            train_step(model=model, optimizer=optimizer, cuda=cuda, data=data,
                       target=target)     
            test_loss, test_acc = accuracy(model, test_loader, cuda)
            if queue is not None:
                queue.put(test_acc)         # I moved acc updater into batch for loop, to get more results: #batches * #epochs
            print(f"epoch={epoch}, batch={batchCounter}, test accuracy={test_acc}, loss={test_loss}")   

            batchCounter += 1

            while stop["stop"]:
                #print("stopped")      # when button "stop training" is pressed then training is stuck here
                pass                  # until continue button is pressed
            print("batch done")


    if cuda:
        empty_cache()


def main(seed):
    print("init...")
    manual_seed(seed)
    np.random.seed(seed)
    model = ConvolutionalNeuralNetwork()
    opt = SGD(model.parameters(), lr=0.3, momentum=0.5)
    print("train...")
    training(
        model=model,
        optimizer=opt,
        cuda=False,     # change to True to run on nvidia gpu
        n_epochs=10,
        batch_size=256,
    )


if __name__ == "__main__":
    main(seed=0)
