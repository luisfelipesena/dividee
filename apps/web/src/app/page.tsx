import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="text-3xl font-bold text-sky-400">
            Carteira
          </div>
          <div>
            <Link href="/auth/login" className="mr-6 text-sky-300 hover:text-sky-100">
              Login
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 font-semibold text-white transition duration-150 rounded-lg bg-sky-500 hover:bg-sky-600">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center md:py-32">
        <div className="container px-4 mx-auto">
          <h1 className="mb-6 text-5xl font-extrabold md:text-7xl">
            Share Subscriptions, <span className="text-sky-400">Save Money</span>. Securely.
          </h1>
          <p className="max-w-3xl mx-auto mb-10 text-xl md:text-2xl text-slate-300">
            Carteira makes it easy to split costs for streaming services and other subscriptions with people you trust.
          </p>
          <Link href="/auth/signup" className="px-10 py-4 text-xl font-bold text-white transition duration-150 rounded-lg bg-sky-500 hover:bg-sky-600">
            Get Started
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-800">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-12 text-4xl font-bold text-sky-400">Sharing Made Simple</h2>
          <div className="grid gap-10 md:grid-cols-3">
            <div className="p-8 transition-transform duration-300 transform shadow-xl bg-slate-700 rounded-xl hover:scale-105">
              <div className="mb-4 text-5xl text-sky-400">1</div>
              <h3 className="mb-3 text-2xl font-semibold">Add Subscriptions</h3>
              <p className="text-slate-300">
                Register the services you want to share with your group.
              </p>
            </div>
            <div className="p-8 transition-transform duration-300 transform shadow-xl bg-slate-700 rounded-xl hover:scale-105">
              <div className="mb-4 text-5xl text-sky-400">2</div>
              <h3 className="mb-3 text-2xl font-semibold">Invite Members</h3>
              <p className="text-slate-300">
                Securely invite friends or family to join your shared accounts.
              </p>
            </div>
            <div className="p-8 transition-transform duration-300 transform shadow-xl bg-slate-700 rounded-xl hover:scale-105">
              <div className="mb-4 text-5xl text-sky-400">3</div>
              <h3 className="mb-3 text-2xl font-semibold">Save Together</h3>
              <p className="text-slate-300">
                Split the costs and enjoy your favorite services for less.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-16 text-4xl font-bold text-sky-400">Why Choose Carteira?</h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center">
              {/* Placeholder for an icon */}
              <div className="inline-block p-4 mb-6 rounded-full bg-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Top-Notch Security</h3>
              <p className="max-w-xs text-slate-300">
                We prioritize your security. Carteira integrates with Bitwarden to ensure your credentials are managed safely.
              </p>
            </div>
            <div className="flex flex-col items-center">
              {/* Placeholder for an icon */}
              <div className="inline-block p-4 mb-6 rounded-full bg-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6.75A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V12m18 0v-6.75A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25V12m15-6.75V9" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Effortless Savings</h3>
              <p className="max-w-xs text-slate-300">
                Stop overpaying. Divide expenses and see your savings grow, all in one place.
              </p>
            </div>
            <div className="flex flex-col items-center">
              {/* Placeholder for an icon */}
              <div className="inline-block p-4 mb-6 rounded-full bg-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.582M12 15.75a3 3 0 100-5.999 3 3 0 000 5.999zM12 12.75v.007A4.507 4.507 0 0115.75 15a4.507 4.507 0 01-3.75 2.25A4.507 4.507 0 018.25 15a4.507 4.507 0 013.75-2.25v-.007zM12 12.75H9.75M15.75 12.75H12M12 12.75V10.5M12 15.75V12.75m-3.75 0H12m0 0h3.75m-3.75 0V15m6.362-3.75c.01-.01.014-.025.027-.041a4.506 4.506 0 000-6.422c-.013-.016-.02-.031-.034-.047a4.506 4.506 0 00-6.322 0c-.014.016-.021.031-.034.047a4.506 4.506 0 000 6.422c.013.016.027.03.04.046a4.506 4.506 0 006.322 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Stay Organized</h3>
              <p className="max-w-xs text-slate-300">
                Manage access, track renewals, and keep everything tidy and under control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-slate-800">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-sky-400">Ready to Start Saving?</h2>
          <p className="max-w-2xl mx-auto mb-10 text-xl text-slate-300">
            Join Carteira today and take control of your subscription spending. Simple, secure, and smart.
          </p>
          <Link href="/auth/signup" className="px-10 py-4 text-xl font-bold text-white transition duration-150 rounded-lg bg-sky-500 hover:bg-sky-600">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <div className="container px-4 mx-auto">
          <p className="text-slate-400">&copy; {new Date().getFullYear()} Carteira. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 