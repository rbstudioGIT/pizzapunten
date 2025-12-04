import { usePizzaData } from "@/hooks/usePizzaData";
import { OverviewStats } from "@/components/OverviewStats";
import { Rankings } from "@/components/Rankings";
import { PerformanceChart } from "@/components/PerformanceChart";
import { SessionLog } from "@/components/SessionLog";
import { Skeleton } from "@/components/ui/skeleton";

function App() {
  const data = usePizzaData();

  if (data.loading) {
    return (
      <div className="container mx-auto p-8 space-y-8 min-h-screen flex flex-col justify-center">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-16 w-64 rounded-xl" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-[600px] lg:col-span-1 rounded-xl" />
          <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">System Error</h2>
          <p>{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden font-sans selection:bg-primary/30">
      {/* Background Image Overlay - Subtle Texture */}
      <div
        className="fixed inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url('/veld.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none z-0" />

      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-8 glass rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <img src="/logo.png" alt="Logo" className="h-16 w-auto relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Pizza<span className="text-primary">Punten</span>
              </h1>
              <p className="text-sm text-slate-400 tracking-widest uppercase">Dashboard v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono text-slate-400">LIVE DATA</span>
            </div>
            <img src="/pizza.png" alt="Pizza" className="h-10 w-auto animate-spin-slow opacity-80" style={{ animationDuration: '20s' }} />
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar / Leaderboard Area */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8">
            <Rankings data={data} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <OverviewStats data={data} />
            <PerformanceChart data={data} />
            <SessionLog data={data} />
          </div>
        </div>

        <footer className="text-center text-slate-600 text-xs py-8">
          <p>POWERED BY V.V. SITTARD &bull; DESIGNED FOR CHAMPIONS</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
