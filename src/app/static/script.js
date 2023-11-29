start_btn = document.getElementById("start_training")
stop_btn = document.getElementById("stop_training")
continue_btn = document.getElementById("continue_training")
accuracy_span = document.getElementById("accuracy")
 
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

function update_accuracy(){
  fetch("/get_accuracy")
    .then(response => {
      if (response.ok) {
        return response.json()
      }
    })
    .then(data => {
      accuracy_span.textContent = data.acc
    })
}


start_btn.addEventListener("click", start_training)
stop_btn.addEventListener("click", stop_training)
continue_btn.addEventListener("click", continue_training)


setInterval(update_accuracy,1000)
