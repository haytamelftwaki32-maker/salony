import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock } from 'lucide-react';
import Logo from '../components/Logo';
import { PhoneInput } from '../components/ui/PhoneInput';
import { normalizePhone } from '../utils/phoneUtils';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const normalizedPhone = normalizePhone(phone);
            await login(normalizedPhone, password);
            navigate('/');
        } catch (err: any) {
            setError(t('error_invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Brand */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary-dark p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center" />

                <div className="relative z-10">
                    <Logo variant="white" size="lg" />
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">
                        Experience Premium Grooming
                    </h2>
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Connect with the top barbers in your city. Book appointments seamlessly and elevate your style with Salony.
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
                        <h2 className="text-3xl font-bold text-primary mb-2 font-serif">{t('welcome_back')}</h2>
                        <p className="text-gray-500">{t('enter_details')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <PhoneInput
                                placeholder="0555555555"
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
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-[#1E1B4B] focus:ring-[#1E1B4B]" />
                                <span className="text-gray-600">{t('remember_me')}</span>
                            </label>
                            <a href="#" className="text-primary font-medium hover:underline">{t('forgot_password')}</a>
                        </div>

                        <Button type="submit" isLoading={loading} fullWidth variant="secondary">
                            {t('sign_in')}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-600">
                        {t('dont_have_account')}{' '}
                        <Link to="/register" className="text-accent font-semibold hover:underline">
                            {t('create_account')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
