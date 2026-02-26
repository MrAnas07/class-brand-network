import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import BrandCard from '../components/BrandCard';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getFirebaseError } from '../utils/errorMessages';

interface Brand {
  id: string;
  userId: string;
  brandName: string;
  description: string;
  instagramUrl: string;
  facebookUrl: string;
  createdAt: any;
  updatedAt: any;
  followers?: string[];
  likes?: string[];
  followerCount?: number;
  likeCount?: number;
  ownerId?: string;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  // Form state
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchUserBrands();
    }
  }, [currentUser]);

  const fetchUserBrands = async () => {
    if (!currentUser) return;

    try {
      const q = query(collection(db, 'brands'), where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const brandsData: Brand[] = [];
      querySnapshot.forEach((doc) => {
        brandsData.push({
          id: doc.id,
          ...doc.data()
        } as Brand);
      });
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching brands:', error);
      showToast('Failed to load your brands. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }

    // Validate URLs
    if (instagramUrl && !isValidUrl(instagramUrl)) {
      showToast('Instagram URL must start with https://', 'error');
      return;
    }

    if (facebookUrl && !isValidUrl(facebookUrl)) {
      showToast('Facebook URL must start with https://', 'error');
      return;
    }

    try {
      if (isEditing && currentBrandId) {
        // Update existing brand
        const brandRef = doc(db, 'brands', currentBrandId);
        await updateDoc(brandRef, {
          brandName: brandName.trim(),
          description: description.trim(),
          category: category.trim() || 'Technology',
          instagramUrl: instagramUrl.trim(),
          facebookUrl: facebookUrl.trim(),
          ownerId: currentUser!.uid,
          updatedAt: serverTimestamp()
        });
        showToast('Brand updated successfully! ✅', 'success');
      } else {
        // Create new brand
        await addDoc(collection(db, 'brands'), {
          userId: currentUser!.uid,
          brandName: brandName.trim(),
          description: description.trim(),
          category: category.trim() || 'Technology',
          instagramUrl: instagramUrl.trim(),
          facebookUrl: facebookUrl.trim(),
          followers: [],
          likes: [],
          followerCount: 0,
          likeCount: 0,
          ownerId: currentUser!.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        showToast('Brand created successfully! 🎉', 'success');
      }

      // Reset form
      resetForm();
      fetchUserBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      showToast(getFirebaseError(error), 'error');
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Allow empty URLs
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleEdit = (brand: Brand) => {
    setBrandName(brand.brandName);
    setDescription(brand.description);
    setCategory(brand.category || '');
    setInstagramUrl(brand.instagramUrl || '');
    setFacebookUrl(brand.facebookUrl || '');
    setIsEditing(true);
    setCurrentBrandId(brand.id);
  };

  const handleDelete = async (brandId: string) => {
    if (window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'brands', brandId));
        showToast('Brand deleted successfully.', 'info');
        fetchUserBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        showToast(getFirebaseError(error), 'error');
      }
    }
  };

  const resetForm = () => {
    setBrandName('');
    setDescription('');
    setCategory('');
    setInstagramUrl('');
    setFacebookUrl('');
    setIsEditing(false);
    setCurrentBrandId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffafcc]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 w-full pt-24 animate-fadeIn">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent animate-fadeInDown">
          Your Brand Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Form Section - Left Side */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInLeft">
            <h2 className="text-2xl font-bold text-pink-600 mb-6">
              {isEditing ? 'Edit Brand' : 'Create New Brand'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#ffafcc]">
                  Brand Name *
                </label>
                <input
                  id="brandName"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
                  placeholder="Enter brand name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#ffafcc]">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
                  placeholder="Enter category (e.g. Technology, Fashion, Art)"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#ffafcc]">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700 resize-none"
                  placeholder="Describe your brand"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#ffafcc]">
                    Instagram URL
                  </label>
                  <input
                    id="instagramUrl"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
                    placeholder="https://instagram.com/yourbrand"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#ffafcc]">
                    Facebook URL
                  </label>
                  <input
                    id="facebookUrl"
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 focus:scale-[1.01] text-gray-700"
                    placeholder="https://facebook.com/yourbrand"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-95"
                  style={{backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)'}}
                  onMouseEnter={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #db2777, #9333ea)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #ec4899, #a855f7)'}
                >
                  {isEditing ? 'Update Brand' : 'Create Brand'}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 text-gray-600 font-semibold py-2.5 px-4 rounded-xl transition-all border-2 border-gray-300"
                    style={{backgroundColor: 'transparent'}}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor='#f3f4f6'; e.currentTarget.style.borderColor='#9ca3af'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.borderColor='#d1d5db'; }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Your Brands Section - Right Side */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-6 animate-fadeInRight">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pink-600">Your Brands</h2>
              <span className="text-sm text-gray-600">{brands.length} {brands.length === 1 ? 'brand' : 'brands'}</span>
            </div>

            {brands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">You haven't created any brands yet.</p>
                <p className="text-gray-500 mt-2">Create your first brand to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {brands.map((brand, index) => (
                  <div
                    key={brand.id}
                    className="bg-white/50 backdrop-blur-sm border border-white/50 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all p-4 rounded-xl animate-fadeInUp hover-lift"
                    style={{ animationDelay: `${index * 0.15}s`, opacity: 0 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-pink-600 mb-1">{brand.brandName}</h3>
                        <p className="text-sm text-gray-600 mb-2">{brand.description}</p>
                        <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs px-2 py-1 rounded-full">{brand.category}</span>
                      </div>
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full text-sm font-medium">
                        {brand.followerCount || 0} followers
                      </span>
                    </div>

                    <div className="flex space-x-2 mb-3">
                      {brand.instagramUrl && (
                        <a
                          href={brand.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)',
                            color: 'white',
                            fontWeight: '600',
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          Instagram
                        </a>
                      )}
                      {brand.facebookUrl && (
                        <a
                          href={brand.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundImage: 'linear-gradient(to right, #6366f1, #3b82f6)',
                            color: 'white',
                            fontWeight: '600',
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          Facebook
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3 text-sm text-gray-500 mt-2">
                      <span>❤️ {brand.likeCount || 0} likes</span>
                      <span>👥 {brand.followerCount || 0} followers</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="flex-1 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)'}}
                        onMouseEnter={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #db2777, #9333ea)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundImage='linear-gradient(to right, #ec4899, #a855f7)'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="flex-1 text-red-500 font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-red-400"
                        style={{backgroundColor: 'transparent'}}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor='#ef4444'; e.currentTarget.style.color='white'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='#ef4444'; }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;