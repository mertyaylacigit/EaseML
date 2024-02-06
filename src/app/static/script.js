const start_btn = document.getElementById("start_training")
const stop_btn = document.getElementById("stop_training")
const continue_btn = document.getElementById("continue_training")
const reset_btn = document.getElementById("reset_training")
const accuracy_span = document.getElementById("accuracy")
const ac_chart = document.getElementById("accuracyChart")
const l_chart = document.getElementById("lossChart")
const configuration_history = document.getElementById("configuration-history")
const model_history = document.getElementById("model-history")

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
reset_btn.disabled = true

//global Parameters
var last_batch = 0
var refDataset = 0
var refDatasetBranch = -1
var lastAccOg = -1
var lastLossOg = -1
var lastAcc = -1
var lastLoss = -1
let verLines = []
var receviedData = false  //lazy Solution but it works
var knownIDs = [-1]
var chart1Data = false
var chart2Data = true //more flags to track wheter information has been recieved (not pretty but niether am i)

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
      reset_btn.disabled = true;
      batch_size_slider.disabled = true;
      learning_rate_slider.disabled = true;
      momentum_slider.disabled = true;
      loss_function_dropdown.disabled = true;
      update_params_btn.disabled = true;
      toggleHistoryUI(false);
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
      reset_btn.disabled = false;
      batch_size_slider.disabled = false;
      learning_rate_slider.disabled = false;
      momentum_slider.disabled = false;
      loss_function_dropdown.disabled = false;
      update_params_btn.disabled = false;
      toggleHistoryUI(true);
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
      reset_btn.disabled = true;
      batch_size_slider.disabled = true;
      learning_rate_slider.disabled = true;
      momentum_slider.disabled = true;
      loss_function_dropdown.disabled = true;
      update_params_btn.disabled = true;
      configuration_history.disabled = true;
      model_history.disabled = true;
      toggleHistoryUI(false);
      updateCurrentParameters();
    })  
}

function reset_training(){
  fetch("/reset_training")
    .then(response => {
      if (!response.ok){
      console.log("Failed to continue training");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    })
    .finally(()=> {
      reset_btn.disabled = true;
      start_btn.disabled = false
      stop_btn.disabled = true
      continue_btn.disabled = true
      batch_size_slider.disabled = false;
      learning_rate_slider.disabled = false;
      momentum_slider.disabled = false;
      loss_function_dropdown.disabled = false;
      update_params_btn.disabled = false;
      cleanupCharts()
    }) 
}

function cleanupCharts(){
  verLines = [];
  accChart.data = {
    labels: [],
    datasets: [{
      label: 'Accuracy',
      borderColor: 'rgb(75, 192, 192)',
      data: [],
      fill: false
    }]
  };


  lossChart.data = {
    labels: [],
    datasets: [{
      label: 'Loss',
      borderColor: 'rgb(75, 192, 192)',
      data: [],
      fill: false
    }]
  };

  accChart.options =  {
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
    };

    lossChart.options =  {
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
      };


  receviedData = false;
  last_batch = 0;
  refDataset = 0;
  refDatasetBranch = -1;

  accChart.update();
  lossChart.update();
  

}

function addNewDatasets(){

  chart2Data = false
  addVerticalLine(last_batch - 1);
  addNewDataset(lossChart);
  addNewDataset(accChart);
  lossChart.update();
  accChart.update();
}


function addNewDataset(chart) {
  var label = 'Old Parameter' + refDataset/2;
  var color = getRandomColor()

  console.log(refDataset)
  var existingPoint = {
    x:last_batch -1,
    y:chart.data.datasets[refDataset - 2].data[chart.data.datasets[refDataset - 2 ].data.length - 1].y
  };

  console.log(existingPoint)
  var newDataset = {
    label: "Current Model",
    borderColor: 'rgb(75, 192, 192)',
    data: [existingPoint],
    fill: false,
  };

  var newDatasetbranch = {
    label: label,
    borderColor: color,
    data: [existingPoint],
    fill: false,
  };

  chart.data.datasets.push(newDatasetbranch);
  chart.data.datasets.push(newDataset);
}


function proccesData(data){
  if(data.id != -1 && !(knownIDs.includes(data.id))){
    if (knownIDs.length == 3){
      chart2Data = false;
      knownIDs.pop();
      lastAcc = -1;
      lastAcc = -1;
    }
    knownIDs.push(data.id);
  }

  console.log(knownIDs)


      // Checks if point is "new" og Model
  if (data.id == knownIDs[1]){
    if((lastAccOg != data.acc || lastLossOg != data.loss) && !chart1Data){
      updateChart(data.acc, accChart, true);
      updateChart(data.loss, lossChart, true);
      lastAccOg = data.acc;
      lastLossOg = data.loss;
      receviedData = true;
      chart1Data = true;
    }
  }

      // Checks if point is "new" new Model
  else if (data.id == knownIDs[2]){
    if((lastAcc != data.acc || lastLoss != data.loss) && !chart2Data){
      updateChart(data.acc, accChart, false);
      updateChart(data.loss, lossChart, false);
      lastAcc = data.acc;
      lastLoss = data.loss;
      chart2Data = true;
    }
  }
  

  console.log(chart1Data);
  console.log(chart2Data);

  if (chart1Data && chart2Data){
    console.log(last_batch)
    console.log("update")
    last_batch += 1;
    accChart.update();
    lossChart.update()
    chart1Data = false;
    if (knownIDs.length == 3){
      chart2Data = false;
    }
  }
}

function updateChart(dataPoint, chart, original) {
  // format Data
    var point = {
      x: last_batch,
      y: dataPoint,
    };

  // Add a new data point to the chart
  //console.log(last_batch)
  if (original){
    chart.data.labels.push(last_batch)
    chart.data.datasets[refDataset].data.push(point)
  }
  else {
    chart.data.labels.push(last_batch)
    chart.data.datasets[refDatasetBranch].data.push(point)
  }
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
      console.log("Recieved Data:", data)
      console.log(data.dict1);
      proccesData(data.dict1);
      if(data.dict2.acc != -1){
        proccesData(data.dict2);  
      }
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
   // btn.innerHTML = "▼"; // Change to downward arrow when panel is hidden
  } else {
    panel.style.display = "block";
  //  btn.innerHTML = "▲"; // Change to upward arrow when panel is shown
  }
}

function toggleHistoryUI(enable) {
  configuration_history.style.pointerEvents = enable ? 'auto' : 'none';
  configuration_history.style.opacity = enable ? '1' : '0.6';
  model_history.style.pointerEvents = enable ? 'auto' : 'none';
  model_history.style.opacity = enable ? '1' : '0.6';
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
      borderColor:'rgb(75, 192, 192)',
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

function updateSelectedModel(model) {
  console.log(model);
  fetch("/change_selected_model", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(model),
  })
    .then(response => {
      if (!response.ok){
        console.log("Failed to start training");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    })
}




//------EventListener---------------------------------------------


start_btn.addEventListener("click", start_training)
stop_btn.addEventListener("click", stop_training)
continue_btn.addEventListener("click", continue_training)
reset_btn.addEventListener("click", reset_training)

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
    refDataset = refDataset + 2;
    refDatasetBranch = refDatasetBranch + 2;
    addNewDatasets();
  }
  updateTrainingParams(newParams);
});

document.querySelector('.close-btn').addEventListener('click', function() {
  document.querySelector('.introduction-section').style.display = 'none';
});


setInterval(update_accuracy,1000);




