start_btn = document.getElementById("start_training")
stop_btn = document.getElementById("stop_training")
continue_btn = document.getElementById("continue_training")
accuracy_span = document.getElementById("accuracy")
ac_chart = document.getElementById("accuracyChart")
l_chart = document.getElementById("lossChart")
 
// deactivate stop and continue button
stop_btn.disabled = true
continue_btn.disabled = true



function start_training(){
  fetch("/start_training")
    .then(response => {
      if (!response.ok){
        console.log("Failed to start training");
      }
    })
    .catch(error => {
      // Handle network or fetch-related errors
      console.error("Error:", error);
    })
    .finally(()=> {
      //
    })

  start_btn.disabled = true
  stop_btn.disabled = false
  
}

function stop_training(){
  fetch("/stop_training")
    .then(response => {
      if (!response.ok){
      console.log("Failed to stop training");
      }
    })
    .catch(error => {
      // Handle network or fetch-related errors
      console.error("Error:", error);
    })
    .finally(()=> {
      //
    })
  
  stop_btn.disabled = true
  continue_btn.disabled = false
  
}

function continue_training(){
  fetch("/continue_training")
    .then(response => {
      if (!response.ok){
      console.log("Failed to continue training");
      }
    })
    .catch(error => {
      // Handle network or fetch-related errors
      console.error("Error:", error);
    })
    .finally(()=> {
      //
    })

  continue_btn.disabled = true
  stop_btn.disabled = false
  
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
      accuracy_span.textContent = data.acc
      updateChart(data.acc, accChart)
      updateChart(data.loss, lossChart)
    })
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


start_btn.addEventListener("click", start_training)
stop_btn.addEventListener("click", stop_training)
continue_btn.addEventListener("click", continue_training)


setInterval(update_accuracy,1000)
