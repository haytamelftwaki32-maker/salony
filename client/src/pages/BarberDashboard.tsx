import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { CheckCircle, Clock, MapPin, Calendar, Star, Phone, Navigation, Image as ImageIcon, User, Trash2, Camera, Lock } from 'lucide-react';
import { socket } from '../lib/socket';
import { useTranslation } from 'react-i18next';

interface Request {
    id: string;
    client: { name: string; phone: string };
    serviceType: string;
    location: string;
    status: string;
    scheduledTime: string;
    price: number;
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    return path.startsWith('/') ? `${BASE_URL}${path}` : path;
};

const BarberDashboard = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(true);
    const [stats, setStats] = useState({ today: 0, completed: 0, rating: 4.8 });
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
    const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [district, setDistrict] = useState('');
    const [startingPrice, setStartingPrice] = useState('50');
    const [services, setServices] = useState<{ id: string; name: string; price: number; image?: string }[]>([]);
    const [newService, setNewService] = useState<{ name: string; price: string; image?: string }>({ name: '', price: '' });
    const [profileLoading, setProfileLoading] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        fetchRequests();
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user?.id) {
            socket.emit('join_room', user.id);
        }

        socket.on('new_request', (newRequest: Request) => {
            setRequests(prev => [newRequest, ...prev]);
            alert(`New Request from ${newRequest.client.name}!`);
        });

        return () => {
            socket.off('new_request');
        };
    }, [user]);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);

            // Calculate today's requests based on when they were created (not scheduled)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            const todaysRequests = res.data.filter((r: any) => {
                const createdDate = new Date(r.createdAt);
                return createdDate >= today && createdDate <= todayEnd;
            }).length;

            const completed = res.data.filter((r: Request) => r.status === 'COMPLETED').length;
            setStats(prev => ({ ...prev, today: todaysRequests, completed }));
        } catch (error) {
            console.error('Error fetching requests', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            if (res.data.barberProfile) {
                const profile = res.data.barberProfile;
                setIsAvailable(profile.isAvailable);
                setDistrict(profile.district || '');
                setStartingPrice(profile.startingPrice?.toString() || '50');

                if (profile.portfolio) {
                    try {
                        const parsed = JSON.parse(profile.portfolio);
                        setPortfolioImages(Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        setPortfolioImages([]);
                    }
                }

                if (profile.services) {
                    try {
                        const parsed = JSON.parse(profile.services);
                        setServices(Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        setServices([]);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleSaveProfile = async () => {
        setProfileLoading(true);
        try {
            await api.put('/users/profile', {
                district,
                startingPrice: parseFloat(startingPrice),
                services: JSON.stringify(services),
                portfolio: JSON.stringify(portfolioImages),
            });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (e) {
            alert('Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError(t('password_update_error'));
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError(t('password_min_length'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t('passwords_dont_match'));
            return;
        }

        try {
            setProfileLoading(true);
            await api.put('/users/change-password', {
                currentPassword,
                newPassword
            });
            setPasswordSuccess(t('password_updated_success'));
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.response?.data?.error === 'Current password is incorrect') {
                setPasswordError(t('incorrect_current_password'));
            } else {
                setPasswordError(t('password_update_error'));
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            setProfileLoading(true);
            await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await useAuthStore.getState().checkAuth();
            alert(t('update_success') || 'Profile picture updated!');
        } catch (e) {
            alert(t('upload_error') || 'Failed to upload image');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/users/portfolio/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPortfolioImages(prev => [...prev, res.data.url]);
        } catch (e) {
            alert('Failed to upload image');
        }
    };

    const removePortfolioImage = async (indexToRemove: number) => {
        if (!confirm(t('delete_confirmation') || 'Are you sure you want to delete this image?')) return;
        const newImages = portfolioImages.filter((_, idx) => idx !== indexToRemove);
        setPortfolioImages(newImages);
        try {
            await api.put('/users/profile', {
                portfolio: JSON.stringify(newImages)
            });
        } catch (error) {
            console.error('Error removing image', error);
            setPortfolioImages(portfolioImages);
            alert('Failed to delete image');
        }
    };

    const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/users/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewService(prev => ({ ...prev, image: res.data.url }));
        } catch (e) {
            alert('Failed to upload image');
        }
    };

    const addService = () => {
        if (!newService.name || !newService.price) return;
        const id = Math.random().toString(36).substr(2, 9);
        setServices(prev => [...prev, {
            id,
            name: newService.name,
            price: Number(newService.price),
            image: newService.image
        }]);
        setNewService({ name: '', price: '', image: undefined });
    };

    const removeServiceImage = (serviceId: string) => {
        if (!confirm(t('delete_confirmation') || 'Are you sure?')) return;
        setServices(prev => prev.map(s => {
            if (s.id === serviceId) {
                const { image, ...rest } = s;
                return rest;
            }
            return s;
        }));
    };

    const removeService = (id: string) => {
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.put(`/requests/${id}/status`, { status });
            fetchRequests();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const toggleAvailability = async () => {
        try {
            await api.put('/users/profile', { isAvailable: !isAvailable });
            setIsAvailable(!isAvailable);
        } catch (error) {
            console.error('Error toggling availability', error);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">{t('loading_dashboard')}</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
                    <p className="text-gray-500">{t('welcome_back')}, {user?.name}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {t('dashboard')}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {t('my_profile')}
                    </button>
                    <button
                        onClick={toggleAvailability}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isAvailable ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                    >
                        {isAvailable ? t('available') : t('unavailable')}
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('requests_today')}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.today}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('completed_jobs')}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{t('my_rating')}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.rating}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-bold text-lg text-gray-900">{t('recent_requests')}</h2>
                        {requests.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 border-dashed">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('you_are_available')}</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">{t('available_desc')}</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {requests.map((req) => (
                                    <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                                                    {req.client.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{req.client.name}</h3>
                                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                                        <Phone className="w-3 h-3" />
                                                        {req.client.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded w-fit border border-primary/20">
                                                        <Navigation className="w-3 h-3" />
                                                        3.2 km away
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    req.status === 'ACCEPTED' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                        req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {t(`status_${req.status.toLowerCase()}`)}
                                                </span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">{req.price} {t('mad')}</div>
                                                    <div className="text-xs text-gray-500">{t(`service_${req.serviceType.toLowerCase().replace(/\s+/g, '_')}`, { defaultValue: req.serviceType })}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600 mb-6 border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{t('time')}:</span> {new Date(req.scheduledTime).toLocaleString()}
                                            </div>
                                            <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{t('location')}:</span> {req.location}
                                            </div>
                                        </div>

                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                                                    className="flex-1 bg-accent text-white py-3 rounded-xl hover:bg-accent-light shadow-lg shadow-accent/20 transition-all font-bold"
                                                >
                                                    {t('accept_request')}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                    className="flex-1 bg-white border border-gray-200 text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                                >
                                                    {t('decline')}
                                                </button>
                                            </div>
                                        )}

                                        {req.status === 'ACCEPTED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'COMPLETED')}
                                                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                {t('mark_completed')}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {t('my_profile')}
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                            >
                                {t('edit_profile')}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-500 text-sm font-bold"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={profileLoading}
                                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-bold shadow-md hover:bg-accent-light transition-all disabled:opacity-50"
                                >
                                    {profileLoading ? t('save_changes') + '...' : t('save_changes')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-gray-500" />
                            {t('personal_info')}
                        </h3>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-50 flex items-center justify-center">
                                    {user?.image ? (
                                        <img src={getImageUrl(user.image)} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl font-serif font-bold text-indigo-300">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                    <Camera className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('name')}</label>
                                    <div className="text-gray-900 font-medium text-lg">{user?.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('phone')}</label>
                                    <div className="text-gray-900 font-medium text-lg flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {user?.phone}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('city')}</label>
                                    <div className="text-gray-900 font-medium text-lg">{t('casablanca_morocco')}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('location_district')}</label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                label={t('location_district')}
                                                value={district}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                                                placeholder={t('enter_district')}
                                            />
                                            <Input
                                                label={t('starting_price')}
                                                type="number"
                                                value={startingPrice}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartingPrice(e.target.value)}
                                                placeholder="50"
                                            />
                                        </>
                                    ) : (
                                        <div className="text-gray-900 font-medium text-lg flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {district || <span className="text-gray-400 text-sm font-normal">{t('no_district_set')}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-gray-500" />
                            {t('change_password')}
                        </h3>

                        <div className="space-y-4 max-w-md">
                            {passwordError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">
                                    {passwordSuccess}
                                </div>
                            )}

                            <Input
                                type="password"
                                label={t('current_password')}
                                value={currentPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <Input
                                type="password"
                                label={t('new_password')}
                                value={newPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <Input
                                type="password"
                                label={t('confirm_password')}
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <button
                                onClick={handlePasswordChange}
                                disabled={profileLoading}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {profileLoading ? t('update_password') + '...' : t('update_password')}
                            </button>
                        </div>
                    </div>

                    <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-gray-500" />
                            {t('services_pricing')}
                        </h3>
                        <div className="space-y-4">
                            {services.map((service) => (
                                <div key={service.id} className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <div className="font-bold text-lg text-gray-900">{service.name}</div>
                                            <div className="text-indigo-600 font-bold text-base mt-1">{service.price} {t('mad')}</div>
                                        </div>
                                        {isEditing && (
                                            <button
                                                onClick={() => removeService(service.id)}
                                                className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    {service.image ? (
                                        <div className="w-full aspect-video rounded-lg bg-gray-50 overflow-hidden relative group border border-gray-100">
                                            <img src={getImageUrl(service.image)} alt={service.name} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeServiceImage(service.id)}
                                                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-300">
                                            <Star className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
                                    <div className="col-span-1">
                                        <label className="block w-full h-full min-h-[42px] border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleServiceImageUpload} />
                                            {newService.image ? (
                                                <img src={getImageUrl(newService.image)} alt="Preview" className="w-full h-full object-cover absolute" />
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                                                    <Camera className="w-4 h-4" />
                                                    <span>{t('photo')}</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('service_name_placeholder')}
                                        className="col-span-1 border border-gray-200 rounded-lg px-4 py-2"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t('price_mad_placeholder')}
                                        className="col-span-1 border border-gray-200 rounded-lg px-4 py-2"
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    />
                                    <button
                                        onClick={addService}
                                        className="col-span-1 bg-accent text-white rounded-lg px-4 py-2 font-bold hover:bg-accent-light shadow-md transition-all"
                                    >
                                        {t('add')}
                                    </button>
                                </div>
                            )}
                            {services.length === 0 && !isEditing && (
                                <div className="text-gray-400 text-sm py-4 text-center">{t('no_services')}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-gray-500" />
                            {t('portfolio')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {portfolioImages.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100 relative group">
                                    <img src={getImageUrl(img)} alt={`Work ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removePortfolioImage(idx)}
                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        title={t('delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors cursor-pointer p-4 text-center">
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                                    <ImageIcon className="w-6 h-6 text-indigo-500" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{t('upload_new_work')}</span>
                                <span className="text-[10px] opacity-75 mt-1">{t('from_gallery')}</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarberDashboard;
