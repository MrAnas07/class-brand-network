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

  // Field errors state
  const [fieldErrors, setFieldErrors] = useState({
    brandName: false,
    category: false,
    description: false,
    instagramUrl: false,
    facebookUrl: false,
  });

  // Category dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [editCategoryDropdownOpen, setEditCategoryDropdownOpen] = useState(false);

  const categories = [
    'Technology',
    'Fashion & Clothing',
    'Food & Beverages',
    'Health & Fitness',
    'Beauty & Skincare',
    'Education',
    'Art & Design',
    'Music',
    'Drinkware',
    'Sports',
    'Books & Literature',
    'Home & Kitchen',
    'Photography',
    'Travel',
    'Gaming',
    'Finance',
    'Handmade & Crafts',
    'Jewelry & Accessories',
    'Electronics',
    'Other'
  ];

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

    // Reset all field errors first
    setFieldErrors({
      brandName: false,
      category: false,
      description: false,
      instagramUrl: false,
      facebookUrl: false,
    });

    // Check each field one by one and show specific toast
    if (!brandName || brandName.trim() === '') {
      setFieldErrors(prev => ({ ...prev, brandName: true }));
      showToast('⚠️ Brand name is required!', 'error');
      return;
    }

    if (!category || category.trim() === '') {
      setFieldErrors(prev => ({ ...prev, category: true }));
      showToast('⚠️ Category is required!', 'error');
      return;
    }

    if (!description || description.trim() === '') {
      setFieldErrors(prev => ({ ...prev, description: true }));
      showToast('⚠️ Description is required!', 'error');
      return;
    }

    if (!instagramUrl || instagramUrl.trim() === '') {
      setFieldErrors(prev => ({ ...prev, instagramUrl: true }));
      showToast('⚠️ Instagram URL is required!', 'error');
      return;
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(instagramUrl.trim())) {
      setFieldErrors(prev => ({ ...prev, instagramUrl: true }));
      showToast('⚠️ Instagram URL must start with https://', 'error');
      return;
    }

    if (!facebookUrl || facebookUrl.trim() === '') {
      setFieldErrors(prev => ({ ...prev, facebookUrl: true }));
      showToast('⚠️ Facebook URL is required!', 'error');
      return;
    }

    if (!urlPattern.test(facebookUrl.trim())) {
      setFieldErrors(prev => ({ ...prev, facebookUrl: true }));
      showToast('⚠️ Facebook URL must start with https://', 'error');
      return;
    }

    // All valid — proceed with existing create brand logic
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
        showToast('🎉 Brand updated successfully!', 'success');
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
        showToast('🎉 Brand created successfully!', 'success');
      }

      // Reset form
      resetForm();
      setFieldErrors({
        brandName: false,
        category: false,
        description: false,
        instagramUrl: false,
        facebookUrl: false,
      });
      fetchUserBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      showToast(getFirebaseError(error), 'error');
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
    setFieldErrors({
      brandName: false,
      category: false,
      description: false,
      instagramUrl: false,
      facebookUrl: false,
    });
    setEditCategoryDropdownOpen(false); // Reset dropdown state when editing
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
    setFieldErrors({
      brandName: false,
      category: false,
      description: false,
      instagramUrl: false,
      facebookUrl: false,
    });
    setCategoryDropdownOpen(false);
    setEditCategoryDropdownOpen(false);
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
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#ec4899',
                  fontSize: '14px'
                }}>
                  Brand Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="brandName"
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, brandName: false }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: fieldErrors.brandName ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#374151',
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#ec4899';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                    e.currentTarget.style.backgroundColor = '#fdf2f8';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onBlur={e => {
                    if (!e.currentTarget.value.trim()) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = 'white';
                    } else {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                      e.currentTarget.style.backgroundColor = '#fdf2f8';
                    }
                    e.currentTarget.style.color = '#374151';
                  }}
                  placeholder="Enter brand name"
                />
                {fieldErrors.brandName && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '5px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚠️ Brand Name is required
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#ec4899',
                  fontSize: '14px'
                }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Select or type category"
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value);
                      if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, category: false }));
                      if (isEditing) {
                        setEditCategoryDropdownOpen(true);
                      } else {
                        setCategoryDropdownOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (isEditing) {
                        setEditCategoryDropdownOpen(true);
                      } else {
                        setCategoryDropdownOpen(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => {
                      if (isEditing) {
                        setEditCategoryDropdownOpen(false);
                      } else {
                        setCategoryDropdownOpen(false);
                      }
                    }, 300)}
                    readOnly={false}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 16px',
                      borderRadius: '12px',
                      border: fieldErrors.category
                        ? '2px solid #ef4444'
                        : category
                          ? '2px solid #ec4899'
                          : '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: category ? '#fdf2f8' : 'white',
                      color: '#374151',
                      fontWeight: category ? '600' : '400',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                  />
                  <span
                    onClick={() => {
                      if (isEditing) {
                        setEditCategoryDropdownOpen(!editCategoryDropdownOpen);
                      } else {
                        setCategoryDropdownOpen(!categoryDropdownOpen);
                      }
                    }}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', color: '#9ca3af',
                      cursor: 'pointer', fontSize: '12px', userSelect: 'none'
                    }}
                  >▼</span>

                  {(isEditing ? editCategoryDropdownOpen : categoryDropdownOpen) && (
                    <div style={{
                      position: 'absolute', top: '105%', left: 0, right: 0,
                      backgroundColor: 'white',
                      border: '2px solid #f9a8d4',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(236,72,153,0.15)',
                      zIndex: 99999,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}>
                      {categories
                        .filter(cat =>
                          category === '' ||
                          cat.toLowerCase().includes(category.toLowerCase())
                        )
                        .map(cat => (
                          <div
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setFieldErrors(prev => ({ ...prev, category: false }));
                              if (isEditing) {
                                setEditCategoryDropdownOpen(false);
                              } else {
                                setCategoryDropdownOpen(false);
                              }
                            }}
                            style={{
                              padding: '10px 16px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#374151',
                              fontWeight: '500',
                              borderBottom: '1px solid #fce7f3',
                              backgroundColor: category === cat ? '#fdf2f8' : 'white',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = '#fdf2f8';
                              e.currentTarget.style.color = '#ec4899';
                              e.currentTarget.style.paddingLeft = '20px';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = category === cat ? '#fdf2f8' : 'white';
                              e.currentTarget.style.color = '#374151';
                              e.currentTarget.style.paddingLeft = '16px';
                            }}
                          >
                            {cat}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                {fieldErrors.category && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ Category is required
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#ec4899',
                  fontSize: '14px'
                }}>
                  Description <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, description: false }));
                  }}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: fieldErrors.description ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#374151',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    minHeight: '120px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#ec4899';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                    e.currentTarget.style.backgroundColor = '#fdf2f8';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onBlur={e => {
                    if (!e.currentTarget.value.trim()) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = 'white';
                    } else {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                      e.currentTarget.style.backgroundColor = '#fdf2f8';
                    }
                    e.currentTarget.style.color = '#374151';
                  }}
                  placeholder="Describe your brand"
                />
                {fieldErrors.description && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '5px',
                    fontWeight: '500'
                  }}>
                    ⚠️ Description is required
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#ec4899',
                    fontSize: '14px'
                  }}>
                    Instagram URL <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="instagramUrl"
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => {
                      setInstagramUrl(e.target.value);
                      if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, instagramUrl: false }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: fieldErrors.instagramUrl ? '2px solid #ef4444' : '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#374151',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                      e.currentTarget.style.backgroundColor = '#fdf2f8';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onBlur={e => {
                      if (!e.currentTarget.value.trim()) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.backgroundColor = 'white';
                      } else {
                        e.currentTarget.style.borderColor = '#ec4899';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                        e.currentTarget.style.backgroundColor = '#fdf2f8';
                      }
                      e.currentTarget.style.color = '#374151';
                    }}
                    placeholder="https://instagram.com/yourbrand"
                  />
                  {fieldErrors.instagramUrl && (
                    <p style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '5px',
                      fontWeight: '500'
                    }}>
                      ⚠️ Valid Instagram URL is required (https://)
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#ec4899',
                    fontSize: '14px'
                  }}>
                    Facebook URL <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="facebookUrl"
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => {
                      setFacebookUrl(e.target.value);
                      if (e.target.value.trim()) setFieldErrors(prev => ({ ...prev, facebookUrl: false }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: fieldErrors.facebookUrl ? '2px solid #ef4444' : '1px solid #e5e7eb',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#374151',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                      e.currentTarget.style.backgroundColor = '#fdf2f8';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onBlur={e => {
                      if (!e.currentTarget.value.trim()) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.backgroundColor = 'white';
                      } else {
                        e.currentTarget.style.borderColor = '#ec4899';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)';
                        e.currentTarget.style.backgroundColor = '#fdf2f8';
                      }
                      e.currentTarget.style.color = '#374151';
                    }}
                    placeholder="https://facebook.com/yourbrand"
                  />
                  {fieldErrors.facebookUrl && (
                    <p style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '5px',
                      fontWeight: '500'
                    }}>
                      ⚠️ Valid Facebook URL is required (https://)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)',
                    color: 'white',
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginTop: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #db2777, #9333ea)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #ec4899, #a855f7)'}
                >
                  {isEditing ? 'Update Brand' : '🚀 Create Brand'}
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