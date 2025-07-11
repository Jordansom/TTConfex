import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const BACKEND_URL =
  window.location.hostname.includes("azurestaticapps.net")
    ? `${process.env.REACT_APP_API_URL}`
    : "http://localhost:8080";
    
Font.register({
  family: "Monterey",
  src: require("../../assets/fonts/MontereyFLF.ttf"),
});
Font.register({
  family: "Jura",
  src: require("../../assets/fonts/Jura-Regular.ttf"),
  fontWeight: "normal",
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 0,
    fontFamily: "Jura",
  },
  borderWrapper: {
    border: "3px solid #B8860B",
    margin: 10,
    padding: 10,
    minHeight: "95%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Monterey",
    color: "#B8860B",
    fontSize: 16,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 15,
    marginTop: 6,
  },
  row: { flexDirection: "row", marginBottom: 20 },
  profileImgWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2,
    border: "3px solid #B8860B",
    backgroundColor: "#fff",
    boxShadow: "0 0 6px rgba(184,134,11,0.5)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 35,
    objectFit: "contain",
  },
  info: {
    flexGrow: 1,
    justifyContent: "center",
    maxWidth: 160,
  },
  infoText: {
    fontFamily: "Jura",
    fontSize: 12,
    color: "#000",
    marginBottom: 4,
    wordBreak: "break-all",
    maxWidth: 160,
    wrap: true,
  },
  qrWrapper: {
    alignSelf: "center",
    marginTop: 10,
    padding: 6,
    border: "3px solid #B8860B",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 0 6px rgba(184,134,11,0.5)",
  },
  qr: {
    width: 120,
    height: 120,
    objectFit: "contain",
  },
});

const ROLES = [
  { key: "administrador", label: "Administrador" },
  { key: "organizador", label: "Organizador" },
  { key: "evaluador", label: "Evaluador" },
  { key: "conferencista", label: "Conferencista" },
  { key: "ponente", label: "Ponente" },
  { key: "registrador", label: "Registrador" },
];

// Función para convertir imagen a base64
const convertImageToBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
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

const GafetePDF = ({
  user,
  qrCodeDataUrl,
  congresoNombre,
  congresoLogoUrl,
  watermarkType,
  rol,
  congreso,
  fotoPerfilBase64, // Nueva prop para recibir la imagen ya convertida
}) => {
  console.log("🎫 GafetePDF props:", {
    user: {
      idUsuario: user?.idUsuario,
      fotoUsuarioUrl: user?.fotoUsuarioUrl,
    },
    qrCodeDataUrl: qrCodeDataUrl?.substring(0, 50) + "...",
    congresoLogoUrl,
    fotoPerfilBase64: fotoPerfilBase64?.substring(0, 50) + "...",
  });

  // Usar la imagen pasada como prop o una imagen por defecto
  const fotoPerfilSrc = fotoPerfilBase64 || 
    "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";

  // Si se pasa el rol explícitamente, úsalo, si no, usa los roles del usuario
  const userRoles = rol
    ? [rol.charAt(0).toUpperCase() + rol.slice(1)]
    : ROLES.filter((r) => user[r.key]).map((r) => r.label);

  // QR: si es base64, úsalo; si es texto, genera base64 QR (solo si es necesario)
  let qrSrc = qrCodeDataUrl;
  if (
    qrCodeDataUrl &&
    !qrCodeDataUrl.startsWith("data:image") &&
    !qrCodeDataUrl.startsWith("http")
  ) {
    qrSrc = undefined;
  }

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
          fixed
        >
          {/* Marca de agua: imagen del congreso */}
          <Image
            src={fotoPerfilSrc}
            style={{
              width: "80%",
              height: "80%",
              opacity: 0.08,
              position: "absolute",
              left: "10%",
              top: "10%",
              objectFit: "contain",
            }}
          />
        </View>
        <View style={styles.borderWrapper}>
          <Text style={styles.title}>GAFETE DE IDENTIFICACIÓN</Text>
          <Text
            style={{
              ...styles.title,
              fontSize: 12,
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            {congresoNombre}
          </Text>
          <View style={styles.row}>
            <View style={styles.profileImgWrapper}>
              {/* Foto del congreso como imagen de perfil */}
              <Image style={styles.profileImg} src={fotoPerfilSrc} />
            </View>
            <View style={styles.info}>
              <Text style={styles.infoText}>
                Nombre: {user.nombre} {user.apellidoPaterno}{" "}
                {user.apellidoMaterno}
              </Text>
              <Text style={styles.infoText}>Correo: {user.correo}</Text>
              <Text style={styles.infoText}>
                Tel: {user.telefono ? user.telefono : "Sin teléfono"}
              </Text>
              <Text style={styles.infoText}>
                Roles: {rol ? rol : "Asistente"}
              </Text>
            </View>
          </View>
          <View style={styles.qrWrapper}>
            {qrCodeDataUrl ? (
              <Image style={styles.qr} src={qrCodeDataUrl} />
            ) : (
              <Text style={{ fontSize: 10, color: "#B8860B" }}>
                QR no disponible
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default GafetePDF;