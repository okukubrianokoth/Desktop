"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./contexts/AuthContext"
import { useClientProfile, useClientTrips, useWallet } from "./hooks/useApi"
import { clientAPI, mpesaAPI } from "./utils/api"

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { profile, loading: profileLoading } = useClientProfile()
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useClientTrips()
  const { balance, transactions, loading: walletLoading } = useWallet()
  
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    itemType: "",
    description: "",
    recipientPhone: "",
    deliveryFee: 50,
  })

  const handlePostDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)
    
    try {
      // First initiate payment
      const paymentResponse = await mpesaAPI.initiatePayment({
        phone: user.phone,
        amount: formData.deliveryFee,
        type: "delivery",
        metadata: {
          pickupLocation: formData.pickupLocation,
          deliveryLocation: formData.deliveryLocation,
          itemType: formData.itemType,
          description: formData.description,
          recipientPhone: formData.recipientPhone,
        }
      })
      
      alert("Payment initiated! Check your phone for M-Pesa prompt. Your delivery will be posted once payment is confirmed.")
      
      // In a real app, you'd wait for payment confirmation before creating the trip
      // For now, we'll create the trip immediately
      await clientAPI.createTrip({
        pickupLocation: { address: formData.pickupLocation },
        deliveryLocation: { address: formData.deliveryLocation },
        itemType: formData.itemType,
        description: formData.description,
        recipientPhone: formData.recipientPhone,
        deliveryFee: formData.deliveryFee,
      })
      
      setShowForm(false)
      setFormData({
        pickupLocation: "",
        deliveryLocation: "",
        itemType: "",
        description: "",
        recipientPhone: "",
        deliveryFee: 50,
      })
      refetchTrips()
    } catch (error) {
      alert("Failed to post delivery. Please try again.")
    } finally {
      setPosting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deliveryFee' ? parseInt(value) || 50 : value
    }))
  }

  const pendingTrips = trips?.filter((trip: any) => trip.status === "pending") || []
  const activeTrips = trips?.filter((trip: any) => trip.status === "accepted") || []
  const completedTrips = trips?.filter((trip: any) => trip.status === "completed") || []

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">RiderGo</h1>
                <p className="text-sm text-gray-500">Welcome back, {profile?.name || user.phone}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{pendingTrips.length}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">In Transit</dt>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                    <dd className="text-lg font-medium text-gray-900">{completedTrips.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Delivery Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Need to deliver something?</h3>
                <p className="mt-1 text-sm text-gray-600">Post your delivery request and get instant service</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Post Delivery
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Post New Delivery</h3>
              <form onSubmit={handlePostDelivery} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      id="pickupLocation"
                      name="pickupLocation"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter pickup address"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700">
                      Delivery Location
                    </label>
                    <input
                      type="text"
                      id="deliveryLocation"
                      name="deliveryLocation"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter destination address"
                      value={formData.deliveryLocation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">
                      Item Type
                    </label>
                    <select
                      id="itemType"
                      name="itemType"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.itemType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select item type</option>
                      <option value="documents">Documents</option>
                      <option value="small package">Small Package</option>
                      <option value="food">Food</option>
                      <option value="medicine">Medicine</option>
                      <option value="electronics">Electronics</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700">
                      Recipient Phone
                    </label>
                    <input
                      type="tel"
                      id="recipientPhone"
                      name="recipientPhone"
                      required
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0712345678"
                      value={formData.recipientPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Package Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the package (size, weight, special instructions, etc.)"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700">
                    Delivery Fee (KES)
                  </label>
                  <input
                    type="number"
                    id="deliveryFee"
                    name="deliveryFee"
                    min="50"
                    max="1000"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.deliveryFee}
                    onChange={handleInputChange}
                  />
                  <p className="mt-1 text-sm text-gray-500">Minimum fee: KES 50</p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={posting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {posting ? "Posting..." : `Post Delivery (KES ${formData.deliveryFee})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delivery History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Delivery History</h3>
            
            {tripsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : trips?.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0h-2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries yet</h3>
                <p className="mt-1 text-sm text-gray-500">Post your first delivery to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip: any) => (
                  <div key={trip._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{trip.itemType}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trip.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trip.status === 'completed' ? 'Delivered' :
                             trip.status === 'accepted' ? 'In Transit' :
                             'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{trip.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>From: {trip.pickupLocation?.address}</p>
                          <p>To: {trip.deliveryLocation?.address}</p>
                          <p>Fee: KES {trip.deliveryFee}</p>
                          {trip.rider && <p>Rider: {trip.rider.name} ({trip.rider.phone})</p>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(trip.createdAt).toLocaleDateString()} at {new Date(trip.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
