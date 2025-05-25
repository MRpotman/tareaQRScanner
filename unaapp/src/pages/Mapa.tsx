import MapaComercios from "../components/location/MapaCanchas"; 
import AppHeader from "../components/head/AppHeader";
import {   IonPage   } from "@ionic/react";
 

const Mapa: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title='Mapa' showMenuButton={true} /> 
      <h1>Mapa</h1> 
        <MapaComercios /> 
    </IonPage>
  );
};

export default Mapa;
