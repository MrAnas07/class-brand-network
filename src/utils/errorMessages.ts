export const getFirebaseError = (error: any): string => {
  const code = error?.code || '';

  const errorMap: Record<string, string> = {
    // Auth errors
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/email-already-in-use': 'An account with this email already exists. Please login.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign in was cancelled. Please try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    'auth/requires-recent-login': 'Please log out and log back in to continue.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',

    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This record already exists.',
    'resource-exhausted': 'Service is temporarily unavailable. Please try again later.',
    'unavailable': 'Service is temporarily unavailable. Please try again.',
    'deadline-exceeded': 'Request timed out. Please try again.',

    // Storage errors
    'storage/unauthorized': 'You are not authorized to upload files.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
    'storage/invalid-format': 'Invalid file format.',
  };

  return errorMap[code] || error?.message || 'Something went wrong. Please try again.';
};