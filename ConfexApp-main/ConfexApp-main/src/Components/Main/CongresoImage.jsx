import React, { useState } from "react";

// Cambia la URL base del backend según entorno
const BACKEND_URL =
  window.location.hostname.includes("azurestaticapps.net")
    ? `${process.env.REACT_APP_API_URL}`
    : "http://localhost:8080";

const CongresoImage = ({ 
  congreso, 
  className = "", 
  style = {},
  alt = "Logo del congreso",
  showPlaceholder = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener la URL correcta de la imagen
  const getImageUrl = () => {
    // Si hay error o no hay congreso, mostrar placeholder
    if (imageError || !congreso) {
      return "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";
    }

    // Si el congreso tiene ID, usar la ruta estándar del backend
    if (congreso.idCongreso) {
      return `${BACKEND_URL}/Congresos/fotoCongreso/${congreso.idCongreso}`;
    }

    // Placeholder por defecto
    return `${BACKEND_URL}/Congresos/fotoCongreso/${congreso.idCongreso}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const imageUrl = getImageUrl();
  const finalAlt = alt || `Logo del congreso ${congreso?.nombreCongreso || ''}`;

  return (
    <div className="position-relative d-inline-block">
      {isLoading && showPlaceholder && (
        <div 
          className={`position-absolute top-0 start-0 d-flex align-items-center justify-content-center bg-secondary ${className}`}
          style={{
            ...style,
            opacity: 0.7,
            zIndex: 1
          }}
        >
          <div className="spinner-border text-light" role="status" style={{ width: "1rem", height: "1rem" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={finalAlt}
        className={className}
        style={style}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default CongresoImage;