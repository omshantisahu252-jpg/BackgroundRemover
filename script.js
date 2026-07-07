// script.js
let originalImageData = null;
let resultImageUrl = null;
let currentFile = null;

const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const browseBtn = document.getElementById('browse-btn');
const removeBtn = document.getElementById('remove-bg-btn');
const downloadBtn = document.getElementById('download-btn');
const newUploadBtn = document.getElementById('new-upload');
const loadingOverlay = document.getElementById('loading-overlay');
const toast = document.getElementById('toast');
const originalPreview = document.getElementById('original-preview');
const resultImageEl = document.getElementById('result-image');
const originalImageEl = document.getElementById('original-image');
const fileInfo = document.getElementById('file-info');

function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.style.display = 'flex';
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

function formatFileSize(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

browseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
        showToast('Unsupported file format. Use JPG, PNG or WEBP.');
        return;
    }
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('File too large. Maximum 10MB.');
        return;
    }

    currentFile = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        originalImageData = e.target.result;
        
        // Show app
        document.querySelector('.hero').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        // Preview original
        const img = document.createElement('img');
        img.src = originalImageData;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '420px';
        img.style.borderRadius = '16px';
        originalPreview.innerHTML = '';
        originalPreview.appendChild(img);

        // Populate file info
        fileInfo.innerHTML = `
            <div><strong>${file.name}</strong></div>
            <div>${formatFileSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}</div>
        `;

        // Enable remove button
        removeBtn.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

removeBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    loadingOverlay.style.display = 'flex';
    const progressFill = document.getElementById('progress-fill');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress > 92) progress = 92;
        progressFill.style.width = `${progress}%`;
    }, 180);

    try {
        const formData = new FormData();
        formData.append('image', currentFile);

        const response = await fetch(`${CONFIG.WORKER_URL}/remove`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to process image');

        const blob = await response.blob();
        resultImageUrl = URL.createObjectURL(blob);

        // Display results
        document.getElementById('upload-view').style.display = 'none';
        document.getElementById('results-view').style.display = 'block';

        originalImageEl.src = originalImageData;
        resultImageEl.src = resultImageUrl;

        // Setup slider
        setupSlider();

    } catch (err) {
        console.error(err);
        showToast('Failed to remove background. Please try again.');
        document.getElementById('retry-btn').style.display = 'inline-flex';
    } finally {
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            progressFill.style.width = '0%';
        }, 600);
    }
});

function setupSlider() {
    const divider = document.getElementById('slider-divider');
    const overlay = document.querySelector('.slider-overlay');
    let isDragging = false;

    function moveSlider(clientX) {
        const rect = divider.parentElement.getBoundingClientRect();
        let percentage = ((clientX - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        overlay.style.width = `${percentage}%`;
        divider.style.left = `${percentage}%`;
    }

    divider.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
        if (isDragging) moveSlider(e.clientX);
    });

    // Touch support
    divider.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('touchend', () => isDragging = false);
    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
            moveSlider(e.touches[0].clientX);
        }
    });
}

downloadBtn.addEventListener('click', () => {
    if (!resultImageUrl) return;
    const a = document.createElement('a');
    a.href = resultImageUrl;
    a.download = 'background-removed.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Image downloaded successfully!');
});

document.getElementById('copy-btn').addEventListener('click', async () => {
    if (!resultImageUrl) return;
    try {
        const response = await fetch(resultImageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('Image copied to clipboard!');
    } catch (e) {
        showToast('Failed to copy image.');
    }
});

newUploadBtn.addEventListener('click', () => {
    location.reload();
});

document.getElementById('retry-btn').addEventListener('click', () => {
    document.getElementById('retry-btn').style.display = 'none';
    removeBtn.click();
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
let isDark = false;

themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loadingOverlay.style.display !== 'none') {
        // Optional cancel logic
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('%cClarityCut AI Background Remover ready 🚀', 'color:#6366f1; font-weight:600');
});