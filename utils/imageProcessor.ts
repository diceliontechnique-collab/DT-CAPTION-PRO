
/**
 * تحويل لون معين في الصورة إلى شفاف (Transparent)
 * يستخدم عادة لمعالجة مخرجات AI التي تأتي بخلفية بيضاء صلبة
 */
export const makeColorTransparent = (dataUrl: string, targetColor: { r: number, g: number, b: number, tolerance: number } = { r: 255, g: 255, b: 255, tolerance: 30 }): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // التحقق مما إذا كان اللون قريباً من اللون المستهدف
        const diffR = Math.abs(r - targetColor.r);
        const diffG = Math.abs(g - targetColor.g);
        const diffB = Math.abs(b - targetColor.b);

        if (diffR < targetColor.tolerance && diffG < targetColor.tolerance && diffB < targetColor.tolerance) {
          data[i + 3] = 0; // جعل الألفا صفر (شفاف)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
};
