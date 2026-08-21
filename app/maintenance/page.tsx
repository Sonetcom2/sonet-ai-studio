export default function MaintenancePage() {
return ( <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white flex items-center justify-center px-6"> <div className="max-w-2xl w-full text-center rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-10 shadow-2xl"> <div className="text-6xl mb-6">
🛠️ </div>

    <h1 className="text-4xl md:text-5xl font-black">
      SONET AI STUDIO
    </h1>

    <h2 className="mt-6 text-2xl font-bold text-cyan-400">
      We’ll Be Back Soon
    </h2>

    <p className="mt-5 text-lg leading-8 text-slate-300">
      SONET AI STUDIO is currently undergoing scheduled
      maintenance and improvements.
    </p>

    <p className="mt-3 text-slate-400">
      We’re working to make your AI creative experience
      faster, better and more reliable.
    </p>

    <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-5">
      <p className="text-sm text-slate-500">
        Thank you for your patience.
      </p>
    </div>
  </div>
</main>

);
}
