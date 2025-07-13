import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) navigate('/login');
    }, [token])

    return (
        <div className="bg-gray-100 min-h-[100vh]">
            {/* Main Content */}
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
