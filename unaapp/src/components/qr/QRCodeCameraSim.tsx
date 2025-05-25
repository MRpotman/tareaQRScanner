import React, { useState, useRef, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonAlert,
  IonText,
} from "@ionic/react";
import { QRCodeCanvas } from "qrcode.react";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { app, auth } from '../../Services/firebase/config/firebaseConfig';
import { onAuthStateChanged, User } from "firebase/auth";

const intervalOptions = [
  { label: "20 segundos", value: 20 },
  { label: "1 minuto", value: 60 },
  { label: "5 minutos", value: 300 },
  { label: "15 minutos", value: 900 },
  { label: "25 minutos", value: 1500 },
];

const QRGenerator: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>(60);
  const [alert, setAlert] = useState({ isOpen: false, header: "", message: "" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Solo genera el QR si hay usuario
  const generarTextoQR = () => {
    if (!user) return "";
    const timestamp = Date.now();
    const data = {
      userId: user.uid,
      email: user.email,
      timestamp,
      selectedInterval,
    };
    return JSON.stringify(data);
  };

  const guardarQREnFirebase = async () => {
    const canvas = qrRef.current;
    if (!canvas) {
      setAlert({ isOpen: true, header: "Error", message: "No se pudo acceder al QR." });
      return;
    }
    if (!user) {
      setAlert({ isOpen: true, header: "Error", message: "Usuario no autenticado." });
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const fileName = `qr_codes/qr_${Date.now()}.png`;
      const storageRef = ref(storage, fileName);

      await uploadString(storageRef, dataUrl, "data_url");
      const url = await getDownloadURL(storageRef);

      setDownloadUrl(url);
      setAlert({ isOpen: true, header: "Éxito", message: "QR guardado en Firebase Storage." });
      console.log("QR guardado, URL:", url);
    } catch (error) {
      console.error("Error guardando QR en Firebase:", error);
      setAlert({ isOpen: true, header: "Error", message: "No se pudo guardar el QR en Firebase." });
    }
  };

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Generador de Código QR</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>
            <p>Debes iniciar sesión para generar un código QR.</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Generador de Código QR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Validez del QR</IonLabel>
          <IonSelect
            value={selectedInterval}
            placeholder="Seleccione intervalo de validez"
            onIonChange={(e) => setSelectedInterval(e.detail.value)}
          >
            {intervalOptions.map((opt) => (
              <IonSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <QRCodeCanvas value={generarTextoQR()} size={200} ref={qrRef} />
        </div>

        <IonButton expand="block" onClick={guardarQREnFirebase} style={{ marginTop: 20 }}>
          Guardar QR en Firebase
        </IonButton>

        {downloadUrl && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p>URL del QR:</p>
            <a href={downloadUrl} target="_blank" rel="noreferrer">
              {downloadUrl}
            </a>
            <br />
            <img src={downloadUrl} alt="QR Code" style={{ marginTop: 10, maxWidth: 200 }} />
          </div>
        )}

        <IonAlert
          isOpen={alert.isOpen}
          onDidDismiss={() => setAlert({ ...alert, isOpen: false })}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default QRGenerator;
