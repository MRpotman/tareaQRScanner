import React from "react";
import { IonChip, IonIcon, IonLabel } from "@ionic/react";
import { timeOutline } from "ionicons/icons";

interface LocationCountdownProps {
  countdown: number | null;
}

const LocationCountdown: React.FC<LocationCountdownProps> = ({ countdown }) => {
  if (countdown === null) {
    return null;
  }

  return (
    <IonChip color='warning' className='location-countdown'>
      <IonIcon icon={timeOutline} />
      <IonLabel>Location update in {countdown}s</IonLabel>
    </IonChip>
  );
};

export default LocationCountdown;
