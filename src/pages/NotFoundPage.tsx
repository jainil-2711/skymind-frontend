import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[120px] font-bold text-[#171717] leading-none mb-6">404</p>
        <p className="text-xl font-bold text-white mb-2">Page not found</p>
        <p className="text-sm text-[#525252] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/search")}
          className="px-6 py-3 bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
}