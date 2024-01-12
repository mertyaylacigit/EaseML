
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

// mirrored functions - need to be updated both here and in script.js

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

function updateSliders(params) {
  document.getElementById("batch_size_slider").value = params.batch_size;
  document.getElementById("batch_size_value").textContent = params.batch_size;
  document.getElementById("learning_rate_slider").value = params.optimizer_params.args.lr;
  document.getElementById("learning_rate_value").textContent = params.optimizer_params.args.lr;
  document.getElementById("momentum_slider").value = params.optimizer_params.args.momentum;
  document.getElementById("momentum_value").textContent = params.optimizer_params.args.momentum;
  if (params.loss_function) {
      const lossFunctionDropdown = document.getElementById("loss_function");
      if (lossFunctionDropdown) {
          lossFunctionDropdown.value = params.loss_function;
      }
  }
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
    updateTrainingParams(data);
    updateSliders(data);
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

    if(!configurationList_div.querySelectorAll("button").length == 0){
      clear_config_history_btn.disabled = false
    }  

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














//----------------------------------------------------------------
//----------------------------------------------------------------




// Model history

const save_model_btn = document.getElementById("save_model")
const remove_model_btn = document.getElementById("remove_model")
const clear_model_history_btn = document.getElementById("clear_model_history")
const download_model_btn = document.getElementById("download_model")
const modelList_div = document.getElementById("modelList")

remove_model_btn.disabled = true;
clear_model_history_btn.disabled = true;
download_model_btn.disabled = true;

var current_model_id = -1

//-----------functions-------------------------------------------
/*
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
*/
//------------------------------------------------

function saveModel(){
  fetch("/saveModel")
  .then(response => response.json())
  .then(data => {
    clear_model_history_btn.disabled = false
    modelList_div.getElementsByTagName("p")[0].style.display = "none"
    createModelItem(data)
  })  
  .catch(error => {
    console.error("Error:", error);
  })
}

function createModelItem(data){
  const newModel = document.createElement("button")
  newModel.textContent = JSON.stringify(data.model_id)
  newModel.id = "model-" + data.model_id
  newModel.classList.add("model-item")

  newModel.addEventListener("click",function(){
    remove_model_btn.disabled = false
    download_model_btn.disabled = false
    save_model_btn.disabled = true
    clear_model_history_btn.disabled = true
    current_model_id = newModel.id
    newModel.classList.add("increasedDensity")
    console.log(current_model_id);
  })

  modelList_div.appendChild(newModel)
}

function removeModel(model_id){
  fetch(`/removeModel?model_id=${encodeURIComponent(model_id)}`)
  save_model_btn.disabled = false
  clear_model_history_btn.disabled = false
  modelList_div.querySelector(`#${model_id}`).remove()
  if(modelList_div.querySelectorAll("button").length == 0){
    modelList_div.getElementsByTagName("p")[0].style.display = "block"
    clear_model_history_btn.disabled = true
  }
}

function clearModelHistory(){
  fetch("/clearModelHistory")
  buttons = modelList_div.querySelectorAll("button")
  for (b of buttons){
    modelList_div.removeChild(b)
  }
  modelList_div.getElementsByTagName("p")[0].style.display = "block"
  clear_model_history_btn.disabled = true
}

function downloadModel(model_id){
  const model_id_num = parseInt(model_id.split("-")[1]) // take the id out of the string
  fetch(`/downloadModel?model_id=${encodeURIComponent(model_id_num)}`)
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);

    console.log(url);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = model_id+".pickle";


    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  })
  .catch(error => {
      console.error('Error:', error);
  });
  
}



//------EventListener---------------------------------------------

// reset function: reset element characteristics, when anything is clicked
document.addEventListener('click', function(event) {
  if (!event.target.classList.contains("model-item")){
    save_model_btn.disabled = false
    remove_model_btn.disabled = true
    download_model_btn.disabled = true
    var current_model_id = -1

    if(!modelList_div.querySelectorAll("button").length == 0){
      clear_model_history_btn.disabled = false
    }  

    buttons = modelList_div.querySelectorAll("button")
    for (b of buttons){
      b.classList.remove("increasedDensity")
    }
  } else {
    buttons = modelList_div.querySelectorAll("button")
    for (b of buttons){
      b.classList.remove("increasedDensity")
    }
    event.target.classList.add("increasedDensity")  
  }
})

save_model_btn.addEventListener("click", saveModel)
remove_model_btn.addEventListener("click", () => removeModel(current_model_id))
clear_model_history_btn.addEventListener("click", clearModelHistory)
download_model_btn.addEventListener("click", () => downloadModel(current_model_id))




// select configuration or model 
document.getElementById("select_config_btn").classList.add("increasedDensity")

document.getElementById("select_config_btn").addEventListener("click", ()=>{
  document.getElementById("configuration-history").style.display = "block"
  document.getElementById("model-history").style.display = "None"

  document.getElementById("select_config_btn").classList.add("increasedDensity")
  document.getElementById("select_model_btn").classList.remove("increasedDensity")
})

document.getElementById("select_model_btn").addEventListener("click", ()=>{
  document.getElementById("configuration-history").style.display = "none"
  document.getElementById("model-history").style.display = "block"

  document.getElementById("select_config_btn").classList.remove("increasedDensity")
  document.getElementById("select_model_btn").classList.add("increasedDensity")
})
