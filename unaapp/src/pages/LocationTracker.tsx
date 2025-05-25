import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import LocationTrackerComponent from "../components/location/locationTracker";
import "../theme/location/tracker.css";

const LocationTracker: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Location Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Location Tracker</IonTitle>
          </IonToolbar>
        </IonHeader>
        <LocationTrackerComponent />
      </IonContent>
    </IonPage>
  );
};

export default LocationTracker;
