import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthStore } from '@/store/authStore'
import { locations } from '@/data/locations'

// Stable fake visitor self-registration URL per location
function getVisitorUrl(locationId: string) {
  return `https://visit.gmmco.in/register?loc=${locationId}`
}

export default function QRCodePage() {
  const { currentLocationId } = useAuthStore()
  const navigate = useNavigate()
  const [selectedLocationId, setSelectedLocationId] = useState(currentLocationId)
  const [locationOpen, setLocationOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const selectedLocation = locations.find((l) => l.id === selectedLocationId) ?? locations[0]
  const visitorUrl = getVisitorUrl(selectedLocation.id)

  function handleCopyLink() {
    navigator.clipboard.writeText(visitorUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handlePrint() {
    window.print()
  }

  return (
    <>
      {/* Print-only styles — isolates just the QR panel */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #qr-print-root { display: flex !important; }
        }
        #qr-print-root { display: none; }
      `}</style>

      {/* Hidden print-only element */}
      <div id="qr-print-root" className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white p-10 z-[9999]">
        <QRCodeSVG value={visitorUrl} size={280} level="H" />
        <p className="text-base font-semibold text-gray-900">{selectedLocation.name}</p>
        <p className="text-sm text-gray-500">{visitorUrl}</p>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:flex flex-col h-full">
        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 px-6 py-3 bg-white border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors -ml-1"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <h2 className="text-sm font-medium text-text-primary">Location QR Code</h2>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 bg-surface-secondary/30">
          <div className="bg-white rounded-2xl border border-border shadow-sm w-full max-w-md p-8 flex flex-col items-center gap-6">
            {/* Location selector */}
            <div className="w-full relative">
              <p className="text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wide">Location</p>
              <button
                onClick={() => setLocationOpen((o) => !o)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-secondary transition-colors text-left"
              >
                <i className="ri-map-pin-2-fill text-text-tertiary text-sm shrink-0" />
                <span className="flex-1 text-sm font-medium text-text-primary truncate">{selectedLocation.name}</span>
                <i className={`ri-arrow-down-s-line text-text-tertiary text-base shrink-0 transition-transform duration-150 ${locationOpen ? 'rotate-180' : ''}`} />
              </button>
              {locationOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-20">
                  {locations.map((loc, i) => (
                    <button
                      key={loc.id}
                      onClick={() => { setSelectedLocationId(loc.id); setLocationOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-secondary ${i > 0 ? 'border-t border-border-light' : ''}`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${loc.id === selectedLocationId ? 'bg-brand/10' : 'bg-surface-secondary'}`}>
                        <i className={`ri-building-2-line text-sm ${loc.id === selectedLocationId ? 'text-brand' : 'text-text-tertiary'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${loc.id === selectedLocationId ? 'text-brand' : 'text-text-primary'}`}>{loc.name}</p>
                        <p className="text-xs text-text-tertiary truncate">{loc.address}</p>
                      </div>
                      {loc.id === selectedLocationId && <i className="ri-check-line text-brand text-sm shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QR code */}
            <div ref={qrRef} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-surface-secondary/50 border border-border-light w-full">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-border-light">
                <QRCodeSVG value={visitorUrl} size={200} level="H" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-text-secondary">{selectedLocation.name}</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">{selectedLocation.address}</p>
              </div>
            </div>

            {/* URL */}
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-secondary border border-border-light">
              <i className="ri-link text-text-tertiary text-sm shrink-0" />
              <span className="flex-1 text-xs text-text-secondary font-mono truncate">{visitorUrl}</span>
            </div>

            {/* Actions */}
            <div className="w-full flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium text-text-primary bg-white hover:bg-surface-secondary transition-colors"
              >
                <i className={copied ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} />
                <span className={copied ? 'text-green-600' : ''}>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                <i className="ri-printer-line" />
                Print QR Code
              </button>
            </div>

            <p className="text-xs text-text-tertiary text-center -mt-2">
              Visitors scan this code to self-register their visit
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="flex md:hidden flex-col h-full bg-white">
        {/* Back header */}
        <header className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1"
          >
            <i className="ri-arrow-left-line text-xl" />
          </button>
          <h1 className="text-sm font-semibold text-text-primary">Location QR Code</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-10 flex flex-col gap-5">
          {/* Location selector */}
          <div className="relative">
            <p className="text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wide">Location</p>
            <button
              onClick={() => setLocationOpen((o) => !o)}
              className="w-full flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-white active:bg-surface-secondary transition-colors text-left"
            >
              <i className="ri-map-pin-2-fill text-text-tertiary text-sm shrink-0" />
              <span className="flex-1 text-sm font-medium text-text-primary truncate">{selectedLocation.name}</span>
              <i className={`ri-arrow-down-s-line text-text-tertiary text-base shrink-0 transition-transform duration-150 ${locationOpen ? 'rotate-180' : ''}`} />
            </button>
            {locationOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-20">
                {locations.map((loc, i) => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelectedLocationId(loc.id); setLocationOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors active:bg-surface-secondary ${i > 0 ? 'border-t border-border-light' : ''}`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${loc.id === selectedLocationId ? 'bg-brand/10' : 'bg-surface-secondary'}`}>
                      <i className={`ri-building-2-line text-sm ${loc.id === selectedLocationId ? 'text-brand' : 'text-text-tertiary'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${loc.id === selectedLocationId ? 'text-brand' : 'text-text-primary'}`}>{loc.name}</p>
                      <p className="text-xs text-text-tertiary truncate">{loc.address}</p>
                    </div>
                    {loc.id === selectedLocationId && <i className="ri-check-line text-brand text-sm shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center gap-4 p-5 rounded-2xl bg-surface-secondary/50 border border-border-light">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-border-light">
              <QRCodeSVG value={visitorUrl} size={200} level="H" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">{selectedLocation.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{selectedLocation.address}</p>
            </div>
          </div>

          {/* URL */}
          <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-surface-secondary border border-border-light">
            <i className="ri-link text-text-tertiary text-sm shrink-0" />
            <span className="flex-1 text-xs text-text-secondary font-mono truncate">{visitorUrl}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm font-medium text-text-primary bg-white active:bg-surface-secondary transition-colors"
            >
              <i className={copied ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} />
              <span className={copied ? 'text-green-600' : ''}>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-brand text-white text-sm font-medium active:bg-brand/90 transition-colors"
            >
              <i className="ri-printer-line" />
              Print
            </button>
          </div>

          <p className="text-xs text-text-tertiary text-center">
            Visitors scan this code to self-register their visit
          </p>
        </div>
      </div>
    </>
  )
}
