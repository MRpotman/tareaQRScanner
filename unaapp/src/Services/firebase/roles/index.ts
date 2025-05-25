import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { roluser } from "../../../models/roluser";

export const fetchUserRoles = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn(`No se encontró el usuario con UID: ${uid}`);
      return [];
    }

    const userData = userDocSnap.data();
    const rolesList: roluser[] = [];

    // Asumiendo que solo hay un rol por usuario y lo guardas directamente como string
    if (userData?.rol) {
      rolesList.push({
        id: uid, // El UID del usuario
        userId: uid, // El UID del usuario
        rol: userData.rol,
      } as roluser);
    }

    return rolesList;
  } catch (error: any) {
    console.error("Error fetching user roles: ", error);
    return [];
  }
};

export const fetchUserRole = async (uid: string): Promise<roluser | null> => {
  if (!uid) {
    throw new Error("UID no proporcionado");
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn(`No se encontró el usuario con UID: ${uid}`);
      return null;
    }

    const userData = userDocSnap.data();

    if (userData?.rol) {
      const rolUsuario: roluser = {
        id: uid, 
        userId: uid, 
        rol: userData.rol || "user",
      };
      return rolUsuario;
    } else {
      return {
        id: uid,
        userId: uid,
        rol: "user", 
      } as roluser;
    }
  } catch (error: any) {
    console.error("Error fetching user role: ", error);
    return null;
  }
};