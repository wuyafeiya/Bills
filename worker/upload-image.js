// Cloudflare Worker for handling image uploads to R2
export default {
  async fetch(request, env, ctx) {
    // 允许跨域请求
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 请求（CORS 预检）
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 只接受 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // 解析表单数据
      const formData = await request.formData();
      const file = formData.get('image');

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({
          error: 'No image file provided'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({
          error: 'Invalid file type. Only images are allowed.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({
          error: 'File size exceeds 5MB limit'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `bills/${timestamp}-${randomStr}.${fileExtension}`;

      // 读取文件内容
      const fileBuffer = await file.arrayBuffer();

      // 上传到 R2
      await env.R2_BUCKET.put(fileName, fileBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // 构建公开访问 URL
      // 注意：需要在 R2 中配置自定义域名或公开访问
      const publicUrl = `${env.R2_PUBLIC_URL}/${fileName}`;

      return new Response(JSON.stringify({
        success: true,
        url: publicUrl,
        fileName: fileName
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Upload error:', error);
      return new Response(JSON.stringify({
        error: 'Upload failed: ' + error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
