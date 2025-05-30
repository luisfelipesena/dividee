import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// It looks like you might not have these specific icons in your project yet.
// We'll use text placeholders for now. You can add SVG or font icons later.
// import { ShieldCheckIcon, CurrencyDollarIcon, UsersIcon } from 'react-native-heroicons/outline'; 

// Placeholder for icons (simple text for now)
const IconPlaceholder = ({ name, size = 24, color = 'white' }: { name: string, size?: number, color?: string }) => (
  <View style={{ width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
    <Text style={{ color, fontSize: size * 0.6, fontWeight: 'bold' }}>{name.substring(0, 1)}</Text>
  </View>
);

export default function LandingScreen({ navigation }: { navigation?: any }) {
  const navigateToLogin = () => {
    navigation?.navigate('Auth', { mode: 'login' });
  };

  const navigateToSignup = () => {
    navigation?.navigate('Auth', { mode: 'signup' });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header - Simplified for mobile, can be expanded if needed */}
        <View className="px-4 py-5 flex-row justify-between items-center">
          <Text className="text-3xl font-bold text-sky-400">Carteira</Text>
          {/* Navigation to login/signup can be part of the main content or a menu */}
        </View>

        {/* Hero Section */}
        <View className="items-center text-center py-16 px-6">
          <Text className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center">
            Share Subscriptions, <Text className="text-sky-400">Save Money</Text>. Securely.
          </Text>
          <Text className="text-lg md:text-xl text-slate-300 mb-8 text-center max-w-md">
            Carteira makes it easy to split costs for streaming services and other subscriptions with people you trust.
          </Text>
          <TouchableOpacity 
            className="bg-sky-500 py-3 px-8 rounded-lg w-full max-w-xs shadow-md"
            onPress={navigateToSignup}
          >
            <Text className="text-white text-lg font-bold text-center">Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works Section */}
        <View className="py-12 bg-slate-800 px-6">
          <Text className="text-3xl font-bold text-sky-400 mb-10 text-center">Sharing Made Simple</Text>
          <View className="space-y-8">
            <View className="bg-slate-700 p-6 rounded-xl shadow-lg items-center">
              <Text className="text-sky-400 mb-3 text-4xl font-bold">1</Text>
              <Text className="text-xl font-semibold text-white mb-2 text-center">Add Subscriptions</Text>
              <Text className="text-slate-300 text-center">
                Register the services you want to share with your group.
              </Text>
            </View>
            <View className="bg-slate-700 p-6 rounded-xl shadow-lg items-center">
              <Text className="text-sky-400 mb-3 text-4xl font-bold">2</Text>
              <Text className="text-xl font-semibold text-white mb-2 text-center">Invite Members</Text>
              <Text className="text-slate-300 text-center">
                Securely invite friends or family to join your shared accounts.
              </Text>
            </View>
            <View className="bg-slate-700 p-6 rounded-xl shadow-lg items-center">
              <Text className="text-sky-400 mb-3 text-4xl font-bold">3</Text>
              <Text className="text-xl font-semibold text-white mb-2 text-center">Save Together</Text>
              <Text className="text-slate-300 text-center">
                Split the costs and enjoy your favorite services for less.
              </Text>
            </View>
          </View>
        </View>

        {/* Features Overview Section */}
        <View className="py-12 px-6">
          <Text className="text-3xl font-bold text-sky-400 mb-10 text-center">Why Choose Carteira?</Text>
          <View className="space-y-10">
            <View className="items-center">
              <IconPlaceholder name="Security" />
              <Text className="text-xl font-semibold text-white mb-2 text-center">Top-Notch Security</Text>
              <Text className="text-slate-300 text-center max-w-xs">
                We prioritize your security. Carteira integrates with Bitwarden to ensure your credentials are managed safely.
              </Text>
            </View>
            <View className="items-center">
              <IconPlaceholder name="Savings" />
              <Text className="text-xl font-semibold text-white mb-2 text-center">Effortless Savings</Text>
              <Text className="text-slate-300 text-center max-w-xs">
                Stop overpaying. Divide expenses and see your savings grow, all in one place.
              </Text>
            </View>
            <View className="items-center">
              <IconPlaceholder name="Organized" />
              <Text className="text-xl font-semibold text-white mb-2 text-center">Stay Organized</Text>
              <Text className="text-slate-300 text-center max-w-xs">
                Manage access, track renewals, and keep everything tidy and under control.
              </Text>
            </View>
          </View>
        </View>

        {/* Call to Action Section */}
        <View className="py-16 bg-slate-800 px-6 items-center">
          <Text className="text-3xl font-bold text-sky-400 mb-6 text-center">Ready to Start Saving?</Text>
          <Text className="text-lg text-slate-300 mb-8 text-center max-w-md">
            Join Carteira today and take control of your subscription spending. Simple, secure, and smart.
          </Text>
          <TouchableOpacity 
            className="bg-sky-500 py-3 px-8 rounded-lg w-full max-w-xs shadow-md mb-4"
            onPress={navigateToSignup}
          >
            <Text className="text-white text-lg font-bold text-center">Sign Up Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-transparent border border-sky-400 py-3 px-8 rounded-lg w-full max-w-xs"
            onPress={navigateToLogin}
          >
            <Text className="text-sky-400 text-lg font-bold text-center">Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="py-8 items-center px-6">
          <Text className="text-slate-400 text-center">&copy; {new Date().getFullYear()} Carteira. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 