start_btn = document.getElementById("start_training")
stop_btn = document.getElementById("stop_training")
continue_btn = document.getElementById("continue_training")
accuracy_span = document.getElementById("accuracy")
chart = document.getElementById("accuracyChart")
 
// deactivate stop and continue button
stop_btn.disabled = true
continue_btn.disabled = true

//suppesed to keep track of num of batches
//currently doesnt do that but rather tracks amout of updates 
last_batch = 0



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
    })

  continue_btn.disabled = true
  stop_btn.disabled = false
  
}

function updateChart(dataPoint) {
  // Add a new data point to the chart
  last_batch = last_batch +1
  accChart.data.labels.push(last_batch)
  accChart.data.datasets[0].data.push(dataPoint)


  
  // Update the chart
  accChart.update()
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
      updateChart(data.acc)
      accuracy_span.textContent = data.acc
  })

}



accChart = new Chart(chart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Real-time Data',
      borderColor: 'rgb(75, 192, 192)',
      data: [],
      fill: false
    }]
  },
  options: {
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


setInterval(update_accuracy,2000)
