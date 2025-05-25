import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonImg,
  IonProgressBar,
  IonSpinner,
  IonAlert,
  IonItem,
  IonLabel,
  IonButtons,
  IonFooter,
  IonNote,
} from '@ionic/react';
import {
  camera,
  cloudUploadOutline,
  checkmarkCircleOutline,
  warningOutline,
  refreshOutline,
  imageOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { app, storage, model } from '../../Services/firebase/config/firebaseConfig'; // Importa el modelo de Vertex AI
// NUEVO: Imports para Filesystem
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
// Definir tipo para alertInfo
interface AlertInfo {
  isOpen: boolean;
  header?: string;
  message: string;
  buttons?: Array<string | { text: string; handler?: () => void; role?: string; cssClass?: string }>;
}

interface AnalysisResult {
  isRecyclable: boolean;
  category?: 'orgánico' | 'plástico' | 'aluminio';
  reason?: string;
}

const CapturaFotoPage: React.FC = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [lastDownloadURL, setLastDownloadURL] = useState<string | null>(null);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ isOpen: false, message: '' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const storageInstance = useMemo(() => getStorage(app), []);
 

  const showAlert = useCallback((header: string, message: string, buttons: AlertInfo['buttons'] = ['OK']) => {
    setAlertInfo({ isOpen: true, header, message, buttons });
  }, []);

  const resetMainPhotoStates = useCallback(() => {
    setPhotoPreview(null);
    setIsTakingPhoto(false);
    setIsUploading(false);
    setUploadProgress(0);
    setLastDownloadURL(null);
    setUploadedPhotoPath(null);
    setAnalysisResult(null);
  }, []);
 

const savePhotoToDevice = async (photoDataUrl: string): Promise<string | null> => {
    if (!photoDataUrl) {
        console.error('No se proporcionó photoDataUrl para guardar.');
        showAlert('Error Interno', 'No hay datos de imagen para guardar.');
        return null;
    }

    try { 
        const fileName = `photo_${new Date().getTime()}.jpeg`;
        const folderName = 'mis_fotos_app';  
        try {
            await Filesystem.mkdir({
                path: folderName,
                directory: Directory.Data, 
                recursive: true,  
            });
        } catch (mkdirError: any) { 
            if (!mkdirError.message?.includes('Directory exists') && !mkdirError.message?.includes('File exists')) {
                 console.warn('No se pudo crear el directorio, puede que ya exista o haya otro error:', mkdirError);
            }
        }
 
        const savedFile = await Filesystem.writeFile({
            path: `${folderName}/${fileName}`,  
            data: photoDataUrl,
            directory: Directory.Data,  
        });

        console.log('Foto guardada en el dispositivo:', savedFile.uri);
        showAlert('Foto Guardada', `La foto se ha guardado localmente en la app.`);
        return savedFile.uri; // Retorna la URI del archivo guardado

    } catch (error) {
        console.error('Error al guardar la foto en el dispositivo:', error);
        showAlert('Error al Guardar', 'No se pudo guardar la foto en el dispositivo.');
        return null;
    }
};

  // Verificar permisos de cámara
  const checkCameraPermissions = async () => {
    try {
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.camera !== 'granted' || permissionStatus.photos !== 'granted') {
        const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        if (result.camera !== 'granted' || result.photos !== 'granted') {
          showAlert('Permisos Necesarios', 'Por favor, habilita los permisos de cámara y galería.');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      showAlert('Error de Permisos', 'No se pudieron verificar los permisos.');
      return false;
    }
  };

  const handleTakePhoto = async () => {
    const hasPermissions = await checkCameraPermissions();
    if (!hasPermissions) return;

    resetMainPhotoStates();
    setIsTakingPhoto(true);

    try {
      const image: Photo = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Origen de la foto',
        promptLabelPhoto: 'Galería',
        promptLabelPicture: 'Cámara',
        saveToGallery: false,
      });

      if (image.dataUrl && image.dataUrl.startsWith('data:image/')) {
        setPhotoPreview(image.dataUrl);

        const savedUri = await savePhotoToDevice(image.dataUrl);
            if (savedUri) { 
                console.log('URI del archivo guardado localmente:', savedUri);
            }
      } else {
        throw new Error('Formato de imagen inválido o no se obtuvo dataUrl');
      }
    } catch (error: any) {
      console.error('Error al tomar/seleccionar foto:', error);
      if (!error.message?.toLowerCase().includes('cancelled')) {
        showAlert('Error de Cámara', 'No se pudo acceder a la cámara o galería.');
      }
    } finally {
      setIsTakingPhoto(false);
    }
  };

  

  const handleUploadPhoto = async () => {
    if (!photoPreview) {
      showAlert('Sin Foto', 'Por favor, toma o selecciona una foto primero.');
      return;
    }
    if (isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setLastDownloadURL(null);
    setUploadedPhotoPath(null);

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fileName = `imagenes/photo_${uniqueId}.jpg`;
    const storageRef = ref(storageInstance, fileName);

    try {
      setUploadProgress(50);
      await uploadString(storageRef, photoPreview, 'data_url');
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(storageRef);
      console.log('URL de descarga de Firebase:', downloadURL);
      if (downloadURL.startsWith('https://firebasestorage.googleapis.com/')) {
        setLastDownloadURL(downloadURL);
        setUploadedPhotoPath(fileName);
        showAlert('¡Éxito!', 'La foto ha sido subida correctamente.');        
      } else {
        throw new Error('URL de descarga inválida');
      }
    } catch (error: any) {
      console.error('Error en la subida:', error);
      showAlert('Error', `Ocurrió un error: ${error.message || 'Error desconocido'}.`);
      setLastDownloadURL(null);
    } finally {
      console.log('Finalizando handleUploadPhoto - isUploading se establecerá en false');
      setIsUploading(false);
    }
  };

  const handleDeleteUploadedPhoto = async () => {
    if (!uploadedPhotoPath) {
      showAlert('Información', 'No hay foto subida para borrar.');
      return;
    }

    const confirmDelete = () => {
      const photoRef = ref(storageInstance, uploadedPhotoPath);
      deleteObject(photoRef)
        .then(() => {
          showAlert('Borrado', 'La foto ha sido eliminada de Firebase.');
          resetMainPhotoStates();
        })
        .catch((error) => {
          console.error('Error borrando foto:', error);
          showAlert('Error al Borrar', `No se pudo eliminar: ${error.code}`);
        });
    };

    showAlert('Confirmar Borrado', '¿Eliminar la foto subida?', [
      { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
      { text: 'Eliminar', handler: confirmDelete, cssClass: 'alert-button-danger' },
    ]);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Cámara y Firebase</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div
          style={{
            marginBottom: '1rem',
            border: '1px dashed var(--ion-color-medium)',
            minHeight: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--ion-color-light-tint)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {photoPreview ? (
            <IonImg
              src={photoPreview}
              style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain' }}
              onIonError={(e) => {
                console.error('Error al cargar previsualización:', e);
                showAlert('Error de Previsualización', 'No se pudo mostrar la imagen.');
                setPhotoPreview(null);
              }}
            />
          ) : (
            <IonIcon icon={imageOutline} style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }} />
          )}
        </div>

        {isUploading && (
          <div style={{ marginBottom: '1rem' }}>
            <IonProgressBar value={uploadProgress / 100} color="secondary" />
            <IonLabel color="medium" style={{ textAlign: 'center', display: 'block', marginTop: '0.25rem' }}>
              Subiendo: {uploadProgress.toFixed(0)}%
            </IonLabel>
          </div>
        )}

        {isTakingPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1rem 0' }}>
            <IonSpinner name="crescent" color="primary" />
            <IonLabel color="medium" style={{ marginLeft: '0.5rem' }}>Procesando...</IonLabel>
          </div>
        )}

        {lastDownloadURL && !isUploading && analysisResult && (
          <IonItem lines="none" color="light" style={{ marginTop: '1rem', borderRadius: '8px' }}>
            <IonIcon icon={checkmarkCircleOutline} slot="start" color="success" />
            <IonLabel>
              <p>¡Foto Subida!</p>
              <IonNote>
                <a href={lastDownloadURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ion-color-primary)', textDecoration: 'underline' }}>
                  Ver Foto
                </a>
              </IonNote> 
            </IonLabel>
            {uploadedPhotoPath && (
              <IonButton slot="end" fill="clear" color="danger" onClick={handleDeleteUploadedPhoto} disabled={isUploading}>
                <IonIcon icon={closeCircleOutline} />
              </IonButton>
            )}
          </IonItem>
        )}

        <IonAlert
          isOpen={alertInfo.isOpen}
          header={alertInfo.header}
          message={alertInfo.message}
          buttons={alertInfo.buttons || ['OK']}
          onDidDismiss={() => setAlertInfo({ isOpen: false, message: '' })}
        />
      </IonContent>

      <IonFooter style={{ borderTop: '1px solid var(--ion-color-step-150, #e0e0e0)' }}>
        <IonToolbar>
          {photoPreview && !isUploading && !isTakingPhoto ? (
            <IonButtons style={{ width: '100%', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0' }}>
              <IonButton onClick={handleTakePhoto} fill="outline" color="medium" disabled={isTakingPhoto || isUploading}>
                <IonIcon slot="start" icon={refreshOutline} />
                Otra Foto
              </IonButton>
              <IonButton onClick={handleUploadPhoto} fill="solid" color="success" disabled={isUploading}>
                <IonIcon slot="start" icon={cloudUploadOutline} />
                Subir
              </IonButton>
            </IonButtons>
          ) : !isUploading && !isTakingPhoto ? (
            <IonButton style={{ margin: '0.5rem' }} expand="full" onClick={handleTakePhoto} disabled={isTakingPhoto || isUploading}>
              <IonIcon slot="start" icon={camera} />
              Tomar o Seleccionar Foto
            </IonButton>
          ) : null}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default CapturaFotoPage;