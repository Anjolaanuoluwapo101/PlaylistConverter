import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

export default function ConfirmPassword() {
    return (
        <MainLayout>
            <Head title="Confirm password" />
            <div className="w-full max-w-md mx-auto p-4 md:p-6">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
                        Confirm your password
                    </h2>
                    <p className="text-lg text-gray-600">
                        This is a secure area of the application. Please confirm your password before continuing.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 p-6">
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
        </MainLayout>
    );
}