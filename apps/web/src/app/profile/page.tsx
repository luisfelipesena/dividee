'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type User = {
  id: string;
  email: string;
  last_sign_in_at?: string;
  created_at?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user profile');
        }

        if (!data.user) {
          // Redirect to login if not authenticated
          router.push('/auth/login');
          return;
        }

        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }
      
      // Redirect to home page after logout
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not happen as we redirect in the useEffect
  }

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="flex items-center justify-between mb-12">
        <Link href="/" className="flex items-center">
          <Image
            src="/next.svg"
            alt="Dividee Logo"
            width={120}
            height={30}
            className="dark:invert"
          />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Log Out
        </button>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl p-8 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h1 className="mb-6 text-2xl font-bold">Your Profile</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h2>
              <p className="text-lg">{user.email}</p>
            </div>
            
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</h2>
              <p className="font-mono text-sm text-lg">{user.id}</p>
            </div>
            
            {user.created_at && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</h2>
                <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            )}
            
            {user.last_sign_in_at && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Sign In</h2>
                <p className="text-lg">{new Date(user.last_sign_in_at).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <div className="pt-6 mt-8 border-t">
            <h2 className="mb-4 text-xl font-semibold">Actions</h2>
            <div className="space-y-2">
              <Link
                href="/profile/edit"
                className="block px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </Link>
              <Link
                href="/profile/security"
                className="block px-4 py-2 text-center text-gray-800 border border-gray-300 rounded-md dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Security Settings
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 