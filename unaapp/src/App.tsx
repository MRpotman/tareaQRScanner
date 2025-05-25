import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  homeOutline,
  personOutline,
  notificationsOutline,
  cameraOutline,
  imagesOutline,
  mapOutline,
} from "ionicons/icons"; 
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

import Login from "./pages/security/login";

import { useAuth } from "./contexts/authContext";
import { MenuLoggedIn } from "./components/Menu/private";
import { MenuLoggedOut } from "./components/Menu/public";
import Home from "./pages/Home";

import Notificaciones from "./pages/Notificaciones";
import Perfil from "./pages/Perfil";
import PrivateRoute from "./routers/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";
import LocationTracker from "./pages/LocationTracker";
import Mapa from "./pages/Mapa";
import CapturaFotoPage from "./components/capturarFotos/CapturaFoto";
import GaleriaFotosPage from "./components/capturarFotos/GaleriaFotosPage";
import FirebaseStatus from "./components/cargarServicio";
import Acelerometro from "./components/acelerometro";
import BarCode from "./components/barCode/barCode";
import QRGenerator from "./components/qr/QRCodeCameraSim";
import GaleriaQRPage from "./components/qr/GaleriaQR";
import QRScanner from "./components/qr/QRScanner";
setupIonicReact();

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home" component={Home} />
            <PrivateRoute exact path="/perfil" allowedRoles={["admin", "user"]} component={Perfil} />
            <PrivateRoute exact path="/notificaciones" allowedRoles={["admin"]} component={Notificaciones} />
            <PrivateRoute exact path="/capturafotopage" allowedRoles={["admin", "user"]} component={CapturaFotoPage} />
            <Route exact path="/location" component={LocationTracker} />
            <Route exact path="/mapa" component={Mapa} />
            <Route exact path="/" render={() => <Redirect to="/home" />} />
            <Route exact path="/galeria" component={GaleriaFotosPage} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/unauthorized" component={Unauthorized} />

            <Route exact path="/capturafoto" component={CapturaFotoPage} />
            <Route exact path="/barcode" component={BarCode} />
            <Route exact path="/acelerometro" component={Acelerometro} />
            <Route exact path="/firebase" component={FirebaseStatus} />
            <Route exact path="/qr" component={QRGenerator} />
            <Route exact path="/galeriaqr" component={GaleriaQRPage} />
            <Route exact path="/scannerqr" component={QRScanner} />


          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            <IonTabButton tab="perfil" href="/perfil">
              <IonIcon icon={personOutline} />
              <IonLabel>Perfil</IonLabel>
            </IonTabButton>

            {/*{user?.rol === "admin" && (
              <IonTabButton tab="notificaciones" href="/notificaciones">
                <IonIcon icon={notificationsOutline} />
                <IonLabel>Notificaciones</IonLabel>
              </IonTabButton>
            )}*/}

            <IonTabButton tab="capturafotopage" href="/capturafotopage">
              <IonIcon icon={cameraOutline} />
              <IonLabel>Captura Foto</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="galeria" href="/galeria"> 
              <IonLabel>Galería</IonLabel>
            </IonTabButton>

            {/*<IonTabButton tab="mapa" href="/mapa">
              <IonIcon icon={mapOutline} />
              <IonLabel>Mapa</IonLabel>
            </IonTabButton>*/}
            
            <IonTabButton tab="qr" href="/qr">
              <IonIcon icon={imagesOutline} />
              <IonLabel>QR</IonLabel>
            </IonTabButton>

            <IonTabButton tab="galeriaqr" href="/galeriaqr">
              <IonIcon icon={imagesOutline} />
              <IonLabel>Galería QR</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="scannerqr" href="/scannerqr">
              <IonIcon icon={cameraOutline} />
              <IonLabel>Escanear QR</IonLabel>
            </IonTabButton>


            {/* Puedes agregar más IonTabButton aquí para otros módulos */}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
