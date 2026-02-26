// Import the functions you need from the SDKs
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
  getDoc,
  collection,
  query,
  onSnapshot,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Google Sign In function
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Auto create or update user in Firestore silently
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'student',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return result;
};

// FOLLOW / UNFOLLOW
export const toggleFollow = async (brandId: string, userId: string, brandOwnerId: string) => {
  if (userId === brandOwnerId) throw new Error("Cannot follow your own brand");

  const brandRef = doc(db, 'brands', brandId);

  await runTransaction(db, async (transaction) => {
    const brandDoc = await transaction.get(brandRef);
    if (!brandDoc.exists()) throw new Error("Brand not found");

    const data = brandDoc.data();
    // Ensure followers is always an array, initializing as empty array if it doesn't exist
    const followers: string[] = Array.isArray(data.followers) ? data.followers : [];
    const isFollowing = followers.includes(userId);

    if (isFollowing) {
      transaction.update(brandRef, {
        followers: arrayRemove(userId),
        followerCount: increment(-1)
      });
    } else {
      transaction.update(brandRef, {
        followers: arrayUnion(userId),
        followerCount: increment(1)
      });
    }
  });
};

// LIKE / UNLIKE
export const toggleLike = async (brandId: string, userId: string, brandOwnerId: string) => {
  if (userId === brandOwnerId) {
    throw new Error("You cannot like your own brand");
  }

  const brandRef = doc(db, "brands", brandId);

  await runTransaction(db, async (transaction) => {
    const brandDoc = await transaction.get(brandRef);

    if (!brandDoc.exists()) {
      throw new Error("Brand does not exist");
    }

    const data = brandDoc.data();
    const likes = Array.isArray(data.likes) ? data.likes : [];
    const isLiked = likes.includes(userId);

    if (isLiked) {
      transaction.update(brandRef, {
        likes: arrayRemove(userId),
        likeCount: increment(-1)
      });
    } else {
      transaction.update(brandRef, {
        likes: arrayUnion(userId),
        likeCount: increment(1)
      });
    }
  });
};