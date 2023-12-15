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


// deactivate stop and continue button
stop_btn.disabled = true
continue_btn.disabled = true

var last_batch = 0



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
      update_params_btn.disabled = true;
      updateCurrentParameters();
    })  
}



function updateChart(dataPoint, chart) {
  
  // Checks if point is "new"
  if (dataPoint > 0 && dataPoint !== chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1]) {
  // Add a new data point to the chart
  last_batch = last_batch +1
  chart.data.labels.push(last_batch)
  chart.data.datasets[0].data.push(dataPoint)


  
  // Update the chart
  chart.update()
  lossChart.update()

  }
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
      updateChart(data.acc, accChart)
      updateChart(data.loss, lossChart)
      accuracy_span.textContent = data.acc
      //updateChart(data.loss, lossChart)
    })
}

function updateTrainingParams(newParams) {
  fetch('/update_params', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(newParams),
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch((error) => {
      console.error('Error:', error);
  });
  updateCurrentParameters();
}

function updateCurrentParameters() {
  fetch("/get_current_params")
      .then(response => response.json())
      .then(data => {
          if(data.error) {
              console.error("Failed to fetch current parameters:", data.error);
          } else {
              document.getElementById("current_batch_size").textContent = data.batch_size || "N/A";
              document.getElementById("current_learning_rate").textContent = data.lr || "N/A";
              document.getElementById("current_momentum").textContent = data.momentum || "N/A";
          }
      })
      .catch(error => {
          console.error("Error:", error);
      });
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
      borderColor: 'rgb(255, 75, 75)',
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
      }
    }
  }
});



//------EventListener---------------------------------------------


start_btn.addEventListener("click", start_training)
stop_btn.addEventListener("click", stop_training)
continue_btn.addEventListener("click", continue_training)

batch_size_slider.oninput = function() {
  console.log("Batch size slider value: " + this.value); // Debugging log
  document.getElementById("batch_size_value").textContent = this.value;
}

learning_rate_slider.oninput = function() {
  console.log("Learning rate slider value: " + this.value); // Debugging log
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
      "batch_size": parseInt(batch_size_slider.value)
  };
  updateTrainingParams(newParams);
});


setInterval(update_accuracy,1000)




