import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import AppHeader from "../components/head/AppHeader";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

// Menú lateral
const MyMenu = () => {
  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Módulos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem routerLink="/capturafoto" routerDirection="forward">
            <IonLabel>Captura Foto</IonLabel>
          </IonItem>
          <IonItem routerLink="/barcode" routerDirection="forward">
            <IonLabel>BarCode</IonLabel>
          </IonItem>
          <IonItem routerLink="/acelerometro" routerDirection="forward">
            <IonLabel>Acelerómetro</IonLabel>
          </IonItem>
          <IonItem routerLink="/firebase" routerDirection="forward">
            <IonLabel>Firebase Status</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

// Página principal
const Home: React.FC = () => {
  return (
    <>
      <MyMenu />
      <IonPage id="main-content">
        <AppHeader title="Home - Notificaciones" showMenuButton={true} />
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Home</IonTitle>
            </IonToolbar>
          </IonHeader>
          <div style={{ padding: 16 }}>
            <h1>Bienvenido al Home</h1>
            <p>Este es el contenido principal.</p>
          </div>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Home;
