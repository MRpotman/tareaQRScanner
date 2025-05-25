import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonLoading,
  IonText,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
} from '@ionic/react';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { app } from '../../Services/firebase/config/firebaseConfig';

const GaleriaQRPage: React.FC = () => {
  const [qrUrls, setQrUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchQRImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const storage = getStorage(app);
        const qrFolderRef = ref(storage, 'qr_codes');
        const res = await listAll(qrFolderRef);
        const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
        setQrUrls(urls);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los códigos QR.');
      } finally {
        setLoading(false);
      }
    };

    fetchQRImages();
  }, []);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Galería de Códigos QR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading && <IonLoading isOpen={loading} message="Cargando códigos QR..." />}
        {error && <IonText color="danger">{error}</IonText>}
        {!loading && !error && qrUrls.length === 0 && <IonText>No hay códigos QR para mostrar.</IonText>}

        <IonGrid>
          <IonRow>
            {qrUrls.map((url, i) => (
              <IonCol size="6" key={i}>
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                  }}
                >
                  <IonImg
                    src={url}
                    alt={`QR code ${i + 1}`}
                    onClick={() => handleImageClick(url)}
                    style={{
                      cursor: 'pointer',
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto 10px auto',
                    }}
                  />
                  <IonText>
                    <p
                      style={{
                        fontSize: '0.8em',
                        wordBreak: 'break-all',
                        marginBottom: '5px',
                      }}
                    >
                      URL: <a href={url} target="_blank" rel="noreferrer">{url}</a>
                    </p>
                  </IonText>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Vista Ampliada</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedImage && (
              <IonImg
                src={selectedImage}
                style={{ width: '100%', height: 'auto' }}
              />
            )}
            <IonButton expand="block" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default GaleriaQRPage;
