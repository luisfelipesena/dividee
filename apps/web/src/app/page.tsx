import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-3xl font-bold text-center">Welcome to Dividee</h1>
          <p className="max-w-md text-center text-gray-600 dark:text-gray-300">
            A modern, full-stack application built with Next.js and Expo in a Turborepo monorepo structure.
          </p>
        </div>
        
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 p-6 border border-gray-200 rounded-lg dark:border-gray-800">
            <h2 className="text-xl font-semibold">Authentication</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create an account or log in to access all features of Dividee.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Link 
                href="/auth/login"
                className="px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="px-4 py-2 text-center text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 p-6 border border-gray-200 rounded-lg dark:border-gray-800">
            <h2 className="text-xl font-semibold">Mobile App</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Download our mobile app to use Dividee on the go.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Link 
                href="/download"
                className="px-4 py-2 text-center text-white bg-gray-800 rounded-md hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Download App
              </Link>
              <Link 
                href="/docs/mobile"
                className="px-4 py-2 text-center text-gray-800 border border-gray-800 rounded-md dark:border-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4 mt-4 sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      
      <footer className="flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
