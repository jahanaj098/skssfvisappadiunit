const userNameInput = document.getElementById('userName');
const imageUpload = document.getElementById('imageUpload');
const dropZone = document.getElementById('dropZone');
const imagePreview = document.getElementById('imagePreview');
const generateBtn = document.getElementById('generateBtn');
const resultArea = document.getElementById('resultArea');
const posterCanvas = document.getElementById('posterCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

const ctx = posterCanvas.getContext('2d');

let uploadedImage = null;
const backgroundImg = new Image();
backgroundImg.src = 'background.png';

// Handle Drag and Drop
dropZone.addEventListener('click', () => imageUpload.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

generateBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    if (!uploadedImage) {
        alert('Please upload a photo');
        return;
    }

    generatePoster(name);
});

function generatePoster(name) {
    // Set canvas dimensions to match background image
    posterCanvas.width = backgroundImg.naturalWidth;
    posterCanvas.height = backgroundImg.naturalHeight;

    // 1. Draw Background
    ctx.drawImage(backgroundImg, 0, 0);

    // 2. Draw User Photo (User Coordinates: 47, 544, 449, 448)
    const photoX = 47;
    const photoY = 544;
    const photoW = 449;
    const photoH = 448;
    const borderRadius = 20;

    ctx.save();
    roundedRect(ctx, photoX, photoY, photoW, photoH, borderRadius);
    ctx.clip();

    const aspect = uploadedImage.width / uploadedImage.height;
    const targetAspect = photoW / photoH;
    let drawW, drawH, drawX, drawY;

    if (aspect > targetAspect) {
        drawH = photoH;
        drawW = photoH * aspect;
        drawX = photoX - (drawW - photoW) / 2;
        drawY = photoY;
    } else {
        drawW = photoW;
        drawH = photoW / aspect;
        drawX = photoX;
        drawY = photoY - (drawH - photoH) / 2;
    }

    ctx.drawImage(uploadedImage, drawX, drawY, drawW, drawH);
    ctx.restore();

    // 3. Draw Name (Wrapped below the photo)
    ctx.font = '700 36px Outfit';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const padding = 20;
    const nameStartY = photoY + photoH + padding;
    const nameCenterX = photoX + photoW / 2;
    const maxWidth = photoW;

    wrapText(ctx, name.toUpperCase(), nameCenterX, nameStartY, maxWidth, 42);

    // Show result
    resultArea.classList.remove('hidden');
    resultArea.scrollIntoView({ behavior: 'smooth' });
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line.trim(), x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line.trim(), x, currentY);
}

function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'skss-poster.png';
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
});

resetBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    userNameInput.value = '';
    imageUpload.value = '';
    imagePreview.classList.add('hidden');
    uploadedImage = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
