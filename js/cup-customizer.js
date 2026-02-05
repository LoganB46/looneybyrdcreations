const canvas = document.getElementById("cupCanvas");
const ctx = canvas.getContext("2d");

const designSelect = document.getElementById("designSelect");
const cupSizeSelect = document.getElementById("cupSizeSelect");

// Base images
const cupBase20 = new Image();
cupBase20.src = "/resource/cups/20-oz-cup.png";

const cupBase32 = new Image();
cupBase32.src = "/resource/cups/32-oz-cup.png";
const PRINT_AREAS = {
  "20": {
    x: 240,
    y: 260,
    w: 380,
    h: 420,
    curvature: 0.18
  },
  "32": {
    x: 260,
    y: 300,
    w: 420,
    h: 540,
    curvature: 0.24
  }
};

function getPrintArea() {
  return cupSizeSelect.value === "32"
    ? PRINT_AREAS["32"]
    : PRINT_AREAS["20"];
}

// Active base
let cupBase = cupBase20;

// Design state
let designImg = null;
let designScale = 0.55;
let designX = canvas.width / 2;
let designY = canvas.height / 2;

function drawWrappedDesign(img) {
  const area = getPrintArea();
  const slices = 80; // smoother = more slices
  const sliceW = img.width / slices;

  const targetW = area.w;
  const targetH = targetW * (img.height / img.width);
  const drawH = Math.min(targetH, area.h);
  const drawW = drawH * (img.width / img.height);

  const startX = area.x + (area.w - drawW) / 2;
  const startY = area.y + (area.h - drawH) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.w, area.h);
  ctx.clip();

  for (let i = 0; i < slices; i++) {
    const t = (i / (slices - 1)) * 2 - 1; // -1 → 1
    const curve = 1 - area.curvature * (t * t);

    const sx = i * sliceW;
    const dx = startX + (i / slices) * drawW;
    const dw = (drawW / slices) * curve;

    ctx.drawImage(
      img,
      sx, 0, sliceW, img.height,
      dx, startY, dw, drawH
    );
  }

  ctx.restore();
}

function loadDesign(src) {
  if (!src) {
    designImg = null;
    render();
    return;
  }

  const img = new Image();
  img.src = src;
  img.onload = () => {
    designImg = img;
    render();
  };
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cupBase, 0, 0, canvas.width, canvas.height);

  if(designImg) {
    drawWrappedDesign(designImg);
  }
}

// Events
cupSizeSelect.addEventListener("change", () => {
  cupBase = (cupSizeSelect.value === "32") ? cupBase32 : cupBase20;
  
  if (cupBase.complete && cupBase.naturalWidth) {
    setCanvasToBase(cupBase);
    render();
  } else {
    cupBase.onload = () => {
      setCanvasToBase(cupBase);
      render();
    };
  }
});

designSelect.addEventListener("change", (e) => loadDesign(e.target.value));

// Initial load
cupBase20.onload = () => {
  cupBase = cupBase20;
  setCanvasToBase(cupBase);
  loadDesign(designSelect.value);
  render();
};

// (Optional) modal helper for carousel images
function showImage(img) {
  document.getElementById("modalImage").src = img.src;
}
window.showImage = showImage; // make it callable from onclick=""

function setCanvasToBase(img) {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
}