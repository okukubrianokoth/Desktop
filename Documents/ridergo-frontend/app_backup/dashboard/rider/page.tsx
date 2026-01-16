"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./contexts/AuthContext"
import { useRiderProfile, useRiderTrips, useWallet, useGeolocation } from "./hooks/useApi"
import { riderAPI, mpesaAPI } from "./utils/api"

export default function RiderDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { profile, loading: profileLoading } = useRiderProfile()
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useRiderTrips()
  const { balance, transactions, loading: walletLoading } = useWallet()
  const { location, loading: locationLoading } = useGeolocation()
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [updatingLocation, setUpdatingLocation] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    loadSubscriptionStatus()
  }, [user, router])

  useEffect(() => {
    // Update location every 30 seconds when available
    if (location && !updatingLocation) {
      updateLocation()
    }
  }, [location])

  const loadSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true)
      // Note: This endpoint might need to be added to backend
      const response = await riderAPI.getProfile()
      setSubscription(response.data.subscription || { active: false })
    } catch (error) {
      console.error("Error loading subscription:", error)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const updateLocation = async () => {
    if (!location) return
    
    try {
      setUpdatingLocation(true)
      await riderAPI.updateLocation(location)
    } catch (error) {
      console.error("Error updating location:", error)
    } finally {
      setUpdatingLocation(false)
    }
  }

  const handlePaySubscription = async () => {
    try {
      setSubscriptionLoading(true)
      const response = await mpesaAPI.initiatePayment({
        phone: user.phone,
        amount: 100,
        type: "subscription"
      })
      alert("Payment initiated! Check your phone for M-Pesa prompt.")
      // In a real app, you'd poll for payment status
      setTimeout(() => loadSubscriptionStatus(), 30000)
    } catch (error) {
      alert("Payment failed. Please try again.")
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const handleAcceptTrip = async (tripId: string) => {
    try {
      await riderAPI.acceptTrip(tripId)
      refetchTrips()
      alert("Trip accepted successfully!")
    } catch (error) {
      alert("Failed to accept trip. Please try again.")
    }
  }

  const handleCompleteTrip = async (tripId: string) => {
    try {
      await riderAPI.completeTrip(tripId)
      refetchTrips()
      alert("Trip completed successfully!")
    } catch (error) {
      alert("Failed to complete trip. Please try again.")
    }
  }

  const activeTrips = trips?.filter((trip: any) => trip.status === "accepted") || []
  const availableTrips = trips?.filter((trip: any) => trip.status === "pending") || []
  const completedTrips = trips?.filter((trip: any) => trip.status === "completed") || []

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">RiderGo</h1>
                <p className="text-sm text-gray-500">Welcome back, {profile?.name || user.phone}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Wallet Balance</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {walletLoading ? "..." : `KES ${balance || 0}`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Trips</dt>
                    <dd className="text-lg font-medium text-gray-900">{activeTrips.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{completedTrips.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Location Status</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {locationLoading ? "Updating..." : location ? "Active" : "Offline"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Subscription Status</h3>
            {subscriptionLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : subscription?.active ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  {subscription.expiresAt && (
                    <p className="mt-1 text-sm text-gray-600">
                      Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                  <p className="mt-1 text-sm text-gray-600">Subscribe to start accepting deliveries</p>
                </div>
                <button
                  onClick={handlePaySubscription}
                  disabled={subscriptionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {subscriptionLoading ? "Processing..." : "Subscribe (KES 100)"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Available Trips */}
        {availableTrips.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Deliveries</h3>
              <div className="space-y-4">
                {availableTrips.map((trip: any) => (
                  <div key={trip._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{trip.itemType}</h4>
                        <p className="text-sm text-gray-600 mt-1">{trip.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>From: {trip.pickupLocation?.address}</p>
                          <p>To: {trip.deliveryLocation?.address}</p>
                          <p>Reward: KES {trip.deliveryFee}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptTrip(trip._id)}
                        className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Trips */}
        {activeTrips.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Active Deliveries</h3>
              <div className="space-y-4">
                {activeTrips.map((trip: any) => (
                  <div key={trip._id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{trip.itemType}</h4>
                        <p className="text-sm text-gray-600 mt-1">{trip.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>From: {trip.pickupLocation?.address}</p>
                          <p>To: {trip.deliveryLocation?.address}</p>
                          <p>Reward: KES {trip.deliveryFee}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteTrip(trip._id)}
                        className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Transactions</h3>
            {walletLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : transactions?.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction._id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}KES {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
