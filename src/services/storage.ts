import {
    getStorage,
    ref,
    uploadBytes,
    deleteObject,
    uploadBytesResumable,
    getDownloadURL 
} from "firebase/storage";

import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    deleteUser,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

import axios from "axios";
import { getToken } from "./authorize";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Initial Cloud Storage
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASURE_ID
}
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
});

// Upload File Function
export const uploadFile = async(file:File, path:string, fileName:string) => {
    try {
        if (!file || !path.trim() || !fileName.trim()) return false;
        if (!auth.currentUser) return false;
        if (await verifyUser()) {
            const metadata = {
                customMetadata: {
                    uploadBy: auth.currentUser?.uid
                }
            }
            const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}/${fileName}`);
            await uploadBytes(fileRef, file, metadata);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Fetch File
export const fetchFileFromStorage = async(path:string) => {
    try {
        if (!auth.currentUser) return "";
        if (await verifyUser()) {
            const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}`);
            const url = await getDownloadURL(fileRef);
            return url;
        }
        return "";
    } catch (error) {
        return "";
    }
}

export const fetchFileFromStorageClient = async(path:string) => {
    try {
        const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}`);
        console.log("fileRef", fileRef)
        const url = await getDownloadURL(fileRef);
        console.log("urlFirebase", url)
        return url;
    
    } catch (error) {
        console.log("Error fetching file from storage:", error);
        return "";
    }
}

// Upload File And See Progress
export const uploadFileWithProgress = async(file: File, path: string, fileName:string, onProgress:(progress:number) => void) => {
    if (!auth.currentUser) return false;
    if (!file || !path.trim() || !fileName.trim()) return false;
    if (await verifyUser()) {
        const metadata = {
            customMetadata: {
                uploadBy: auth.currentUser?.uid
            }
        }
        const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}/${fileName}`);
        const uploadTask = uploadBytesResumable(fileRef, file, metadata);
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    resolve(true);
                }
            );
        });
    }
    return false;
}

export const checkAuthFromFirebase = () => {
    try {
        if (auth.currentUser) return true;
        return false;
    } catch (error) {
        return false;
    }
}

// Delete File
export const deleteFile = async(paths:string[]) => {
    try {
        if (!auth.currentUser) return false;
        if (await verifyUser()) {
            if (paths.length === 0) return false;
            const deletePromises = paths.map((path:string) => {
                const fileRef = ref(storage, `${import.meta.env.VITE_FIREBASE_PATH}${path}`);
                return deleteObject(fileRef);
            });
            await Promise.all(deletePromises);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

export const verifyUser = async() => {
    try {
        const token = getToken();
        if (!token) return false;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/getRoleByUser`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.data.data !== null) {
            const data = response.data.data;
            if (data.role_ids && data.role_ids.length > 0) {
                const roles = data.role_ids.map((role:{_id:string, role_name:string}) => role.role_name);
                console.log(roles,"get role")
                const hasRole = ["Student", "Admin", "Tutor"].some(role => roles.includes(role));
                if (hasRole) return true;
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}

export const registerFirebase = async(email:string, password:string) => {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Register successfully. " + credential.user);
        return true;
    } catch (error) {
        console.log("Register failed.");
        return false;
    }
}

export const loginFirebase = async(email:string, password:string) => {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successfully. " + credential.user);
        return true;
    } catch (error) {
        console.log("Login failed.");
        return false;
    }
}


// ใช้ได้กับแค่ auth ของตัวเอง
export const updateEmailFirebase = async(newEmail:string) => {
    try {
        if (!auth.currentUser || !auth.currentUser.email) return false;
        await updateEmail(auth.currentUser, newEmail);
        console.log("Update email successfully.");
        return true;
    } catch (error) {
        console.log("Update email failed.");
        return false;
    }
}

export const updateUserFromFirebase = async(newEmail:string, currentPassword:string, newPassword:string) => {
    try {
        if (!auth.currentUser || !auth.currentUser.email) return false;
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, newEmail);
        await updatePassword(auth.currentUser, newPassword);
        console.log("Update user successfully.");
        return true;
    } catch (error) {
        console.log("Update user failed.");
        return false;
    }
}

export const logoutFirebase = async() => {
    try {
        await signOut(auth);
        console.log("Logout successfully.");
        return true;
    } catch (error) {
        console.log("Logout failed.");
        return false;
    }
}

export const deleteUserFromFirebase = async() => {
    try {
        if (!auth.currentUser) return false;
        await deleteUser(auth.currentUser);
        console.log("Delete user successfully.");
        return true;
    } catch (error) {
        console.log("Delete user failed.");
        return false;
    }
}