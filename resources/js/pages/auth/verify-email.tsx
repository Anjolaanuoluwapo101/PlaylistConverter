// Components
import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import { logout } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/MainLayout';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <MainLayout>
            <Head title="Email verification" />
            <div className="w-full max-w-md mx-auto p-4 md:p-6">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
                        Verify email
                    </h2>
                    <p className="text-lg text-gray-600">
                        Please verify your email address by clicking on the link we just emailed to you.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 p-6">
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
        </MainLayout>
    );
}