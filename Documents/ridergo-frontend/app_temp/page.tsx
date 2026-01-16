import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">RiderGo</h1>
        <p className="text-lg text-gray-600 mb-8">Delivery Platform</p>
        <div className="space-x-4">
          <Link href="/rider/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Rider Login
          </Link>
          <Link href="/rider/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Rider Register
          </Link>
        </div>
      </div>
    </div>
  )
}
