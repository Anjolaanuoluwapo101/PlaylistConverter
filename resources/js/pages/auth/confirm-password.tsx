import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import NavBar from '@/components/user/NavBar';
import { NavBarData } from '@/utils/global';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:via-purple-950/20 dark:to-neutral-900">
                <NavBar items={NavBarData} />
                <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                            Confirm your password
                        </h2>
                        <p className="text-lg text-purple-600/80 dark:text-purple-400/80 font-medium">
                            This is a secure area of the application. Please confirm your password before continuing.
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg">
                        <Form {...store.form()} resetOnSuccess={['password']}>
                            {({ processing, errors }) => (
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            autoFocus
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center">
                                        <Button
                                            className="w-full"
                                            disabled={processing}
                                            data-test="confirm-password-button"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    Confirming...
                                                </div>
                                            ) : (
                                                'Confirm password'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
