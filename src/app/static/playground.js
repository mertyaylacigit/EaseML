const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');
const predictButton = document.getElementById('predict');
const predictedDigitDiv = document.getElementById('predicted_digit');
let isDrawing = false;

const canvas2 = document.getElementById('compressedCanvas');
const context2 = canvas2.getContext('2d');

canvas.addEventListener('mousedown', () => {
  isDrawing = true;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  draw(e);
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  context.beginPath();
});

canvas.addEventListener('mouseout', () => {
  isDrawing = false;
  context.beginPath();
});


function draw(e) {
  context.lineWidth = 28; // Adjust the line thickness as needed
  context.lineCap = 'round';
  context.strokeStyle = 'rgba(0, 0, 0, 0.7)'; // Color of the drawing
  context.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
  context.stroke();
  context.beginPath();
  context.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
}

predictButton.addEventListener("click", () => {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const alphaValues = [];

  console.log(imageData);


  context2.drawImage(canvas,0,0,28,28)
  const imageDataSmall = context2.getImageData(0,0,28,28).data
  console.log(imageDataSmall);

  for (let i = 3; i < imageDataSmall.length; i += 4) {
    alphaValues.push(imageDataSmall[i]);
    
  }

  console.log(alphaValues);
  

  fetch('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(alphaValues),
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById("predicted_digit_inner").innerHTML = data.label
      document.getElementById("probability").innerHTML = data.probability
      console.log(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
})


clearButton.addEventListener('click', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context2.clearRect(0, 0, canvas2.width, canvas2.height);
  document.getElementById("predicted_digit_inner").innerHTML = ""
  document.getElementById("probability").innerHTML = ""
});