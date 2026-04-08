import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, Calendar, Scissors, AlertCircle, BarChart3, Trash2, List } from 'lucide-react';

interface DashboardStats {
    totalClients: number;
    totalBarbers: number;
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
}

interface User {
    id: string;
    name: string;
    phone: string;
    role: string;
    createdAt: string;
}

interface ServiceRequest {
    id: string;
    status: string;
    serviceType: string;
    price: number;
    createdAt: string;
    client: { name: string; phone: string };
    barber: { name: string; phone: string };
}

import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, usersRes, requestsRes] = await Promise.all([
                api.get('/users/admin/stats'),
                api.get('/users/admin/users'),
                api.get('/users/admin/requests')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setRequests(requestsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm(t('delete_confirm'))) return;

        try {
            await api.delete(`/users/admin/users/${userId}`);
            // Optimistic update
            setUsers(users.filter(u => u.id !== userId));
            alert(t('user_deleted'));
        } catch (error) {
            console.error('Error deleting user', error);
            alert('Failed to delete user');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('loading')}</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-primary mb-2">{t('admin_dashboard')}</h1>
                <p className="text-gray-500 font-medium">{t('admin_subtitle')}</p>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard icon={Users} label={t('total_clients')} value={stats.totalClients} color="primary" />
                    <StatCard icon={Scissors} label={t('total_barbers')} value={stats.totalBarbers} color="accent" />
                    <StatCard icon={Calendar} label={t('total_requests')} value={stats.totalRequests} color="primary" />
                    <StatCard icon={AlertCircle} label={t('pending')} value={stats.pendingRequests} color="accent" />
                    <StatCard icon={BarChart3} label={t('completed')} value={stats.completedRequests} color="green" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            {t('user_management')}
                        </h2>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm sticky top-0">
                                <tr>
                                    <th className="p-4 font-medium">{t('name')}</th>
                                    <th className="p-4 font-medium">{t('role')}</th>
                                    <th className="p-4 font-medium">{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'BARBER' ? 'bg-accent/10 text-accent border border-accent/20' :
                                                user.role === 'ADMIN' ? 'bg-primary text-white shadow-sm' : 'bg-primary/10 text-primary border border-primary/20'
                                                }`}>
                                                {t(`role_${user.role.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Global Requests View */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <List className="w-5 h-5 text-gray-400" />
                            {t('recent_global_requests')}
                        </h2>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm sticky top-0">
                                <tr>
                                    <th className="p-4 font-medium">{t('service')}</th>
                                    <th className="p-4 font-medium">{t('status')}</th>
                                    <th className="p-4 font-medium">{t('parties')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{req.serviceType}</div>
                                            <div className="text-xs text-gray-500">{req.price} MAD</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                req.status === 'PENDING' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-primary/10 text-primary border border-primary/20'
                                                }`}>
                                                {t(`status_${req.status.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-600">
                                            <div>C: {req.client.name}</div>
                                            <div>B: {req.barber.name}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        primary: 'bg-primary/10 text-primary border border-primary/20',
        accent: 'bg-accent/10 text-accent border border-accent/20',
        green: 'bg-green-50 text-green-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

export default AdminDashboard;
