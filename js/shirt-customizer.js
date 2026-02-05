const canvas = document.getElementById("shirtCanvas");
const ctx = canvas.getContext("2d");

const colorSelect = document.getElementById("colorSelect");
const designSelect = document.getElementById("designSelect");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const resetBtn = document.getElementById("reset");

const shirtBase = new Image();
shirtBase.src = "/resource/shirts/shirt-base.png";

let designImg = null;
let designScale = 0.55;         // default design size
let designX = canvas.width / 2; // center point
let designY = canvas.height / 2;

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
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw base shirt (wrinkles/shading)
  ctx.drawImage(shirtBase, 0, 0, canvas.width, canvas.height);

  // Tint layer using blend mode (keeps shirt shading)
  const color = colorSelect.value;

  ctx.save();
  ctx.globalCompositeOperation = "multiply"; // key trick for realistic color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Restore contrast a bit (optional but helps)
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(shirtBase, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Draw design on top
  if (designImg) {
    const maxW = canvas.width * designScale;
    const ratio = designImg.width / designImg.height;
    const w = maxW;
    const h = w / ratio;

    const x = designX - w / 2;
    const y = designY - h / 2;

    ctx.drawImage(designImg, x, y, w, h);
  }
}

// Controls
colorSelect.addEventListener("input", render);
designSelect.addEventListener("change", (e) => loadDesign(e.target.value));

zoomInBtn.addEventListener("click", () => {
  designScale = Math.min(0.9, designScale + 0.05);
  render();
});
zoomOutBtn.addEventListener("click", () => {
  designScale = Math.max(0.15, designScale - 0.05);
  render();
});
resetBtn.addEventListener("click", () => {
  designScale = 0.55;
  designX = canvas.width / 2;
  designY = canvas.height / 2;
  colorSelect.value = "#1f6feb";
  designSelect.value = "/resource/designs/bass-beer.png";
  loadDesign(designSelect.value);
});

// Load initial
shirtBase.onload = () => {
  loadDesign(designSelect.value);
};
const colorSwatch = document.getElementById("colorSwatch");

function updateSwatch() {
  colorSwatch.style.background = colorSelect.value;
}

colorSelect.addEventListener("change", () => {
  updateSwatch();
  render();
});

// call once on load:
updateSwatch();