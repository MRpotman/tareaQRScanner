import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText
} from "@ionic/react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner: React.FC = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState<boolean | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      if (!scannerRef.current) return;

      const qrCodeScanner = new Html5Qrcode("reader");
      html5QrCodeRef.current = qrCodeScanner;

      try {
        await qrCodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          (decodedText) => {
            setScannedData(decodedText);

            try {
              const dataObj = JSON.parse(decodedText);
              if (dataObj.timestamp && dataObj.selectedInterval) {
                const expirationTime = dataObj.timestamp + dataObj.selectedInterval * 1000;
                const now = Date.now();
                setIsExpired(now > expirationTime);
              } else {
                setIsExpired(null); // No hay info de expiración
              }
            } catch (e) {
              setIsExpired(null); // No es JSON o mal formato
            }

            qrCodeScanner.stop(); // Para luego de escanear
          },
          (error) => {
            // Error de escaneo, puedes ignorar o loguear
          }
        );
      } catch (err) {
        console.error("Error iniciando el escáner:", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
        });
      }
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Escanear QR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div id="reader" ref={scannerRef} style={{ width: "100%", height: "300px" }}></div>

        {scannedData && (
          <div style={{ marginTop: "20px" }}>
            <IonText color="primary">
              <p>📦 Datos escaneados:</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>{scannedData}</pre>
            </IonText>

            {isExpired !== null && (
              <IonText color={isExpired ? "danger" : "success"}>
                <p>{isExpired ? "⚠️ Este QR está vencido." : "✅ Este QR es válido."}</p>
              </IonText>
            )}
          </div>
        )}

        <IonButton expand="block" onClick={() => window.location.reload()}>
          Escanear otro QR
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default QRScanner;
