import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

const Layout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <nav className="bg-primary sticky top-0 z-50 shadow-lg border-b border-primary-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/" className="group">
                                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                                    <Logo variant="white" size="md" />
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6">
                            <LanguageSwitcher />
                            {user ? (
                                <>
                                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${user.image}` : user.image} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className="text-white font-medium text-sm">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-white/70 hover:text-accent transition-colors rounded-full hover:bg-white/10"
                                        title={t('logout')}
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-4">
                                    <Link to="/login">
                                        <Button variant="ghost">{t('login')}</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button>{t('register')}</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
