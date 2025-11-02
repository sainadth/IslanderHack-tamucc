import Header from '../components/Header';
import EvacuationRoutes from '../components/EvacuationRoutes';

export default function EvacuationPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-3 bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Smart Evacuation Routes
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Get personalized evacuation routes to the nearest safe shelters with real-time traffic updates.
          </p>
        </div>

        <EvacuationRoutes />

        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Important Evacuation Tips
          </h3>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
            <li>• Leave early - don't wait for mandatory evacuation orders</li>
            <li>• Bring your emergency supply kit and important documents</li>
            <li>• Fill up your gas tank before leaving</li>
            <li>• Turn off utilities (gas, water, electricity) if time permits</li>
            <li>• Lock all windows and doors</li>
            <li>• Follow designated evacuation routes</li>
            <li>• Stay tuned to local news for updates</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
