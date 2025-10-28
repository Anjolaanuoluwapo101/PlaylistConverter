import Platform from '@/components/user/Platform';
// import AppLayout from '@/layouts/app-layout';
// import { dashboard } from '@/routes';
// import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import NavBar from '@/components/user/NavBar';
import FeatureShowcase from '@/components/user/FeatureShowcase';
import Footer from '@/components/user/Footer';
import { NavBarData } from '@/utils/global';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:via-purple-950/20 dark:to-neutral-900">
                <NavBar items={NavBarData} />
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <div className="max-w-7xl mx-auto">
                        <FeatureShowcase />
                    </div>
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Platform />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
