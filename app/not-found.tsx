import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-200">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Go to Home
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200"
          >
            Browse Spaces
          </Link>
        </div>

        {/* Additional Help Text */}
        <p className="text-sm text-gray-500 pt-8">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
