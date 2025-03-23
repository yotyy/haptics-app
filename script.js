const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

const sizeSlider = document.getElementById('sizeSlider');
const opacitySlider = document.getElementById('opacitySlider');

const videoElement = document.getElementById('input_video');

let drawing = false;
let prevX = null;
let prevY = null;

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.5
});

hands.onResults(results => {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    drawing = false;
    prevX = null;
    prevY = null;
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const finger = landmarks[8]; // 人差し指の先端
  
  // xとy座標の方向を反転（天井のカメラで捉えることを想定)
  const x = (1 - finger.x) * canvas.width;
  const y = (1 - finger.y) * canvas.height;

  const size = parseInt(sizeSlider.value);
  const alpha = parseInt(opacitySlider.value);

  ctx.fillStyle = `rgba(0, 0, 0, ${alpha / 255})`;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineCap = 'round';
  ctx.lineWidth = size;

  if (prevX !== null && prevY !== null) {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  prevX = x;
  prevY = y;
  drawing = true;
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 400,
  height: 400
});
camera.start();
