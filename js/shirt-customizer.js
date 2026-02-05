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

// zoomInBtn.addEventListener("click", () => {
//  designScale = Math.min(0.9, designScale + 0.05);
//  render();
// });
// zoomOutBtn.addEventListener("click", () => {
//  designScale = Math.max(0.15, designScale - 0.05);
//  render();
//});
// resetBtn.addEventListener("click", () => {
//  designScale = 0.55;
//  designX = canvas.width / 2;
//  designY = canvas.height / 2;
// colorSelect.value = "#FFFFFF";
//  designSelect.value = "/resource/designs/placeholder.png";
//  loadDesign(designSelect.value);
// });

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

const shirtColors = {
  "White": "#FFFFFF",
  "Black": "#000000",
  "Ash Grey": "#E5E5E5",
  "Sport Grey": "#9EA0A1",
  "Natural": "#F2EAD3",
  "Sand": "#D8CFC4",
  "Gravel": "#B7B7B7",
  "Graphite Heather": "#8E8F91",
  "Charcoal": "#4A4A4A",
  "Tweed": "#7C7F82",
  "Navy": "#1C2A44",
  "Heather Navy": "#2F3A4A",
  "Indigo Blue": "#355C7D",
  "Royal": "#4169E1",
  "Carolina Blue": "#7BA6E5",
  "Light Blue": "#ADD8E6",
  "Sky": "#87BCE5",
  "Sapphire": "#1F75A8",
  "Antique Sapphire": "#4F8FBF",
  "Cobalt": "#3A4DBF",
  "Neon Blue": "#4D5BFF",
  "Tropical Blue": "#3FA9E2",
  "Red": "#C1121F",
  "Cardinal Red": "#8C1D18",
  "Antique Cherry": "#B6455A",
  "Garnet": "#7A0C0C",
  "Maroon": "#7C2A2A",
  "Berry": "#9E3F5F",
  "Heather Red": "#B25A6A",
  "Azalea": "#F58AAE",
  "Safety Pink": "#FF6FAE",
  "Light Pink": "#FADADD",
  "Violet": "#C8A2C8",
  "Purple": "#5A2A82",
  "Lilac": "#B9A0D8",
  "Heather Radiant Orchid": "#C879D8",
  "Blackberry": "#4B3B53",
  "Midnight": "#2B2352",
  "Russet": "#6B4A4A",
  "Forest Green": "#1E3A2F",
  "Irish Green": "#2F7F3E",
  "Antique Irish Green": "#4FAF77",
  "Military Green": "#5B614D",
  "Heather Military Green": "#6A6F5E",
  "Mint Green": "#BFE6C8",
  "Kiwi": "#7FB239",
  "Electric Green": "#4CD137",
  "Safety Green": "#C7E62E",
  "Neon Green": "#66FF00",
  "Turf Green": "#1F7A4D",
  "Lime": "#B6FF4D",
  "Gold": "#F4D03F",
  "Old Gold": "#C9A24D",
  "Corn Silk": "#FFF2B2",
  "Daisy": "#FFF44F",
  "Yellow Haze": "#F5F1B0",
  "Orange": "#F28C28",
  "Antique Orange": "#F08A5D",
  "Safety Orange": "#FF8C00",
  "Tennessee Orange": "#F77F00",
  "Texas Orange": "#C45A2E",
  "Sunset": "#C46A3A",
  "Brown Savana": "#A48B78",
  "Dark Chocolate": "#4A3A2A"
};


const colorName = document.getElementById("colorName");

// build dropdown
function populateColorDropdown(defaultName = "Royal") {
  // (optional) sort alphabetically
  const entries = Object.entries(shirtColors).sort((a, b) => a[0].localeCompare(b[0]));

  colorSelect.innerHTML = "";
  for (const [name, hex] of entries) {
    const opt = document.createElement("option");
    opt.value = hex;        // what your render() will use
    opt.textContent = name; // what the user sees
    if (name === defaultName) opt.selected = true;
    colorSelect.appendChild(opt);
  }

  updateColorUI();
}

function updateColorUI() {
  const hex = colorSelect.value;
  const selectedName = colorSelect.options[colorSelect.selectedIndex].text;

  if (colorSwatch) colorSwatch.style.backgroundColor = hex;
  if (colorName) colorName.textContent = `${selectedName} (${hex})`;

  // call your shirt render function here
  // render();
}

// listen for changes
colorSelect.addEventListener("change", updateColorUI);

// run once on load
populateColorDropdown("White");

function showImage(img) {  
        document.getElementById("modalImage").src = img.src;
    }