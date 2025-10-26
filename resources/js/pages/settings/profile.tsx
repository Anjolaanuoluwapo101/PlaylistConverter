import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Music, Play, Key, LogOut, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { checkConnectedPlatforms } from '@/utils/checkstatus';
import ConfirmationModal from '@/utils/ConfirmationModal';
import AlertComponent from '@/utils/AlertComponent';
import NavBar from '@/components/user/NavBar';
import PageHeader from '@/components/PageHeader';
import { NavBarData } from '@/utils/global';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

interface Props {
    auth: {
        user: User;
    };
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ auth, mustVerifyEmail, status }: Props) {
    const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
    const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

    const { data, setData, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    useEffect(() => {
        const fetchConnectedPlatforms = async () => {
            const result = await checkConnectedPlatforms();
            if (result && result.connected_platforms) {
                setConnectedPlatforms(result.connected_platforms);
            }
        };
        fetchConnectedPlatforms();
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        axios.patch('/settings/profile', {
            name: data.name,
            email: data.email,
        }).then((response) => {
            console.log('response', response)
            if (response.data.status == 200) {
                setProfileUpdateSuccess(true);
                setTimeout(() => setProfileUpdateSuccess(false), 3000);
            }
        });
    };

    const handleDisconnectPlatform = async (platform: string) => {
        try {
            await axios.post(`/platforms/${platform}/disconnect`);
            setConnectedPlatforms(prev => ({ ...prev, [platform]: false }));
        } catch (error) {
            console.error(`Failed to disconnect ${platform}:`, error);
        }
    };

    const handleRevokeTokens = async () => {
        try {
            await axios.post('/user/tokens/revoke');
            // Optionally refresh the page or show success message
        } catch (error) {
            console.error('Failed to revoke tokens:', error);
        }
    };

    const handleTotalLogout = async () => {
        try {
            await axios.post('/user/logout-all');
            window.location.href = '/login';
        } catch (error) {
            console.error('Failed to logout from all devices:', error);
        }
    };

    const confirmActionHandler = (action: () => void) => {
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    return (
        <>
            <NavBar items={NavBarData} />
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                <PageHeader
                    title="Profile Settings"
                    description="Manage your account settings and preferences"
                />

                {/* Profile Information */}
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg mb-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">Profile Information</h3>
                        <p className="text-purple-600/70 dark:text-purple-400/70">Update your account's profile information and email address.</p>
                    </div>
                    <div className="space-y-4">
                        {profileUpdateSuccess && (
                            <AlertComponent
                                type="success"
                                message="Profile data has been successfully updated"
                            />
                        )}
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 bg-white/60 dark:bg-neutral-800/60 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={data.email}
                                        // onChange={(e) => setData('email', e.target.value)}
                                        disabled={true}
                                        className="mt-1 bg-white/60 dark:bg-neutral-800/60 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                                    />
                                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <Alert>
                                    <AlertDescription>
                                        Your email address is unverified.
                                        <button
                                            onClick={() => axios.post('/email/verification-notification')}
                                            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Click here to re-send the verification email.
                                        </button>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {status === 'verification-link-sent' && (
                                <Alert>
                                    <AlertDescription className="text-green-600">
                                        A new verification link has been sent to your email address.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" disabled={processing} className="bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>

                            {recentlySuccessful && (
                                <p className="text-sm text-green-600">Profile updated successfully.</p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Password Reset */}
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg mb-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">Password</h3>
                        <p className="text-purple-600/70 dark:text-purple-400/70">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    <div className="space-y-4">
                        {passwordAlert && (
                            <AlertComponent
                                type={passwordAlert.type}
                                message={passwordAlert.message}
                            />
                        )}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const currentPassword = formData.get('current_password') as string;
                            const password = formData.get('password') as string;
                            const passwordConfirmation = formData.get('password_confirmation') as string;

                            if (password !== passwordConfirmation) {
                                setPasswordAlert({ type: 'error', message: 'New password and confirmation do not match.' });
                                return;
                            }

                            axios.put('/settings/password', {
                                current_password: currentPassword,
                                password: password,
                                password_confirmation: passwordConfirmation,
                            }).then((response) => {
                                console.log('Password updated successfully', response);
                                setPasswordAlert({ type: 'success', message: 'Password updated successfully.' });
                                setTimeout(() => setPasswordAlert(null), 3000);
                            }).catch((error) => {
                                console.error('Failed to update password', error);
                                if (error.response && error.response.data && error.response.data.errors) {
                                    const errors = error.response.data.errors;
                                    if (errors.current_password) {
                                        setPasswordAlert({ type: 'error', message: 'Current password is incorrect.' });
                                    } else if (errors.password) {
                                        setPasswordAlert({ type: 'error', message: errors.password[0] });
                                    } else {
                                        setPasswordAlert({ type: 'error', message: 'Failed to update password. Please try again.' });
                                    }
                                } else {
                                    setPasswordAlert({ type: 'error', message: 'Failed to update password. Please try again.' });
                                }
                                setTimeout(() => setPasswordAlert(null), 5000);
                            });
                        }} className="space-y-4">
                            <div>
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    name="current_password"
                                    type="password"
                                    className="mt-1 bg-white/60 dark:bg-neutral-800/60 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className="mt-1 bg-white/60 dark:bg-neutral-800/60 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    className="mt-1 bg-white/60 dark:bg-neutral-800/60 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Update Password
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Platform Connections */}
                <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle>Connected Platforms</CardTitle>
                        <CardDescription>
                            Manage your connected music platforms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'spotify', label: 'Spotify', icon: Music, color: 'green' },
                                { key: 'youtube', label: 'YouTube', icon: Play, color: 'red' },
                            ].map((platform) => {
                                const IconComponent = platform.icon;
                                const isConnected = connectedPlatforms[platform.key];

                                return (
                                    <div key={platform.key} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <IconComponent className={`h-6 w-6 text-${platform.color}-500`} />
                                            <div>
                                                <p className="font-medium">{platform.label}</p>
                                                <Badge variant={isConnected ? "default" : "secondary"} className="mt-1">
                                                    {isConnected ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Connected
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Not Connected
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                        {isConnected && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => confirmActionHandler(() => handleDisconnectPlatform(platform.key))}
                                            >
                                                Disconnect
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* API & Sessions */}
                <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle>API Tokens & Sessions</CardTitle>
                        <CardDescription>
                            Manage your API access and active sessions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Revoke All API Tokens</p>
                                <p className="text-sm text-gray-600">This will log you out of all applications using your API tokens.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => confirmActionHandler(handleRevokeTokens)}
                                className="flex items-center gap-2"
                                disabled = {true}
                            >
                                <Key className="h-4 w-4" />
                                Revoke Tokens 
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Logout from All Devices</p>
                                <p className="text-sm text-gray-600">This will log you out from all devices and browsers.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => confirmActionHandler(handleTotalLogout)}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout All
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible and destructive actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Account</p>
                                <p className="text-sm text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => confirmActionHandler(async () => {
                                    try {
                                        await axios.delete('/user/delete');
                                        window.location.href = '/';
                                    } catch (error) {
                                        console.error('Failed to delete account:', error);
                                    }
                                })}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmationModal
                isOpen={showConfirmModal}
                onConfirm={() => {
                    confirmAction();
                    setShowConfirmModal(false);
                }}
                onCancel={() => setShowConfirmModal(false)}
                title="Confirm Action"
                message="Are you sure you want to proceed with this action?"
                confirmText="Confirm"
                cancelText="Cancel"
            />
        </>
    );
}


