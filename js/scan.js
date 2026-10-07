/* ════════════════════════════════════════════════════════
   CAST HOME BUILDERS — scan.js
   Camera capture flow for the bathroom-scan tool (scan.html).
   ════════════════════════════════════════════════════════ */

const MAX_RECORD_MS = 25000; // auto-stop the "scan" recording at 25s

const steps = {};
document.querySelectorAll('.scan-step').forEach(el => { steps[el.id] = el; });

function showStep(id) {
  Object.values(steps).forEach(el => { el.hidden = true; });
  steps[id].hidden = false;
}

let mediaStream = null;
let photoBlob = null;
let videoBlob = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordTimer = null;
let recordStartedAt = 0;
let autoStopHandle = null;

const videoPreview = document.getElementById('video-preview');
const videoPreview2 = document.getElementById('video-preview-2');
const photoResult = document.getElementById('photo-result');
const videoResult = document.getElementById('video-result');
const scanTimer = document.getElementById('scan-timer');
const cameraError = document.getElementById('camera-error');
const submitError = document.getElementById('submit-error');

function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    videoPreview.srcObject = mediaStream;
    videoPreview2.srcObject = mediaStream;
    showStep('step-photo');
  } catch (err) {
    showError(cameraError, "We couldn't access your camera. Please allow camera access and try again.");
  }
}

document.getElementById('btn-start').addEventListener('click', startCamera);

/* ── Step 1: before photo ─────────────────────────────── */
document.getElementById('btn-capture-photo').addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = videoPreview.videoWidth;
  canvas.height = videoPreview.videoHeight;
  canvas.getContext('2d').drawImage(videoPreview, 0, 0);
  canvas.toBlob(blob => {
    photoBlob = blob;
    photoResult.src = URL.createObjectURL(blob);
    showStep('step-photo-review');
  }, 'image/jpeg', 0.9);
});

document.getElementById('btn-retake-photo').addEventListener('click', () => {
  showStep('step-photo');
});

document.getElementById('btn-confirm-photo').addEventListener('click', () => {
  showStep('step-video');
});

/* ── Step 2: video scan ───────────────────────────────── */
function pickMimeType() {
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4'
  ];
  return candidates.find(type => window.MediaRecorder && MediaRecorder.isTypeSupported(type)) || '';
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') return;
  recordedChunks = [];
  const mimeType = pickMimeType();
  mediaRecorder = mimeType
    ? new MediaRecorder(mediaStream, { mimeType, videoBitsPerSecond: 2500000 })
    : new MediaRecorder(mediaStream);

  mediaRecorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    videoBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/webm' });
    videoResult.src = URL.createObjectURL(videoBlob);
    showStep('step-video-review');
  };

  mediaRecorder.start();
  recordStartedAt = Date.now();
  scanTimer.hidden = false;
  document.getElementById('btn-record').hidden = true;
  document.getElementById('btn-stop-record').hidden = false;

  recordTimer = setInterval(() => {
    scanTimer.textContent = formatTime(Date.now() - recordStartedAt);
  }, 250);

  autoStopHandle = setTimeout(stopRecording, MAX_RECORD_MS);
}

function stopRecording() {
  if (autoStopHandle) clearTimeout(autoStopHandle);
  if (recordTimer) clearInterval(recordTimer);
  scanTimer.hidden = true;
  document.getElementById('btn-record').hidden = false;
  document.getElementById('btn-stop-record').hidden = true;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
}

document.getElementById('btn-record').addEventListener('click', startRecording);
document.getElementById('btn-stop-record').addEventListener('click', stopRecording);

document.getElementById('btn-retake-video').addEventListener('click', () => {
  showStep('step-video');
});

document.getElementById('btn-confirm-video').addEventListener('click', () => {
  if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
  showStep('step-contact');
});

/* ── Step 3: contact + submit ─────────────────────────── */
document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault();
  submitError.hidden = true;

  const formData = new FormData();
  formData.append('name', document.getElementById('contact-name').value.trim());
  formData.append('email', document.getElementById('contact-email').value.trim());
  formData.append('phone', document.getElementById('contact-phone').value.trim());
  formData.append('address', document.getElementById('contact-address').value.trim());
  formData.append('before_photo', photoBlob, 'before.jpg');
  formData.append('scan_video', videoBlob, 'scan.webm');

  showStep('step-uploading');

  try {
    const res = await fetch('/api/submit-scan', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    showStep('step-success');
  } catch (err) {
    showStep('step-contact');
    showError(submitError, "Something went wrong sending your scan. Please try again.");
  }
});
