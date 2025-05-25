import React, { useState, useEffect, useCallback } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonLoading,
    IonAlert,
    IonButton,
    IonIcon,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonModal,
    IonList,
    IonItem,
    IonButtons
} from '@ionic/react';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../../Services/firebase/config/firebaseConfig';
import { trashOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { useIonViewWillEnter } from '@ionic/react';

interface ImageData {
    url: string;
    ref: string;
    category: string;
    id: string;
}

const CATEGORIES = [
    "Trabajo",
    "Personal",
    "Paisajes",
    "Mascotas",
    "Familia",
    "Vacaciones",
    "Comida",
    "Otro"
];

const GaleriaFotosPage: React.FC = () => {
    const [imagesData, setImagesData] = useState<ImageData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [storageInstance] = useState(getStorage(app));
    const [firestoreInstance] = useState(getFirestore(app));
    const [imagesFolderRef] = useState(ref(storageInstance, 'imagenes'));
    const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; header?: string; message: string; buttons: any[] }>({ isOpen: false, message: '', buttons: ['OK'] });
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [categoryInput, setCategoryInput] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showAlert = (header: string, message: string, buttons: any[] = ['OK']) => {
        setAlertInfo({ isOpen: true, header, message, buttons });
    };

    const getImageCategory = useCallback(async (imageId: string): Promise<string> => {
        try {
            const imageDocRef = doc(firestoreInstance, 'images', imageId);
            const docSnap = await getDoc(imageDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data?.category || '';
            } else {
                return '';
            }
        } catch (error) {
            console.error("Error al obtener la categoría de la imagen:", error);
            return '';
        }
    }, [firestoreInstance]);

    const fetchImages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await listAll(imagesFolderRef);
            const imageDataPromises = result.items.map(async (imageRef) => {
                const url = await getDownloadURL(imageRef);
                const id = imageRef.name;
                const category = await getImageCategory(id);
                return { url, ref: imageRef.fullPath, category, id };
            });
            const imageData = await Promise.all(imageDataPromises);
            setImagesData(imageData);
        } catch (e: any) {
            console.error('Error al cargar imágenes:', e);
            setError('No se pudieron cargar las imágenes de la galería.');
        } finally {
            setIsLoading(false);
        }
    }, [imagesFolderRef, getImageCategory]);

    // Usamos useIonViewWillEnter para cargar las imágenes cada vez que se visita la página
    useIonViewWillEnter(() => {
        fetchImages();
    });

    const handleDeleteImage = async (imageId: string, imageRef: string) => {
        showAlert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres eliminar esta imagen?',
            [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar', handler: async () => {
                        try {
                            const storageRefToDelete = ref(storageInstance, imageRef);
                            await deleteObject(storageRefToDelete);

                            const imageDocRef = doc(firestoreInstance, 'images', imageId);
                            await deleteDoc(imageDocRef);

                            setImagesData(prevImages => prevImages.filter(img => img.id !== imageId));
                            showAlert('Éxito', 'La imagen ha sido eliminada correctamente.');
                        } catch (error: any) {
                            console.error('Error al eliminar imagen:', error);
                            showAlert('Error', 'No se pudo eliminar la imagen.');
                        }
                    }
                },
            ]
        );
    };

    const handleCategoryChange = async (imageId: string, newCategory: string) => {
        try {
            const imageDocRef = doc(firestoreInstance, 'images', imageId);
            await setDoc(imageDocRef, { category: newCategory }, { merge: true });

            setImagesData(prevImages =>
                prevImages.map(img =>
                    img.id === imageId ? { ...img, category: newCategory } : img
                )
            );
            showAlert('Categoría Actualizada', 'La categoría de la imagen ha sido actualizada.');
        } catch (error: any) {
            console.error('Error al actualizar categoría:', error);
            showAlert('Error', 'No se pudo actualizar la categoría.');
        }
    };

    const openCategoryModal = (image: ImageData) => {
        setSelectedImage(image);
        setCategoryInput(image.category);
        setIsModalOpen(true);
    };

    const handleSaveCategory = async () => {
        if (selectedImage) {
            await handleCategoryChange(selectedImage.id, categoryInput);
        }
        setIsModalOpen(false);
        setSelectedImage(null);
        setCategoryInput('');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Galería de Fotos</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {isLoading && <IonLoading message="Cargando galería..." isOpen={isLoading} />}
                {error && <IonAlert isOpen={!!error} message={error} buttons={['OK']} onDidDismiss={() => setError(null)} />}
                {!isLoading && !error && imagesData.length > 0 && (
                    <IonGrid>
                        <IonRow>
                            {imagesData.map((imageData, index) => (
                                <IonCol size="6" key={index} style={{ position: 'relative' }}>
                                    <IonImg
                                        src={imageData.url}
                                        style={{ width: '100%', height: 'auto', marginBottom: '10px', borderRadius: '8px' }}
                                        onClick={() => openCategoryModal(imageData)}
                                    />
                                    <IonButton
                                        onClick={() => handleDeleteImage(imageData.id, imageData.ref)}
                                        fill="clear"
                                        color="danger"
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            zIndex: 10,
                                        }}
                                    >
                                        <IonIcon icon={trashOutline} />
                                    </IonButton>
                                    <IonLabel
                                        style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            left: '5px',
                                            zIndex: 10,
                                            color: 'white',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                            padding: '2px 5px',
                                            borderRadius: '4px',
                                            fontSize: '0.8em',
                                        }}
                                    >
                                        Categoría: {imageData.category || 'Sin Categoría'}
                                    </IonLabel>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>
                )}
                {!isLoading && !error && imagesData.length === 0 && (
                    <p>No hay fotos en la galería.</p>
                )}
                <IonAlert
                    isOpen={alertInfo.isOpen}
                    header={alertInfo.header}
                    message={alertInfo.message}
                    buttons={alertInfo.buttons}
                    onDidDismiss={() => setAlertInfo({ isOpen: false, message: '', buttons: ['OK'] })}
                />

                <IonModal isOpen={isModalOpen} onDidDismiss={() => {
                    setIsModalOpen(false);
                    setSelectedImage(null);
                    setCategoryInput('');
                }}>
                    <IonPage>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>
                                    {selectedImage ? `Categorizar ${selectedImage.id.substring(0, 8)}` : 'Categorizar Imagen'}
                                </IonTitle>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedImage(null);
                                        setCategoryInput('');
                                    }}>
                                        <IonIcon icon={closeCircleOutline} />
                                    </IonButton>
                                </IonButtons>

                            </IonToolbar>
                        </IonHeader>
                        <IonContent className="ion-padding">
                            {selectedImage && (
                                <>
                                    <IonImg
                                        src={selectedImage.url}
                                        style={{ width: '100%', height: 'auto', marginBottom: '1rem', borderRadius: '8px' }}
                                    />
                                    <IonList>
                                        <IonItem>
                                            <IonLabel position="floating">Categoría</IonLabel>
                                            <IonSelect
                                                value={categoryInput}
                                                onIonChange={(e) => setCategoryInput(e.detail.value ?? '')}
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
                                                ))}
                                                <IonSelectOption value="otro">Otro</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                        {categoryInput === 'otro' && (
                                            <IonItem>
                                                <IonLabel position="floating">Nueva Categoría</IonLabel>
                                                <IonInput
                                                    value={categoryInput}
                                                    onIonChange={(e) => setCategoryInput(e.detail.value ?? '')}
                                                    placeholder="Ingrese nueva categoría"
                                                />
                                            </IonItem>
                                        )}
                                    </IonList>
                                    <IonButton
                                        expand="full"
                                        onClick={handleSaveCategory}
                                        style={{ marginTop: '1rem' }}
                                        disabled={!categoryInput}
                                    >
                                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                                        Guardar Categoría
                                    </IonButton>
                                </>
                            )}
                        </IonContent>
                    </IonPage>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default GaleriaFotosPage;
