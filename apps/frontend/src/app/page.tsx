export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
          MUSKOM
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg">
          Musyawarah KOMITKABE Management System
        </p>
      </main>
    </div>
  );
}
