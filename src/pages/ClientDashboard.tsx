import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Star, MapPin, CheckCircle2, Phone, Search, Crosshair } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { socket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';

interface Barber {
    id: string;
    user: {
        id: string;
        name: string;
        phone: string;
        image?: string;
    };
    specialties: string;
    priceRange: string;
    isAvailable: boolean;
    rating: number;
    reviewCount: number;
    bio?: string;
    district?: string;
    services?: string;
    startingPrice?: number;
    portfolio?: string;
}

import { useTranslation } from 'react-i18next';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    return path.startsWith('/') ? `${BASE_URL}${path}` : path;
};

const ClientDashboard = () => {
    const { t } = useTranslation();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [requestForm, setRequestForm] = useState({
        serviceType: 'Haircut',
        location: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        price: 0
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterAvailable, setFilterAvailable] = useState(false);
    const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating');
    const [modalStep, setModalStep] = useState<'profile' | 'book'>('profile');

    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            socket.emit('join_room', user.id);
        }

        socket.on('request_status_updated', (updatedRequest: any) => {
            if (updatedRequest.status === 'ACCEPTED') {
                alert(`Great news! ${updatedRequest.barber.name} accepted your request.`);
            } else if (updatedRequest.status === 'REJECTED') {
                alert(`Your request to ${updatedRequest.barber.name} was declined.`);
            }
        });

        return () => {
            socket.off('request_status_updated');
        };
    }, [user]);

    useEffect(() => {
        fetchBarbers();
        if (selectedBarber) setModalStep('profile');
    }, [selectedBarber]);

    const handleBarberSelect = (barber: Barber) => {
        setSelectedBarber(barber);
        setModalStep('profile');
    };

    const fetchBarbers = async () => {
        try {
            const res = await api.get('/users/barbers');
            setBarbers(res.data);
        } catch (error) {
            console.error('Error fetching barbers', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBarbers = barbers
        .filter(b => {
            const matchesSearch = b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.specialties.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAvailability = filterAvailable ? b.isAvailable : true;
            return matchesSearch && matchesAvailability;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            // For price/distance we would need real data, using dummy sort for now
            return 0;
        });

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const scheduledTime = new Date(`${requestForm.date}T${requestForm.time}`);

            await api.post('/requests', {
                barberId: selectedBarber?.user.id,
                serviceType: requestForm.serviceType,
                location: requestForm.location,
                scheduledTime: scheduledTime.toISOString(),
                price: requestForm.price || 50
            });
            alert('Request sent successfully!');
            setSelectedBarber(null);
            // Reset form to defaults
            setRequestForm({
                serviceType: 'Haircut',
                location: '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                price: 0
            });
        } catch (error) {
            alert('Failed to send request');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-primary font-medium">{t('loading')}</div>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-serif font-bold text-primary">{t('find_barber')}</h1>
                <p className="text-gray-500 text-lg">{t('book_best')}</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <Input
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-4 h-4 text-gray-400" />}
                        className="mb-0"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary-500"
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                    >
                        <option value="rating">{t('top_rated')}</option>
                        <option value="price">{t('lowest_price')}</option>
                        <option value="distance">{t('nearest')}</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                        <input
                            type="checkbox"
                            checked={filterAvailable}
                            onChange={(e) => setFilterAvailable(e.target.checked)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('availability')}</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBarbers.map((barber) => (
                    <div key={barber.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="h-48 bg-primary/5 relative overflow-hidden cursor-pointer flex items-center justify-center" onClick={() => handleBarberSelect(barber)}>
                            {barber.user.image ? (
                                <img
                                    src={getImageUrl(barber.user.image)}
                                    alt={barber.user.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="text-4xl font-serif font-bold text-primary/20">
                                    {barber.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute top-4 ltr:right-4 rtl:left-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${barber.isAvailable
                                    ? 'bg-accent text-white'
                                    : 'bg-red-500 text-white'
                                    }`}>
                                    {barber.isAvailable ? t('available_now') : t('busy')}
                                </span>
                            </div>
                            <div className="absolute bottom-4 ltr:left-4 rtl:right-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium">
                                <MapPin className="w-3 h-3" />
                                {barber.district || t('casablanca')}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="cursor-pointer" onClick={() => handleBarberSelect(barber)}>
                                    <h3 className="font-serif font-bold text-xl text-primary hover:text-accent transition-colors">{barber.user.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{barber.bio || 'Expert barber with 10 years experience'}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                    <Star className="w-4 h-4 text-[#D97706] fill-current" />
                                    <span className="font-bold text-[#D97706]">{barber.rating.toFixed(1)}</span>
                                    <span className="text-amber-700/50 text-xs">({barber.reviewCount})</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                                <div className="flex flex-wrap gap-2">
                                    {JSON.parse(barber.specialties || '[]').slice(0, 2).map((spec: string) => {
                                        const serviceKey = `service_${spec.toLowerCase().replace(/\s+/g, '_')}`;
                                        return (
                                            <span key={spec} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                                {t(serviceKey, { defaultValue: spec })}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                    {(() => {
                                        if (barber.startingPrice) return `${t('from')} ${barber.startingPrice} ${t('mad')}`;
                                        try {
                                            const services = JSON.parse(barber.services || '[]');
                                            if (services.length > 0) {
                                                return `${t('from')} ${Math.min(...services.map((s: any) => s.price))} ${t('mad')}`;
                                            }
                                        } catch (e) { }
                                        return `${t('from')} 50 ${t('mad')}`;
                                    })()}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`tel:${barber.user.phone}`}
                                    className="flex items-center justify-center p-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    title="Call Barber"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>
                                <Button
                                    onClick={() => handleBarberSelect(barber)}
                                    fullWidth
                                    variant={barber.isAvailable ? 'secondary' : 'outline'}
                                    disabled={!barber.isAvailable}
                                    className="flex-1"
                                >
                                    {barber.isAvailable ? t('book_appointment') : t('availability')}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Barber Detail & Request Modal */}
            {selectedBarber && (
                <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setSelectedBarber(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full transition-colors z-10"
                        >
                            ✕
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-serif font-bold text-primary">{selectedBarber.user.name}</h2>
                            <p className="text-gray-500 font-medium">{modalStep === 'profile' ? t('barber_profile_portfolio') : t('book_appointment')}</p>
                        </div>

                        {modalStep === 'profile' ? (
                            <div className="space-y-8">
                                {/* Portfolio Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif font-bold text-xl text-primary">{t('recent_work')}</h3>
                                        <span className="text-xs font-bold text-accent bg-accent/5 px-2 py-1 rounded">{t('portfolio')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {(() => {
                                            try {
                                                const portfolio = JSON.parse(selectedBarber.portfolio || '[]');
                                                if (portfolio.length > 0) {
                                                    return portfolio.map((img: string, idx: number) => {
                                                        return (
                                                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                                                                <img src={getImageUrl(img)} alt={`Work ${idx}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        );
                                                    });
                                                }
                                            } catch (e) { }
                                            return (
                                                <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                                                    {t('no_portfolio_images')}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Services & Bio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-primary flex items-center gap-2">
                                            <Star className="w-4 h-4 text-amber-500" />
                                            {t('about_barber')}
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {selectedBarber.bio || t('expert_barber_bio')}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-primary">{t('services_pricing')}</h4>
                                        <div className="space-y-3">
                                            {(() => {
                                                try {
                                                    const services = JSON.parse(selectedBarber.services || '[]');
                                                    if (services.length > 0) {
                                                        return (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {services.map((s: any) => {
                                                                    const serviceKey = `service_${s.name.toLowerCase().replace(/\s+/g, '_')}`;
                                                                    const displayName = t(serviceKey, { defaultValue: s.name });
                                                                    return (
                                                                        <div key={s.id} className="group flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
                                                                            <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                                                                                {s.image ? (
                                                                                    <img src={getImageUrl(s.image)} alt={s.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                        <Star className="w-6 h-6" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex flex-col justify-center">
                                                                                <span className="text-gray-900 font-bold group-hover:text-primary transition-colors">{displayName}</span>
                                                                                <span className="text-primary font-bold text-sm">{s.price} {t('mad')}</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                } catch (e) { }
                                                return JSON.parse(selectedBarber.specialties || '[]').map((s: string) => {
                                                    const serviceKey = `service_${s.toLowerCase().replace(/\s+/g, '_')}`;
                                                    const translatedName = t(serviceKey, { defaultValue: s });
                                                    return (
                                                        <div key={s} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                                            <span className="text-gray-700 font-medium">{translatedName}</span>
                                                            <span className="font-bold text-primary">{t('from')} 50 {t('mad')}</span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100">
                                    <a
                                        href={`tel:${selectedBarber.user.phone}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-gray-50 transition-all"
                                    >
                                        <Phone className="w-5 h-5" />
                                        {t('phone')}
                                    </a>
                                    <Button
                                        onClick={() => setModalStep('book')}
                                        className="flex-1 py-4 text-lg"
                                        variant="secondary"
                                        disabled={!selectedBarber.isAvailable}
                                    >
                                        {selectedBarber.isAvailable ? t('book_appointment') : t('availability')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('select_service')}</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {(() => {
                                                let services = [];
                                                try {
                                                    services = JSON.parse(selectedBarber.services || '[]');
                                                } catch (e) { }

                                                if (services.length === 0) {
                                                    services = [{ name: t('haircut') }, { name: t('beard_trim') }];
                                                }

                                                return services.map((service: any) => {
                                                    const serviceKey = `service_${service.name.toLowerCase().replace(/\s+/g, '_')}`;
                                                    const displayName = t(serviceKey, { defaultValue: service.name });
                                                    return (
                                                        <div
                                                            key={service.name}
                                                            onClick={() => setRequestForm({ ...requestForm, serviceType: service.name, price: service.price || 50 })}
                                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-3 ${requestForm.serviceType === service.name
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-gray-100 hover:border-gray-200'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between w-full">
                                                                <div>
                                                                    <span className={`font-bold block text-lg ${requestForm.serviceType === service.name ? 'text-primary' : 'text-gray-900'}`}>{displayName}</span>
                                                                    {service.price && <div className="text-secondary font-bold text-base mt-1">{service.price} MAD</div>}
                                                                </div>
                                                                {requestForm.serviceType === service.name && <CheckCircle2 className="w-6 h-6 text-primary" />}
                                                            </div>

                                                            {service.image && (
                                                                <div className="w-full aspect-video rounded-lg bg-white overflow-hidden border border-gray-100 shadow-sm mt-1">
                                                                    <img src={getImageUrl(service.image)} alt={service.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    <div className="col-span-2 relative">
                                        <Input
                                            label={t('location')}
                                            icon={<MapPin className="w-4 h-4" />}
                                            value={requestForm.location}
                                            onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })}
                                            placeholder={t('location_placeholder')}
                                            required
                                            endIcon={<Crosshair className="w-5 h-5" />}
                                            onEndIconClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition((position) => {
                                                        setRequestForm({
                                                            ...requestForm,
                                                            location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                                                        });
                                                    });
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <Input
                                            type="date"
                                            label={t('select_date')}
                                            value={requestForm.date}
                                            onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Input
                                            type="time"
                                            label={t('select_time')}
                                            value={requestForm.time}
                                            onChange={(e) => setRequestForm({ ...requestForm, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setModalStep('profile')}
                                        className="flex-1 h-14"
                                    >
                                        {t('profile')}
                                    </Button>
                                    <Button type="submit" className="flex-1 h-14" variant="secondary">
                                        {t('confirm_booking')}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
