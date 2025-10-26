/**
 * 上传图片到 Cloudflare R2
 * @param file - 要上传的图片文件
 * @returns Promise<string> - 返回上传后的图片 URL
 */
export async function uploadImageToR2(file: File): Promise<string> {
  const workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL;

  // 如果没有配置 Worker URL，抛出错误以使用备用方案
  if (!workerUrl || workerUrl.trim() === '') {
    throw new Error('WORKER_URL_NOT_CONFIGURED');
  }

  // 创建表单数据
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '上传失败');
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error('上传响应格式错误');
    }

    return data.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
}

/**
 * 将文件转换为 Base64（备用方案）
 * @param file - 要转换的文件
 * @returns Promise<string> - Base64 字符串
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}
