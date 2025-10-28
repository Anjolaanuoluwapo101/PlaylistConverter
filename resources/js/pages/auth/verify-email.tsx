// Components
import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import { logout } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import Footer from '@/components/user/Footer';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:via-purple-950/20 dark:to-neutral-900">
                <NavBar items={NavBarData} />
                <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                            Verify email
                        </h2>
                        <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
                            Please verify your email address by clicking on the link we just emailed to you.
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                        {status === 'verification-link-sent' && (
                            <div className="mb-4 text-center text-sm font-medium text-green-600">
                                A new verification link has been sent to the email address
                                you provided during registration.
                            </div>
                        )}

                        <Form
                            {...EmailVerificationNotificationController.store.form()}
                            className="space-y-6 text-center"
                        >
                            {({ processing }) => (
                                <>
                                    <Button disabled={processing} variant="secondary">
                                        {processing ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Sending...
                                            </div>
                                        ) : (
                                            'Resend verification email'
                                        )}
                                    </Button>

                                    <TextLink
                                        href={logout()}
                                        className="mx-auto block text-sm"
                                    >
                                        Log out
                                    </TextLink>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
