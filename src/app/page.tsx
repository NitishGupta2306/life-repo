import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Life RPG</h1>
          <p className="text-lg text-gray-600 mb-8">
            Transform your life into an engaging RPG adventure with analytics, reflections, and progress tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Analytics Dashboard</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track your progress, view insights, and monitor your personal growth journey.
            </p>
            <Link 
              href="/analytics"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Dashboard
            </Link>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🗓️ Daily Reflection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Take a moment to reflect on your day, track mood, and set intentions.
            </p>
            <Link 
              href="/analytics/daily"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Reflecting
            </Link>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Weekly Review</h3>
            <p className="text-sm text-gray-600 mb-4">
              Review your week, identify patterns, and plan for continued growth.
            </p>
            <Link 
              href="/analytics/weekly"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Weekly Review
            </Link>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏆 Achievements</h3>
            <p className="text-sm text-gray-600 mb-4">
              View your unlocked achievements and track progress toward new milestones.
            </p>
            <Link 
              href="/analytics/achievements"
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              View Achievements
            </Link>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🧠 Brain Dump</h3>
            <p className="text-sm text-gray-600 mb-4">
              Clear your mind by dumping thoughts and ideas into your digital brain.
            </p>
            <Link 
              href="/brain-dump"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Brain Dump
            </Link>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Coming Soon</h3>
            <p className="text-sm text-gray-600 mb-4">
              Quests, character development, and ADHD support systems.
            </p>
            <div className="inline-block px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
              Under Development
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
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
