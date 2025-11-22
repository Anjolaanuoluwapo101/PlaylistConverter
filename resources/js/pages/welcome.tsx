import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import FeatureShowcase from '@/components/user/FeatureShowcase';

export default function Welcome() {
    return (
        <MainLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="max-w-7xl mx-auto">
                <FeatureShowcase />
            </div>
        </MainLayout>
    );
}