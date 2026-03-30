import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, User } from 'lucide-react';
import Logo from '../components/Logo';
import { PhoneInput } from '../components/ui/PhoneInput';
import { normalizePhone } from '../utils/phoneUtils';

const Register = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CLIENT' | 'BARBER'>('CLIENT');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const register = useAuthStore((state) => state.register);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const normalizedPhone = normalizePhone(phone);
            await register({ phone: normalizedPhone, name, password, role });
            navigate('/');
        } catch (err: any) {
            setError(t('error_registration_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Brand */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary-dark p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />

                <div className="relative z-10">
                    <Logo variant="white" size="lg" />
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">
                        Join the Elite
                    </h2>
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Create your account today and discover a world of professional grooming services tailored to your lifestyle.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-gray-400">
                    © 2026 Salony. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-primary mb-2 font-serif">{t('join_salony')}</h2>
                        <p className="text-gray-500">{t('create_account_desc')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setRole('CLIENT')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'CLIENT'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t('client')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('BARBER')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'BARBER'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t('barber')}
                            </button>
                        </div>

                        <Input
                            type="text"
                            placeholder={t('full_name_placeholder')}
                            label={t('name')}
                            icon={<User className="w-5 h-5" />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <PhoneInput
                            placeholder="6XXXXXXXX"
                            label={t('phone')}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            placeholder="••••••••"
                            label={t('password')}
                            icon={<Lock className="w-5 h-5" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" isLoading={loading} fullWidth variant="secondary">
                            {t('sign_up')}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-600">
                        {t('already_have_account')}{' '}
                        <Link to="/login" className="text-accent font-semibold hover:underline">
                            {t('sign_in_link')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
