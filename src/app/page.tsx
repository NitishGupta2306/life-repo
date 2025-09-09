import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Life RPG</h1>
          <p className="text-slate-300 text-lg">Gamify your life and level up in the real world</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Link
            href="/character"
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">👤</div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-200">Character Dashboard</h3>
                <p className="text-purple-200/80 text-sm">View your stats, resources, and level progress</p>
              </div>
            </div>
          </Link>

          <Link
            href="/character/skills"
            className="group bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🌳</div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-green-200">Skill Trees</h3>
                <p className="text-green-200/80 text-sm">Master life domains and unlock new abilities</p>
              </div>
            </div>
          </Link>

          <Link
            href="/brain-dump"
            className="group bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🧠</div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-orange-200">Brain Dump</h3>
                <p className="text-orange-200/80 text-sm">Capture thoughts and convert them to actionable quests</p>
              </div>
            </div>
          </Link>

          <div className="group bg-gradient-to-r from-gray-600 to-slate-600 p-6 rounded-xl border border-gray-500/30 opacity-50">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚔️</div>
              <div>
                <h3 className="text-xl font-semibold text-white">Quests</h3>
                <p className="text-gray-200/80 text-sm">Coming soon - Turn real-life tasks into epic adventures</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Transform your daily life into an engaging RPG experience. Level up by completing real-world challenges!
          </p>
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
