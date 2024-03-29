const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treble = document.getElementById('treble');
const visualizer = document.getElementById('visualizer');
const audioContext = new AudioContext();
const analyserNode = new AnalyserNode(audioContext,{fftSize: 256});
const gainNode = new GainNode(audioContext,{gain: volume.value});
const bassEqualizer = new BiquadFilterNode(audioContext,{
     type: 'lowshelf',
     frequency: 500,
     gain: bass.value,
});
const midEqualizer = new BiquadFilterNode(audioContext,{
     type: 'peaking',
     Q: Math.SQRT1_2,
     frequency: 1500,
     gain: mid.value,
});
const trebleEqualizer = new BiquadFilterNode(audioContext,{
     type: 'highshelf',
     frequency: 3000,
     gain: treble.value,
});
setupEventListeners();
setupContext();
resize();
drawVisualizer();
function setupEventListeners(){
     window.addEventListener('resize',resize);
     volume.addEventListener('input',event => {
          const value = parseFloat(event.target.value);
          gainNode.gain.setTargetAtTime(value,audioContext.currentTime,0.01);
     });
     bass.addEventListener('input',event => {
          const value = parseInt(event.target.value);
          bassEqualizer.gain.setTargetAtTime(value,audioContext.currentTime,0.01);
     });
     mid.addEventListener('input',event => {
          const value = parseInt(event.target.value);
          midEqualizer.gain.setTargetAtTime(value,audioContext.currentTime,0.01);
     });
     treble.addEventListener('input',event => {
          const value = parseInt(event.target.value);
          trebleEqualizer.gain.setTargetAtTime(value,audioContext.currentTime,0.01);
     });
}
async function setupContext(){
     const guitar = await getGuitar();
     if(audioContext.state === 'suspended'){
          await audioContext.resume();
     }
     const source = audioContext.createMediaStreamSource(guitar);
     source.connect(bassEqualizer).connect(midEqualizer).connect(trebleEqualizer).connect(gainNode).connect(analyserNode).connect(audioContext.destination);
}
function getGuitar(){
     return navigator.mediaDevices.getUserMedia({
          audio: {
               echoCancellation: false,
               autoGainControl: false,
               noiseSuppression: false,
               latency: 0,
          }
     });
}
function drawVisualizer(){
     requestAnimationFrame(drawVisualizer);
     const bufferLength = analyserNode.frequencyBinCount;
     const dataArray = new Uint8Array(bufferLength);
     analyserNode.getByteFrequencyData(dataArray);
     const width = visualizer.width;
     const height = visualizer.height;
     const barWidth = width / bufferLength;
     const canvasContext = visualizer.getContext('2d');
     canvasContext.clearRect(0,0,width,height);
     dataArray.forEach((item,index) => {
          const y = item / 255 * height / 2;
          const x = barWidth * index;
          canvasContext.fillStyle = `hsl(${y / height * 400},100%,50%)`;
          canvasContext.fillRect(x,height - y,barWidth,y);
     });
}
function resize(){
     visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
     visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
}
