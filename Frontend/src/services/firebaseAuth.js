import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { config } from '../utils/config';

export class FirebaseAuthService {
  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      config.debug('Google sign-in successful:', user.email);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          provider: 'google'
        },
        idToken: await user.getIdToken()
      };
    } catch (error) {
      config.debug('Google sign-in error:', error);
      
      let message = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          message = 'Sign-in cancelled';
          break;
        case 'auth/popup-blocked':
          message = 'Popup blocked. Please allow popups for this site';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Sign-in cancelled';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection';
          break;
        default:
          message = error.message || 'Failed to sign in with Google';
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  // Sign in with email and password
  static async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      config.debug('Email sign-in successful:', user.email);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          provider: 'email'
        },
        idToken: await user.getIdToken()
      };
    } catch (error) {
      config.debug('Email sign-in error:', error);
      
      let message = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        default:
          message = error.message || 'Failed to sign in';
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  // Create account with email and password
  static async createAccount(email, password, name) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update the user's display name
      if (name) {
        await updateProfile(user, {
          displayName: name
        });
      }
      
      config.debug('Account creation successful:', user.email);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: name || user.displayName,
          avatar: user.photoURL,
          provider: 'email'
        },
        idToken: await user.getIdToken()
      };
    } catch (error) {
      config.debug('Account creation error:', error);
      
      let message = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        default:
          message = error.message || 'Failed to create account';
      }
      
      return {
        success: false,
        error: message
      };
    }
  }

  // Sign out
  static async signOut() {
    try {
      await signOut(auth);
      config.debug('Sign-out successful');
      
      return {
        success: true
      };
    } catch (error) {
      config.debug('Sign-out error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get ID token for current user
  static async getCurrentUserToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

export default FirebaseAuthService;
