'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader } from 'lucide-react'

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setLoading(false)
        }
      } catch (error) {
        console.error('Camera access denied:', error)
        onClose()
      }
    }

    initializeCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <Loader className="text-white animate-spin" size={40} />
          </div>
        )}

        <div className="absolute inset-4 border-2 border-primary rounded-lg pointer-events-none">
          <div className="absolute inset-0 animate-pulse border-2 border-primary rounded-lg" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-lg text-white transition-colors"
        >
          <X size={24} />
        </button>

        <p className="text-white text-center mt-4 text-sm">Align barcode within frame</p>
      </div>
    </div>
  )
}
