const start_btn = document.getElementById("start_training")
const stop_btn = document.getElementById("stop_training")
const continue_btn = document.getElementById("continue_training")
const accuracy_span = document.getElementById("accuracy")
const ac_chart = document.getElementById("accuracyChart")
const l_chart = document.getElementById("lossChart")

// dynamic parameters
const batch_size_slider = document.getElementById("batch_size_slider")
const learning_rate_slider = document.getElementById("learning_rate_slider")
const momenum_slider = document.getElementById("momentum_slider")
const update_params_btn = document.getElementById("update_params_btn")
const parameter_controls = document.getElementById("parameter_controls")
const loss_function_dropdown = document.getElementById("loss_function");


// deactivate stop and continue button
stop_btn.disabled = true
continue_btn.disabled = true

//global Parameters
var last_batch = 0
var refDataset = 0
var lastAcc = -1
var lastLoss = -1
let verLines = []
var receviedData = false  //lazy Solution but it works


function start_training(){
  fetch("/start_training")
    .then(response => {
      if (!response.ok){
        console.log("Failed to start training");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    })
    .finally(()=> {
      // Hide parameter controls when training starts
      document.querySelectorAll('.neural-network .node').forEach(node => {
        node.classList.remove('orange-outline');
      });
      const neuralNetworkAnimation = document.getElementById('neuralNetworkAnimation');
      neuralNetworkAnimation.style.display = 'flex';
      neuralNetworkAnimation.classList.add('is-training');
      start_btn.disabled = true;
      stop_btn.disabled = false;
      batch_size_slider.disabled = true;
      learning_rate_slider.disabled = true;
      momentum_slider.disabled = true;
      loss_function_dropdown.disabled = true;
      update_params_btn.disabled = true;
      updateCurrentParameters();
    })
}

function stop_training(){
  fetch("/stop_training")
    .then(response => {
      if (!response.ok){
      console.log("Failed to stop training");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    })
    .finally(()=> {
      document.querySelectorAll('.neural-network .node').forEach(node => {
        node.classList.add('orange-outline');
      });
      const neuralNetworkAnimation = document.getElementById('neuralNetworkAnimation');
      neuralNetworkAnimation.classList.remove('is-training');
      stop_btn.disabled = true;
      continue_btn.disabled = false;
      batch_size_slider.disabled = false;
      learning_rate_slider.disabled = false;
      momentum_slider.disabled = false;
      loss_function_dropdown.disabled = false;
      update_params_btn.disabled = false;
    })
}

function continue_training(){
  fetch("/continue_training")
    .then(response => {
      if (!response.ok){
      console.log("Failed to continue training");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    })
    .finally(()=> {
      document.querySelectorAll('.neural-network .node').forEach(node => {
        node.classList.remove('orange-outline');
      });
      const neuralNetworkAnimation = document.getElementById('neuralNetworkAnimation');
      neuralNetworkAnimation.style.display = 'flex';
      neuralNetworkAnimation.classList.add('is-training');
      continue_btn.disabled = true;
      stop_btn.disabled = false;
      batch_size_slider.disabled = true;
      learning_rate_slider.disabled = true;
      momentum_slider.disabled = true;
      loss_function_dropdown.disabled = true;
      update_params_btn.disabled = true;
      updateCurrentParameters();
    })  
}


function addNewDataset(chart) {
  var label = 'New Parameters ' + refDataset;
  var color = getRandomColor()

  var existingPoint = {
    x:last_batch ,
    y:chart.data.datasets[refDataset - 1].data[chart.data.datasets[refDataset - 1 ].data.length -1].y
  };

  console.log(existingPoint)
  var newDataset = {
    label: label,
    borderColor: color,
    data: [existingPoint],
    fill: false,
  };

  addVerticalLine(last_batch);


  chart.data.datasets.push(newDataset);

  chart.update();
}


function updateCharts(data){

  // Checks if point is "new"
  if(lastAcc != data.acc || lastLoss != data.loss){
    last_batch = last_batch +1;
    updateChart(data.acc, accChart);
    updateChart(data.loss, lossChart);
    lastAcc = data.acc;
    lastLoss = data.loss;
    receviedData = true
  }
}

function updateChart(dataPoint, chart) {

  
  
  // format Data
    var point = {
      x: last_batch,
      y: dataPoint,
    };

  // Add a new data point to the chart
  //console.log(last_batch)
  chart.data.labels.push(last_batch)
  chart.data.datasets[refDataset].data.push(point)



  chart.update()
    
}

function addVerticalLine(value) {
  const newLine = {
    type: 'line',
    mode: 'vertical',
    scaleID: 'x',
    value: value,
    borderColor: getRandomColor(),
    borderWidth: 2,
    label: {
      content: 'test',
      enabled: true,
      position: 'top'
    }
  };
  verLines.push(newLine);
}


function update_accuracy(){
  fetch("/get_accuracy")
    .then(response => {
      if (response.ok) {
        return response.json()
      }
    })
    .then(data => {
      //console.log("Recieved Data:", data)
      updateCharts(data);
      accuracy_span.textContent = data.acc
    })
}

// -------------------------------
// mirrored functions - need to be updated both here and in history_script.js

function updateTrainingParams(newParams) {
  fetch('/update_params', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(newParams),
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      updateCurrentParameters(); // Call after successful update
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

function updateCurrentParameters() {
  fetch("/get_current_params")
      .then(response => response.json())
      .then(data => {
          if(data.error) {
              console.error("Failed to fetch current parameters:", data.error);
          } else {
              console.log("Fetched Parameters:", data);
              document.getElementById("current_batch_size").textContent = data.batch_size || "N/A";
              document.getElementById("current_learning_rate").textContent = data.lr || "N/A";
              document.getElementById("current_momentum").textContent = data.momentum || "N/A";
              document.getElementById("current_loss_function").textContent = data.loss_function || "N/A";
          }
      })
      .catch(error => {
          console.error("Error:", error);
      });
}

// -------------------------------

function toggleInfo(panelId, btn) {
  var panel = document.getElementById(panelId);
  if (panel.style.display === "block") {
    panel.style.display = "none";
    btn.innerHTML = "▼"; // Change to downward arrow when panel is hidden
  } else {
    panel.style.display = "block";
    btn.innerHTML = "▲"; // Change to upward arrow when panel is shown
  }
}

function updateSpecificLossFunctionInfo() {
    var lossFunction = document.getElementById("loss_function").value;
    var description = "";

    switch(lossFunction) {
        case "cross_entropy":
            description = "Cross Entropy: Ideal for classification tasks, measures the difference between two probability distributions.";
            break;
        case "nll_loss":
            description = "Negative Log Likelihood: Used with models providing log probabilities, often combined with LogSoftmax layer.";
            break;
        // Add cases for other loss functions
    }

    document.getElementById("specific_loss_function_description").textContent = description;
}







accChart = new Chart(ac_chart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Accuracy',
      borderColor: 'rgb(75, 192, 192)',
      data: [],
      fill: false
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      },
      y: {
        type: 'linear',
        position: 'left'
      }
    },
      plugins: {
      annotation: {
        annotations: verLines
      }
    }
  }
});

lossChart = new Chart(l_chart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Loss',
      borderColor: getRandomColor(),
      data: [],
      fill: false
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
        },
      y: {
        type: 'linear',
        position: 'left'
        }
      },
      plugins: {
        annotation: {
          annotations: verLines
        }
      }
    }
  }
);






function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}




//------EventListener---------------------------------------------


start_btn.addEventListener("click", start_training)
stop_btn.addEventListener("click", stop_training)
continue_btn.addEventListener("click", continue_training)

batch_size_slider.oninput = function() {
  //console.log("Batch size slider value: " + this.value); // Debugging log
  document.getElementById("batch_size_value").textContent = this.value;
}

learning_rate_slider.oninput = function() {
  //console.log("Learning rate slider value: " + this.value); // Debugging log
  document.getElementById("learning_rate_value").textContent = this.value;
}

momentum_slider.oninput = function() {
  document.getElementById("momentum_value").textContent = this.value;
}

update_params_btn.addEventListener("click", function() {
  let newParams = {
      "optimizer_params": {
          "type": "SGD", // Assuming 'SGD' is your desired optimizer
          "args": {
              "lr": parseFloat(learning_rate_slider.value),
              "momentum": parseFloat(momentum_slider.value)
              // Add any other arguments your optimizer requires
          }
      },
      "batch_size": parseInt(batch_size_slider.value),
      "loss_function": loss_function_dropdown.value
  };
  if (receviedData)
  {
    refDataset = refDataset + 1;
    addNewDataset(lossChart);
    addNewDataset(accChart);
  }
  updateTrainingParams(newParams);
});


setInterval(update_accuracy,1000)




