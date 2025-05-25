import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import TopicSubscription from "../components/notification/TopicSubscription";

const Notificaciones: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Suscribir a Tema</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Suscribir a Tema</IonTitle>
          </IonToolbar>
        </IonHeader>
        <TopicSubscription />
      </IonContent>
    </IonPage>
  );
};

export default Notificaciones;
