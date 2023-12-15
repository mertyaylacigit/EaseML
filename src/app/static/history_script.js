
// configuration history
const save_config_btn = document.getElementById("save_config")
const remove_config_btn = document.getElementById("remove_config")
const load_config_btn = document.getElementById("load_config")
const clear_config_history_btn = document.getElementById("clear_config_history")
const configurationList_div = document.getElementById("configurationList")

load_config_btn.disabled = true;
remove_config_btn.disabled = true;
clear_config_history_btn.disabled = true;

var current_config_id = -1



//-----------functions-------------------------------------------

// imported functions 
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
              updateSliders(data)
          }
      })
      .catch(error => {
          console.error("Error:", error);
      });
}

function updateSliders(data){
  document.getElementById("batch_size_slider").value = data.batch_size
  document.getElementById("batch_size_value").textContent = data.batch_size
  document.getElementById("learning_rate_slider").value = data.lr
  document.getElementById("learning_rate_value").textContent = data.lr
  document.getElementById("momentum_slider").value = data.momentum
  document.getElementById("momentum_value").textContent = data.momentum

}

//------------------------------------------------

function saveConfiguration(){
  fetch("/saveConfiguration")
  .then(response => response.json())
  .then(data => {
    clear_config_history_btn.disabled = false
    configurationList_div.getElementsByTagName("p")[0].style.display = "none"
    createConfigItem(data)
    
  })  
  .catch(error => {
    console.error("Error:", error);
  })
}

function createConfigItem(data){
  const newconfig = document.createElement("button")
  newconfig.textContent = JSON.stringify(data.config_body)
  newconfig.id = "config-" + data.config_id
  newconfig.classList.add("configuration-item")

  newconfig.addEventListener("click",function(){
    remove_config_btn.disabled = false
    load_config_btn.disabled = false
    save_config_btn.disabled = true
    clear_config_history_btn.disabled = true
    current_config_id = newconfig.id
    newconfig.classList.add("increasedDensity")
  })

  configurationList_div.appendChild(newconfig)
}

function removeConfiguration(config_id){
  fetch(`/removeConfiguration?config_id=${encodeURIComponent(config_id)}`)
  save_config_btn.disabled = false
  clear_config_history_btn.disabled = false
  configurationList_div.querySelector(`#${config_id}`).remove()
  if(configurationList_div.querySelectorAll("button").length == 0){
    configurationList_div.getElementsByTagName("p")[0].style.display = "block"
    clear_config_history_btn.disabled = true
  }
}

function loadConfiguration(config_id){
  config_id = parseInt(config_id.split("-")[1]) // take the id out of the string
  fetch(`/loadConfiguration?config_id=${encodeURIComponent(config_id)}`)
  .then(response => response.json())
  .then(data => {
    updateTrainingParams(data)
  })  
  .catch(error => {
    console.error("Error:", error);
  })
  save_config_btn.disabled = false
  clear_config_history_btn.disabled = false
}

function clearConfigurationHistory(){
  fetch("/clearConfigurationHistory")
  buttons = configurationList_div.querySelectorAll("button")
  for (b of buttons){
    configurationList_div.removeChild(b)
  }
  configurationList_div.getElementsByTagName("p")[0].style.display = "block"
  clear_config_history_btn.disabled = true
}


//------EventListener---------------------------------------------

// reset function: reset element characteristics, when anything is clicked
document.addEventListener('click', function(event) {
  if (!event.target.classList.contains("configuration-item")){
    save_config_btn.disabled = false
    remove_config_btn.disabled = true
    load_config_btn.disabled = true
    var current_config_id = -1

    buttons = configurationList_div.querySelectorAll("button")
    for (b of buttons){
      b.classList.remove("increasedDensity")
    }
    

  } else {
    buttons = configurationList_div.querySelectorAll("button")
    for (b of buttons){
      b.classList.remove("increasedDensity")
    }
    event.target.classList.add("increasedDensity")  

  }

})

save_config_btn.addEventListener("click", saveConfiguration)
remove_config_btn.addEventListener("click", () => removeConfiguration(current_config_id))
load_config_btn.addEventListener("click", () => loadConfiguration(current_config_id))
clear_config_history_btn.addEventListener("click", clearConfigurationHistory)

