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
  serverTimestamp,
  getDocs
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

export const calculateEngagementScore = (brand: any): number => {
  const likeScore = (brand.likeCount || 0) * 1;
  const followerScore = (brand.followerCount || 0) * 2;

  const completenessBonus = (
    brand.brandName &&
    brand.description &&
    brand.category &&
    brand.instagramUrl &&
    brand.facebookUrl
  ) ? 10 : 0;

  const recentActivityBonus = Math.min((brand.likeCount || 0) + (brand.followerCount || 0), 20);

  return likeScore + followerScore + completenessBonus + recentActivityBonus;
};

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
    const followers: string[] = data.followers || [];
    const isFollowing = followers.includes(userId);

    const newFollowerCount = isFollowing
      ? Math.max((data.followerCount || 0) - 1, 0)
      : (data.followerCount || 0) + 1;

    const newRecentFollows = isFollowing
      ? Math.max((data.recentFollows || 0) - 1, 0)
      : (data.recentFollows || 0) + 1;

    const newEngagementScore = calculateEngagementScore({
      ...data,
      followerCount: newFollowerCount,
      likeCount: data.likeCount || 0
    });

    const newTrendingScore =
      ((data.recentLikes || 0) * 2) +
      (newRecentFollows * 3) +
      (data.newBrandBonus || 0);

    const newReputationScore = calculateReputationScore({
      ...data,
      followerCount: newFollowerCount,
      likeCount: data.likeCount || 0,
      recentFollows: isFollowing
        ? Math.max((data.recentFollows || 0) - 1, 0)
        : (data.recentFollows || 0) + 1
    });

    transaction.update(brandRef, {
      followers: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
      followerCount: increment(isFollowing ? -1 : 1),
      recentFollows: increment(isFollowing ? -1 : 1),
      engagementScore: newEngagementScore,
      trendingScore: newTrendingScore,
      reputationScore: newReputationScore,
      lastCalculatedAt: new Date().toISOString(),
      lastTrendingUpdate: new Date().toISOString()
    });
  });
};

// LIKE / UNLIKE
export const toggleLike = async (brandId: string, userId: string, brandOwnerId: string) => {
  if (userId === brandOwnerId) throw new Error("Cannot like your own brand");

  const brandRef = doc(db, 'brands', brandId);

  await runTransaction(db, async (transaction) => {
    const brandDoc = await transaction.get(brandRef);
    if (!brandDoc.exists()) throw new Error("Brand not found");

    const data = brandDoc.data();
    const likes: string[] = data.likes || [];
    const isLiked = likes.includes(userId);

    const newLikeCount = isLiked
      ? Math.max((data.likeCount || 0) - 1, 0)
      : (data.likeCount || 0) + 1;

    const newRecentLikes = isLiked
      ? Math.max((data.recentLikes || 0) - 1, 0)
      : (data.recentLikes || 0) + 1;

    const newEngagementScore = calculateEngagementScore({
      ...data,
      likeCount: newLikeCount,
      followerCount: data.followerCount || 0
    });

    const newTrendingScore =
      (newRecentLikes * 2) +
      ((data.recentFollows || 0) * 3) +
      (data.newBrandBonus || 0);

    const newReputationScore = calculateReputationScore({
      ...data,
      likeCount: newLikeCount,
      followerCount: data.followerCount || 0,
      recentLikes: isLiked
        ? Math.max((data.recentLikes || 0) - 1, 0)
        : (data.recentLikes || 0) + 1
    });

    transaction.update(brandRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      likeCount: increment(isLiked ? -1 : 1),
      recentLikes: increment(isLiked ? -1 : 1),
      engagementScore: newEngagementScore,
      trendingScore: newTrendingScore,
      reputationScore: newReputationScore,
      lastCalculatedAt: new Date().toISOString(),
      lastTrendingUpdate: new Date().toISOString()
    });
  });
};

export const updateEngagementScore = async (brandId: string, brandData: any) => {
  try {
    const score = calculateEngagementScore(brandData);
    const brandRef = doc(db, 'brands', brandId);
    await updateDoc(brandRef, { engagementScore: score });
  } catch (err) {
    console.error('Score update failed:', err);
  }
};

// Calculate trending score based on recent activity (last 7 days)
export const calculateTrendingScore = (brand: any): number => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Recent likes weight (last 7 days)
  const recentLikes = (brand.recentLikes || 0);
  const recentFollows = (brand.recentFollows || 0);

  // Brand age bonus — newer brands get slight boost
  const createdAt = brand.createdAt?.toDate
    ? brand.createdAt.toDate()
    : new Date(brand.createdAt || 0);
  const isNewBrand = createdAt > sevenDaysAgo;
  const newBrandBonus = isNewBrand ? 15 : 0;

  // Trending formula
  const trendingScore =
    (recentLikes * 2) +
    (recentFollows * 3) +
    newBrandBonus;

  return trendingScore;
};

// Update trending score when like happens
export const updateTrendingOnLike = async (brandId: string, isAdding: boolean) => {
  try {
    const brandRef = doc(db, 'brands', brandId);
    await updateDoc(brandRef, {
      recentLikes: increment(isAdding ? 1 : -1),
      trendingScore: increment(isAdding ? 2 : -2),
      lastTrendingUpdate: new Date().toISOString()
    });
  } catch (err) {
    console.error('Trending like update failed:', err);
  }
};

// Update trending score when follow happens
export const updateTrendingOnFollow = async (brandId: string, isAdding: boolean) => {
  try {
    const brandRef = doc(db, 'brands', brandId);
    await updateDoc(brandRef, {
      recentFollows: increment(isAdding ? 1 : -1),
      trendingScore: increment(isAdding ? 3 : -3),
      lastTrendingUpdate: new Date().toISOString()
    });
  } catch (err) {
    console.error('Trending follow update failed:', err);
  }
};

export const recalculateAllScores = async () => {
  const snapshot = await getDocs(collection(db, 'brands'));
  const updates = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    const score = calculateEngagementScore(data);
    await updateDoc(doc(db, 'brands', docSnap.id), {
      engagementScore: score,
      lastCalculatedAt: new Date().toISOString()
    });
  });
  await Promise.all(updates);
  console.log('All scores recalculated');
};

// Calculate reputation score based on multiple factors
export const calculateReputationScore = (brand: any): number => {
  const followerScore = (brand.followerCount || 0) * 2;
  const likeScore = (brand.likeCount || 0) * 1;

  const profileCompleteness = (
    brand.brandName &&
    brand.description &&
    brand.category &&
    brand.instagramUrl &&
    brand.facebookUrl
  ) ? 20 : 0;

  const activeFollowers = Math.min((brand.followerCount || 0), 50) * 2;

  const weeklyActivity = ((brand.recentLikes || 0) + (brand.recentFollows || 0)) * 5;

  return Math.round(
    followerScore +
    likeScore +
    profileCompleteness +
    activeFollowers +
    weeklyActivity
  );
};

export const getReputationBadge = (score: number) => {
  if (score >= 700) return {
    label: 'Elite Brand',
    emoji: '💎',
    level: 'elite',
    color: '#06b6d4',
    bg: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    border: '#67e8f9',
    textColor: '#164e63',
    minScore: 700,
    nextLevel: null,
    progress: 100
  };
  if (score >= 300) return {
    label: 'Gold Brand',
    emoji: '🥇',
    level: 'gold',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '#fcd34d',
    textColor: '#92400e',
    minScore: 300,
    nextLevel: 700,
    progress: Math.round(((score - 300) / 400) * 100)
  };
  if (score >= 100) return {
    label: 'Silver Brand',
    emoji: '🥈',
    level: 'silver',
    color: '#6b7280',
    bg: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
    border: '#d1d5db',
    textColor: '#374151',
    minScore: 100,
    nextLevel: 300,
    progress: Math.round(((score - 100) / 200) * 100)
  };
  return {
    label: 'Bronze Brand',
    emoji: '🥉',
    level: 'bronze',
    color: '#b45309',
    bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '#d97706',
    textColor: '#7c2d12',
    minScore: 0,
    nextLevel: 100,
    progress: Math.round((score / 100) * 100)
  };
};

export const recalculateAllTrendingScores = async () => {
  const snapshot = await getDocs(collection(db, 'brands'));
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const updates = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    const createdAt = data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt || 0);
    const isNewBrand = createdAt > sevenDaysAgo;
    const newBrandBonus = isNewBrand ? 15 : 0;

    const trendingScore =
      ((data.recentLikes || 0) * 2) +
      ((data.recentFollows || 0) * 3) +
      newBrandBonus;

    await updateDoc(doc(db, 'brands', docSnap.id), {
      trendingScore,
      newBrandBonus,
      lastTrendingUpdate: new Date().toISOString()
    });
  });

  await Promise.all(updates);
  console.log('All trending scores recalculated');
};

// Get AI recommendations based on user preferences
export const getRecommendedBrands = (
  allBrands: any[],
  currentUser: any,
  userFollowing: string[],
  userLiked: string[]
): any[] => {
  if (!currentUser) {
    // Not logged in — return top brands by reputation
    return [...allBrands]
      .sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0))
      .slice(0, 6);
  }

  // Get user's preferred categories from their interactions
  const interactedBrands = allBrands.filter(b =>
    userFollowing.includes(b.id) || userLiked.includes(b.id)
  );

  const categoryCount: Record<string, number> = {};
  interactedBrands.forEach(b => {
    if (b.category) {
      categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
    }
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)
    .slice(0, 3);

  // Get mutual followers boost
  const getMutualBoost = (brand: any): number => {
    const brandFollowers: string[] = brand.followers || [];
    const mutuals = brandFollowers.filter((uid: string) => userFollowing.includes(uid));
    return mutuals.length * 2;
  };

  // Calculate recommendation score
  const scoredBrands = allBrands
    .filter(b => {
      const ownerId = b.ownerId || b.userId;
      return ownerId !== currentUser.uid && !userFollowing.includes(b.id);
    })
    .map(b => {
      const followerScore = (b.followerCount || 0) * 1.5;
      const likeScore = (b.likeCount || 0) * 1;
      const categoryBoost = topCategories.includes(b.category) ?
        (topCategories.indexOf(b.category) === 0 ? 4 :
         topCategories.indexOf(b.category) === 1 ? 3 : 2) : 0;
      const mutualBoost = getMutualBoost(b);
      const recentBoost = ((b.recentLikes || 0) + (b.recentFollows || 0)) * 1.5;
      const reputationBoost = (b.reputationScore || 0) * 0.1;

      const reasons: string[] = [];
      if (categoryBoost > 0) reasons.push(`Similar category (${b.category})`);
      if (mutualBoost > 0) reasons.push('Your classmates follow this');
      if ((b.followerCount || 0) > 5) reasons.push('Popular in class');
      if ((b.recentLikes || 0) > 0 || (b.recentFollows || 0) > 0) reasons.push('Trending now');
      if ((b.reputationScore || 0) >= 300) reasons.push(`${b.reputationScore >= 700 ? '💎 Elite' : '🥇 Gold'} brand`);
      if (reasons.length === 0) reasons.push('Discover something new');

      const recommendationScore =
        followerScore + likeScore + categoryBoost + mutualBoost + recentBoost + reputationBoost;

      return { ...b, recommendationScore, reasons };
    });

  return scoredBrands
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);
};

export const recalculateAllReputations = async () => {
  const snapshot = await getDocs(collection(db, 'brands'));
  const updates = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    const reputationScore = calculateReputationScore(data);
    await updateDoc(doc(db, 'brands', docSnap.id), {
      reputationScore,
      lastReputationUpdate: new Date().toISOString()
    });
  });
  await Promise.all(updates);
  console.log('All reputation scores recalculated');
};