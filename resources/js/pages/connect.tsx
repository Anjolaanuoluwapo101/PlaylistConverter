import Platform from '@/components/user/Platform';
import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';

export default function Dashboard() {
    return (
        <MainLayout>
            <Head title="Dashboard" />
            <div className="max-w-7xl mx-auto space-y-6">
                <Platform />
            </div>
        </MainLayout>
    );
}
