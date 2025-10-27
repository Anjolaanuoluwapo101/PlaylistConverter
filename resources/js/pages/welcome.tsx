// import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head,  usePage } from '@inertiajs/react';
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import FeatureShowcase from '@/components/user/FeatureShowcase';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            {/* <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]"> */}

                {auth.user ? (
                    <NavBar items={NavBarData}/>
                ) : (
                    <NavBar items={[
                        {
                            title : "Register",
                            uri : "/register"
                        },
                        {
                            title : "Login",
                            uri : "/login"
                        }
                    ]}/>
                )}


                <main className="w-full">
                    <FeatureShowcase />
                </main>
            {/* </div> */}
        </>
    );
}