import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { request } from '@/routes/password';
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';
import AlertComponent from '@/utils/AlertComponent';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:via-purple-950/20 dark:to-neutral-900">
                <NavBar items={NavBarData} />
                <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                            Log in to your account
                        </h2>
                        <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
                            Enter your email and password below to log in
                        </p>
                        {
                            window.location.href.includes("onrender") && (
                                <AlertComponent type='info' message='Render free tier does not support Email Verification, bear with us.' />
                            )
                        }
                    </div>

                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                        {status && (
                            <div className="mb-4 text-center text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <Form
                            {...AuthenticatedSessionController.store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password">Password</Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">Remember me</Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-4 w-full"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    Logging in...
                                                </div>
                                            ) : (
                                                'Log in'
                                            )}
                                        </Button>
                                    </div>

                                    <div className="text-center text-sm text-muted-foreground">
                                        Don't have an account?{' '}
                                        <TextLink href={register()} tabIndex={5}>
                                            Sign up
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
