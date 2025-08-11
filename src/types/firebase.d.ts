declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
  }
  export function getAuth(app?: any): any;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
}

declare module 'firebase/firestore' {
  export interface DocumentData {
    [key: string]: any;
  }
  export function doc(firestore: any, path: string, ...pathSegments: string[]): any;
  export function setDoc(reference: any, data: any, options?: any): Promise<void>;
  export function getDoc(reference: any): Promise<any>;
}