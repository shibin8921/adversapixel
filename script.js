const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("download");
const pixelInfo = document.getElementById("pixelInfo");

let originalImageData = null;
let distortedImageData = null;
const seed = Math.floor(Math.random() * 1000);

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // draw original
    ctx.drawImage(img, 0, 0);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // distort
    distortImage();
  };

  img.src = URL.createObjectURL(file);
});

function distortImage() {
  distortedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = distortedImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.min(255, data[i] + (seed % 3)); // R
    data[i + 1] = Math.max(0,   data[i + 1] - (seed % 2)); // G
    data[i + 2] = Math.min(255, data[i + 2] + (seed % 4)); // B
  }

  ctx.putImageData(distortedImageData, 0, 0);
}

// CLICK TO INSPECT PIXEL
canvas.addEventListener("click", (e) => {
  if (!originalImageData || !distortedImageData) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  const index = (y * canvas.width + x) * 4;

  const o = originalImageData.data;
  const d = distortedImageData.data;

  const oRGB = `(${o[index]}, ${o[index+1]}, ${o[index+2]})`;
  const dRGB = `(${d[index]}, ${d[index+1]}, ${d[index+2]})`;

  const diff = `
    ΔR=${d[index] - o[index]},
    ΔG=${d[index+1] - o[index+1]},
    ΔB=${d[index+2] - o[index+2]}
  `;

  pixelInfo.innerText =
    `Pixel (x:${x}, y:${y})
Original RGB: ${oRGB}
Distorted RGB: ${dRGB}
Difference: ${diff}`;
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "protected.png";
  link.href = canvas.toDataURL();
  link.click();
});
