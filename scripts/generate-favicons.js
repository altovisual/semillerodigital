const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuración de tamaños
const sizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 150, name: 'mstile-150x150.png' },
];

async function generateFavicons() {
  const inputPath = path.join(__dirname, '../public/SVG/Asset 3mvpx.svg');
  const outputDir = path.join(__dirname, '../public');

  console.log('🎨 Generando favicons desde:', inputPath);

  try {
    // Verificar que el archivo SVG existe
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Archivo SVG no encontrado: ${inputPath}`);
    }

    // Generar cada tamaño
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: ${name} (${size}x${size})`);
    }

    // Generar favicon.ico (multi-resolución)
    const faviconSizes = [16, 32, 48];
    const faviconBuffers = [];

    for (const size of faviconSizes) {
      const buffer = await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      faviconBuffers.push(buffer);
    }

    // Nota: Para generar un .ico real necesitarías una librería específica como 'to-ico'
    // Por ahora, copiamos el PNG de 32x32 como favicon.ico
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));

    console.log('✅ Generado: favicon.ico');

    // Generar safari-pinned-tab.svg (versión monocromática)
    const safariSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path fill="#000000" d="M192.67,286.61c14.35-1.74,22.06,13.15,8.14,22.41-17.46,11.62-28.01,11.37-41.95,30.88-45.68,63.9,25.4,141.69,106.26,116.83,66.59-20.46,80.7-99.93,24.38-137.32-9.04-6-40.23-14.86-24.85-28.85,9.85-8.96,27.81,2.28,37.2,7.87,81.51,48.57,57.16,163.12-37.25,183.21-112.44,23.93-193.49-91.14-117.65-167.41,7.87-7.91,34.45-26.27,45.72-27.64Z M224.08,353.94l-.08-192.04c3.95-55.05,32.02-113.38,97.01-129.76,37.04-9.33,77.14-4.57,113.29,5.62-16.1,54.16-64.66,119.73-132.32,129.93-10.46,1.58-52.17,4.94-46.27-11.68,3.79-10.66,20.88-4.6,31.04-5.06,58.81-2.68,104.85-55.86,120.63-101.44-29.71-4.18-61.4-7-90.08,3.07-47.1,16.54-66.55,61.23-72.08,102.57l.07,198.8c-3.7-.58-17.52-.58-21.22,0Z M208.64,247.39h-35.69c-3.28,0-19.5-4.88-23.52-6.44-30.86-12.01-55.24-45.27-56.55-74.75,16.95-.68,31.75-2.46,48.71.44,46.1,7.89,65.63,42.19,67.06,80.75Z M245.3,353.94c22.99,3.57,33.5,32.38,20.91,49.62-22.24,30.47-76.56,10.69-68.28-24.35,2.33-9.88,14.55-23.46,26.15-25.27,3.7-.58,17.52-.58,21.22,0Z"/>
</svg>`;

    fs.writeFileSync(path.join(outputDir, 'safari-pinned-tab.svg'), safariSvg);
    console.log('✅ Generado: safari-pinned-tab.svg');

    console.log('\n🎉 ¡Todos los favicons generados exitosamente!');
    console.log('\n📋 Archivos creados:');
    sizes.forEach(({ name }) => console.log(`   - ${name}`));
    console.log('   - favicon.ico');
    console.log('   - safari-pinned-tab.svg');

  } catch (error) {
    console.error('❌ Error generando favicons:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateFavicons();
}

module.exports = { generateFavicons };
