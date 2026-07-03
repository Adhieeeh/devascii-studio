import React, { useState, useRef } from 'react';


const DENSER_CHARS = '@%#*+=-:. ';
const BLOCKS_CHARS = '█▓▒░ ';

function App() {

  const [characterSet, setCharacterSet] = useState('STANDARD');
  const [scaleFactor, setScaleFactor] = useState(40); 
  const [contrastBoost, setContrastBoost] = useState(1);
  const [filterMode, setFilterMode] = useState('MATRIX');
  const [asciiOutput, setAsciiOutput] = useState('Upload media to compile ASCII matrices...');

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  
  const processImageToAscii = (imageSource) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

  
    const targetWidth = scaleFactor;
    const targetHeight = Math.round(scaleFactor * aspectRatio * 0.55); 

    canvas.width = targetWidth;
    canvas.height = targetHeight;

   
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

    
    try {
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const pixels = imgData.data;
      let asciiMatrixString = '';

      const charPool = characterSet === 'STANDARD' ? DENSER_CHARS : BLOCKS_CHARS;


      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const index = (y * targetWidth + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];

         
          let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;


          luminance = ((luminance / 255 - 0.5) * contrastBoost + 0.5) * 255;
          luminance = Math.min(255, Math.max(0, luminance));

          
          const charIndex = Math.floor(((255 - luminance) / 256) * charPool.length);
          asciiMatrixString += charPool[charIndex] || ' ';
        }
        asciiMatrixString += '\n';
      }

      setAsciiOutput(asciiMatrixString);
    } catch (err) {
      setAsciiOutput(`Buffer Compilation Aborted: ${err.message}`);
    }
  };

  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processImageToAscii(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

 
  const [copyFeedback, setCopyFeedback] = useState('📋 Copy ASCII Matrix');
  const handleCopyCode = () => {
    navigator.clipboard.writeText(asciiOutput);
    setCopyFeedback('Matrix Saved! ⚡');
    setTimeout(() => setCopyFeedback('Copy ASCII Matrix'), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', fontFamily: 'monospace', backgroundColor: '#070a13', color: '#f8fafc', minHeight: '90vh' }}>
      
      {/*  */}
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '25px', marginBottom: '35px', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#a855f7', letterSpacing: '-0.5px' }}> DevASCII Text-Raster Compiler</h1>
          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '12px' }}>An advanced client-side processing core that samples image luminosity matrices into ASCII strings.</p>
        </div>
        
        <button onClick={handleCopyCode} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #a855f7', color: '#a855f7', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', transition: '0.2s' }}>
          {copyFeedback}
        </button>
      </header>

      {/*  */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* */}
        <section style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '13px', color: '#475569', uppercase: 'true', margin: '0', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>Matrix Processing Filters</h3>

          {/*  */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '8px' }}>Ingest Target Raster Image</label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              style={{ width: '100%', padding: '10px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', color: '#94a3b8', fontSize: '13px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '8px' }}>Downsampling Density (Resolution Matrix)</label>
            <input type="range" min="20" max="100" value={scaleFactor} onChange={(e) => setScaleFactor(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }} />
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>Target block capacity: {scaleFactor} character blocks horizontal</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '8px' }}>Contrast Multiplier Factor ({contrastBoost}x)</label>
            <input type="range" min="1.0" max="3.0" step="0.2" value={contrastBoost} onChange={(e) => setContrastBoost(Number(e.target.value))} style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: '1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '6px' }}>Character Font Pool</label>
              <select value={characterSet} onChange={(e) => setCharacterSet(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
                <option value="STANDARD">Standard Glyphs (@%#*+=-:.)</option>
                <option value="BLOCKS">Solid Vector Blocks (█▓▒░)</option>
              </select>
            </div>
            <div style={{ flex: '1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '6px' }}>Console Terminal HUD Color</label>
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff' }}>
                <option value="MATRIX">Matrix Cyber Digital Green</option>
                <option value="MONO">High Contrast Inverted White</option>
                <option value="RETRO">Amber Phosphor Mainframe Terminal</option>
              </select>
            </div>
          </div>

          {/* Hidden Offscreen Pipeline Buffer Canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div style={{ padding: '12px 14px', backgroundColor: '#070a13', borderLeft: '4px solid #a855f7', borderRadius: '0 8px 8px 0', fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
            <strong>Developer Node Info:</strong> Scale alterations and font adjustments require re-uploading your asset file to clear canvas buffer memory streams.
          </div>
        </section>

        {/*  */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '13px', color: '#475569', uppercase: 'true', margin: '0 0 12px 0' }}>Compiled Low-Fi Vector Output Console</h3>
          
          <div style={{ 
            flexGrow: '1', 
            backgroundColor: '#020617', 
            border: '1px dashed #334155', 
            borderRadius: '16px', 
            padding: '20px', 
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <pre style={{ 
              margin: '0', 
              fontFamily: 'monospace', 
              fontSize: '10px', 
              lineHeight: '1.0', 
              letterSpacing: '1px',
              whiteSpace: 'pre',
              width: '100%',
              textAlign: 'center',
              color: filterMode === 'MATRIX' ? '#34d399' : filterMode === 'RETRO' ? '#fbbf24' : '#f8fafc',
              textShadow: filterMode === 'MATRIX' ? '0 0 4px rgba(52, 211, 153, 0.4)' : filterMode === 'RETRO' ? '0 0 4px rgba(251, 191, 36, 0.4)' : 'none'
            }}>
              {asciiOutput}
            </pre>
          </div>
        </section>

      </div>

    </div>
  );
}

export default App;