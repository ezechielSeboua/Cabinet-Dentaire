import { Link } from "react-router-dom";
import { MdSearchOff } from "react-icons/md";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <MdSearchOff size={72} className="text-primary-300 mb-6" />
      <h1 className="text-6xl font-extrabold text-primary-600 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Page introuvable
      </h2>
      <p className="text-gray-500 max-w-sm mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-700 rounded-lg hover:bg-primary-800 transition-colors"
        >
          Retour à l'accueil
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-primary-700 bg-white border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
