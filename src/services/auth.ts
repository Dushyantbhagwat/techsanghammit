import { User, UserCredentials } from '../types/user';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signOut,
  User as AuthUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  DocumentData
} from 'firebase/firestore';
import { emailService } from './email';

const convertToUser = async (firebaseUser: AuthUser): Promise<User> => {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data() as DocumentData | undefined;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: userData?.displayName,
    userName: userData?.userName,
    preferences: userData?.preferences || { notifications: true },
    createdAt: userData?.createdAt ? new Date(userData.createdAt) : new Date()
  };
};

export const authService = {
  async signup({ email, password }: UserCredentials): Promise<User> {
    try {
      // Validate email and password
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        preferences: { notifications: true },
        createdAt: new Date().toISOString()
      });
      
      // Send welcome email
      await emailService.sendWelcomeEmail(email);

      return await convertToUser(firebaseUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login({ email, password }: UserCredentials): Promise<User> {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return await convertToUser(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await convertToUser(currentUser);
  },

  async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
  ): Promise<User> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, updates, { merge: true });
      
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');
      
      return await convertToUser(currentUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
};