import { Head } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import FeatureShowcase from '@/components/user/FeatureShowcase';
import Footer from '@/components/user/Footer';

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
            <FeatureShowcase />
            <Footer />
        </MainLayout>
    );
}
