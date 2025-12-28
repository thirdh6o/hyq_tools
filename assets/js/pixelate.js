document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('upload-btn');
  const widthInput = document.getElementById('width-input');
  const heightInput = document.getElementById('height-input');
  const alphaToggle = document.getElementById('alpha-toggle');
  const generateBtn = document.getElementById('generate-btn');
  const downloadBtn = document.getElementById('download-btn');
  const previewCanvas = document.getElementById('preview-canvas');
  const placeholder = document.getElementById('placeholder');
  const sizeBtns = document.querySelectorAll('.size-btn');

  let imageFile = null;

  // 保存最近一次生成结果，便于“点击保存”直接保存
  let lastResult = {
    blob: null,
    filename: null,
    dataUrl: null,
  };

  uploadBtn.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      imageFile = e.target.files[0];
      placeholder.style.display = 'none';
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const ctx = previewCanvas.getContext('2d');
          previewCanvas.width = img.width;
          previewCanvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  });

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      widthInput.value = size;
      heightInput.value = size;
    });
  });

  // 关键：浏览器端“另存为”并写入文件
  async function saveWithDialog(blob, suggestedName) {
    // File System Access API (Chromium)
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'PNG Image',
            accept: { 'image/png': ['.png'] }
          }
        ]
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    }

    // 不支持则返回 false，外面走 fallback
    return false;
  }

  // fallback：仍然用浏览器下载（默认下载目录/浏览器询问位置设置）
  function fallbackDownload(dataUrl, filename) {
    downloadBtn.href = dataUrl;
    downloadBtn.download = filename;

    // 有些情况下是按钮/链接，直接点击触发下载
    // 如果你的 downloadBtn 不是 <a>，可以创建临时 <a> 来触发
    if (downloadBtn.tagName.toLowerCase() === 'a') {
      downloadBtn.click();
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  // 生成像素图（不自动下载，只生成结果并展示）
  generateBtn.addEventListener('click', () => {
    if (!imageFile) {
      alert('请先上传一张图片');
      return;
    }

    const width = parseInt(widthInput.value) || 32;
    const height = parseInt(heightInput.value) || 32;
    const keepAlpha = alphaToggle.checked;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = width;
        resultCanvas.height = height;
        const ctx = resultCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        if (!keepAlpha) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, width, height);
        }

        const scale = Math.min(width / img.width, height / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const dx = (width - drawW) / 2;
        const dy = (height - drawH) / 2;

        ctx.drawImage(img, dx, dy, drawW, drawH);

        if (!keepAlpha) {
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i + 3] = 255;
          }
          ctx.putImageData(imageData, 0, 0);
        }

        // 预览（你原来的逻辑）
        const dataUrl = resultCanvas.toDataURL('image/png');
        const previewCtx = previewCanvas.getContext('2d');
        previewCanvas.width = width;
        previewCanvas.height = height;

        const pixelatedImg = new Image();
        pixelatedImg.onload = () => {
          previewCtx.clearRect(0, 0, width, height);
          previewCtx.drawImage(pixelatedImg, 0, 0);
        };
        pixelatedImg.src = dataUrl;

        // 保存结果：同时保存 Blob（用于写文件）+ dataURL（用于 fallback）
        const blob = await new Promise(resolve => resultCanvas.toBlob(resolve, 'image/png'));
        const filename = `pixelated-${width}x${height}.png`;

        lastResult = { blob, filename, dataUrl };

        // 显示保存按钮
        downloadBtn.style.display = 'inline-block';
        placeholder.style.display = 'none';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
  });


  downloadBtn.addEventListener('click', async (e) => {
    // 如果 downloadBtn 是 <a>，阻止默认跳转
    e.preventDefault();

    if (!lastResult.blob) {
      alert('请先点击生成');
      return;
    }

    try {
      const ok = await saveWithDialog(lastResult.blob, lastResult.filename);
      if (!ok) {
        // 浏览器不支持系统保存对话框，就退回浏览器下载
        fallbackDownload(lastResult.dataUrl, lastResult.filename);
      }
    } catch (err) {
      // 用户取消保存、或其他错误：不算严重错误
      console.warn(err);
    }
  });
});
