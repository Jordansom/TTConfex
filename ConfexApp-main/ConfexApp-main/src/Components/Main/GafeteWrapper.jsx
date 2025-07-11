import React, { useState, useEffect } from 'react';
import GafetePDF from './GafetePDF.jsx';

const BACKEND_URL =
  window.location.hostname.includes("azurestaticapps.net")
    ? `${process.env.REACT_APP_API_URL}`
    : "http://localhost:8080";

// Función para convertir imagen a base64
const convertImageToBase64 = async (imageUrl) => {
  try {
    console.log("🖼️ Convirtiendo imagen:", imageUrl);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log("✅ Imagen convertida exitosamente");
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("❌ Error convirtiendo imagen:", error);
    return null;
  }
};

// Función para obtener la URL completa de la imagen
const getFullImageUrl = (logoUrl) => {
  if (!logoUrl) return null;
  if (logoUrl.startsWith("data:image")) return logoUrl;
  if (logoUrl.startsWith("http")) return logoUrl;
  if (logoUrl.startsWith("/")) return `${BACKEND_URL}${logoUrl}`;
  return `${BACKEND_URL}/${logoUrl}`;
};

const GafeteWrapper = ({
  user,
  qrCodeDataUrl,
  congresoNombre,
  congresoLogoUrl,
  watermarkType,
  rol,
  congreso,
}) => {
  const [fotoPerfilBase64, setFotoPerfilBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!congresoLogoUrl) {
          console.log("⚠️ No hay URL de logo, usando imagen por defecto");
          setFotoPerfilBase64("https://cdn-icons-png.flaticon.com/512/1077/1077063.png");
          setIsLoading(false);
          return;
        }

        const fullImageUrl = getFullImageUrl(congresoLogoUrl);
        console.log("🔗 URL completa de imagen:", fullImageUrl);

        if (congresoLogoUrl.startsWith("data:image")) {
          // Ya es base64
          setFotoPerfilBase64(congresoLogoUrl);
        } else {
          // Convertir a base64
          const base64Image = await convertImageToBase64(fullImageUrl);
          if (base64Image) {
            setFotoPerfilBase64(base64Image);
          } else {
            console.log("⚠️ Error al convertir imagen, usando imagen por defecto");
            setFotoPerfilBase64("https://cdn-icons-png.flaticon.com/512/1077/1077063.png");
          }
        }
      } catch (err) {
        console.error("❌ Error cargando imagen:", err);
        setError(err.message);
        setFotoPerfilBase64("https://cdn-icons-png.flaticon.com/512/1077/1077063.png");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [congresoLogoUrl]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#B8860B'
      }}>
        <div>
          <div>Cargando imagen del congreso...</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {congresoLogoUrl && `Desde: ${getFullImageUrl(congresoLogoUrl)}`}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#d32f2f'
      }}>
        <div>
          <div>Error cargando imagen: {error}</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Usando imagen por defecto
          </div>
        </div>
      </div>
    );
  }

  return (
    <GafetePDF
      user={user}
      qrCodeDataUrl={qrCodeDataUrl}
      congresoNombre={congresoNombre}
      congresoLogoUrl={congresoLogoUrl}
      watermarkType={watermarkType}
      rol={rol}
      congreso={congreso}
      fotoPerfilBase64={fotoPerfilBase64}
    />
  );
};

export default GafeteWrapper;