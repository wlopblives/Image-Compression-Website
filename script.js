// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const compressButton = document.getElementById('compressButton');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');

// 存储当前图片数据
let currentFile = null;
let compressedBlob = null;

// 初始化拖放区域事件
function initDropZone() {
    // 阻止默认拖放行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // 添加拖放效果
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // 处理拖放文件
    dropZone.addEventListener('drop', handleDrop, false);
}

// 阻止默认行为
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 高亮拖放区域
function highlight(e) {
    dropZone.classList.add('highlight');
}

// 取消高亮拖放区域
function unhighlight(e) {
    dropZone.classList.remove('highlight');
}

// 处理拖放的文件
function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}

// 点击上传区域触发文件选择
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// 处理文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// 处理文件上传
async function handleFile(file) {
    // 检查是否为图片文件
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    
    // 显示原始图片预览
    originalPreview.src = URL.createObjectURL(file);
    originalSize.textContent = formatFileSize(file.size);

    // 显示预览区域
    uploadSection.style.display = 'none';
    previewSection.style.display = 'grid';
    resetButton.style.display = 'inline-block';

    // 重置压缩预览
    compressedPreview.src = '';
    compressedSize.textContent = '0 KB';
    downloadButton.disabled = true;
}

// 更新质量滑块值
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
});

// 压缩图片
compressButton.addEventListener('click', async () => {
    if (!currentFile) return;

    try {
        // 显示加载状态
        compressButton.disabled = true;
        compressButton.textContent = '压缩中...';

        // 压缩配置
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: qualitySlider.value / 100
        };

        // 执行压缩
        compressedBlob = await imageCompression(currentFile, options);

        // 显示压缩后的预览
        compressedPreview.src = URL.createObjectURL(compressedBlob);
        compressedSize.textContent = formatFileSize(compressedBlob.size);

        // 启用下载按钮
        downloadButton.disabled = false;
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    } finally {
        // 恢复按钮状态
        compressButton.disabled = false;
        compressButton.textContent = '开始压缩';
    }
});

// 下载压缩后的图片
downloadButton.addEventListener('click', () => {
    if (!compressedBlob) return;

    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 设置文件名（保持原始文件扩展名）
    const extension = currentFile.name.split('.').pop();
    link.download = `compressed_${Date.now()}.${extension}`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// 重置上传
resetButton.addEventListener('click', () => {
    // 清除当前文件
    currentFile = null;
    compressedBlob = null;
    
    // 重置预览
    originalPreview.src = '';
    compressedPreview.src = '';
    originalSize.textContent = '0 KB';
    compressedSize.textContent = '0 KB';
    
    // 重置质量滑块
    qualitySlider.value = 75;
    qualityValue.textContent = '75%';
    
    // 重置按钮状态
    downloadButton.disabled = true;
    
    // 显示上传区域
    uploadSection.style.display = 'block';
    previewSection.style.display = 'none';
    resetButton.style.display = 'none';
    
    // 清除文件输入
    fileInput.value = '';
});

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化
initDropZone(); 