import React, { useState, useEffect } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
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
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
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
        patch('/settings/update');
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
            <Head title="Profile Settings" />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Update your account's profile information and email address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name = "name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name = "email"
                                        type="email"
                                        value={data.email}
                                        // onChange={(e) => setData('email', e.target.value)}
                                        disabled = {true}
                                        className="mt-1"
                                    />
                                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <Alert>
                                    <AlertDescription>
                                        Your email address is unverified.
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Click here to re-send the verification email.
                                        </Link>
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

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>

                            {recentlySuccessful && (
                                <p className="text-sm text-green-600">Profile updated successfully.</p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Password Reset */}
                <Card>
                    <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                            Ensure your account is using a long, random password to stay secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={route('password.edit')}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Change Password
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Platform Connections */}
                <Card>
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
                <Card>
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
                                onClick={() => confirmActionHandler(() => {
                                    // Handle account deletion
                                    window.location.href = route('profile.destroy');
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
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    confirmAction();
                    setShowConfirmModal(false);
                }}
                title="Confirm Action"
                message="Are you sure you want to proceed with this action?"
            />
        </>
    );
}
function route(arg0: string): string {
    throw new Error('Function not implemented.');
}

