import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, []);

    return (
        <div className="bg-gray-100 min-h-[100vh]">
            {/* Main Content */}
            <main className="flex-1 p-2 sm:p-4">
                <Outlet />
            </main>
        </div>
    );
}
