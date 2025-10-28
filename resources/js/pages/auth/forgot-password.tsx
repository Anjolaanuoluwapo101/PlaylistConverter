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
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import Footer from '@/components/user/Footer';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:via-purple-950/20 dark:to-neutral-900">
                <NavBar items={NavBarData} />
                <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                            Forgot password
                        </h2>
                        <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
                            Enter your email to receive a password reset link
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
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

                            <div className="space-x-1 text-center text-sm text-muted-foreground">
                                <span>Or, return to</span>
                                <TextLink href={login()}>log in</TextLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
