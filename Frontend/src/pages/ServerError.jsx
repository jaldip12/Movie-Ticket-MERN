import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServerError = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-rose-700/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-xl w-full text-center"
      >
        <div className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-2xl bg-red-100 border border-red-200">
          <AlertTriangle className="w-7 h-7 text-red-700" />
        </div>

        <h1 className="text-[8rem] md:text-[12rem] font-bold leading-none tracking-tight bg-gradient-to-b from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(220,38,38,0.35)]">
          500
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          Something went wrong on our end
        </h2>

        <p className="text-slate-700 mt-4 text-sm md:text-base">
          We hit an unexpected error. Please try again — if it keeps happening,
          drop us a note.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleReload}
            className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 rounded-xl font-medium transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;
