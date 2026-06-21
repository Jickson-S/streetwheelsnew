import { Link } from "react-router-dom";
import { Compass, Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4">
      {/* Background blur shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        {/* Visual Header */}
        <div className="inline-flex items-center justify-center p-4 bg-violet-600/20 text-violet-400 rounded-3xl border border-violet-500/20 shadow-lg shadow-violet-500/10 mb-2">
          <Compass size={48} className="animate-spin [animation-duration:8s]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tight text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Lost in the Drive?</h2>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            The route you specified does not exist. Let's redirect you back to a verified road!
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            to="/home"
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-600/10 hover:shadow-violet-600/20"
          >
            <Car size={14} />
            <span>Go Back Home</span>
          </Link>
          <Link
            to="/cars"
            className="px-5 py-2.5 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all"
          >
            Browse Fleet
          </Link>
        </div>
      </div>
    </div>
  );
}
