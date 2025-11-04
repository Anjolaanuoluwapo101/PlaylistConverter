// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/layouts/MainLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <MainLayout>
            <Head title="Forgot password" />
            <div className="w-full max-w-md mx-auto p-4 md:p-6">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
                        Forgot password
                    </h2>
                    <p className="text-lg text-gray-600">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                <div className="bg-white border border-gray-200 p-6">
                    {status && (
                        <div className="mb-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <div className="space-y-6">
                        <Form {...PasswordResetLinkController.store.form()}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="off"
                                            autoFocus
                                            placeholder="email@example.com"
                                        />

                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="my-6 flex items-center justify-start">
                                        <Button
                                            className="w-full"
                                            disabled={processing}
                                            data-test="email-password-reset-link-button"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    Sending...
                                                </div>
                                            ) : (
                                                'Email password reset link'
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        <div className="space-x-1 text-center text-sm text-gray-500">
                            <span>Or, return to</span>
                            <TextLink href={login()}>log in</TextLink>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}