'use client'

import { FragmentMetadata } from '@/lib/content'
import { useState } from 'react'

function LocationIcon({ className = "inline-block w-4 h-4 mr-1 -mt-0.5" }) {
  // A more "drop-like" location pin icon
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 21s7-7.434 7-12A7 7 0 1 0 5 9c0 4.566 7 12 7 12z"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <circle
        cx="12"
        cy="9"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  )
}

export default function Fragments({ fragments }: { fragments: FragmentMetadata[] }) {
  const [selectedFragment, setSelectedFragment] = useState<FragmentMetadata | null>(null)

  const openModal = (fragment: FragmentMetadata) => {
    setSelectedFragment(fragment)
  }

  const closeModal = () => {
    setSelectedFragment(null)
  }

  return (
    <>
      <section className="pb-24 pt-30">
        <div
          className="
            container
            mx-auto
            max-w-6xl
            space-y-2
            columns-1
            sm:columns-2
            md:columns-3
            lg:columns-4
            gap-4
          "
        >
          {fragments.map((el) => (
            <div
              key={el.slug}
              className="relative group rounded-md overflow-hidden mb-4 break-inside-avoid border border-gray-200 cursor-pointer"
              onClick={() => openModal(el)}
            >
              <img
                src={el.image}
                alt={el.title}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-full flex flex-col items-start">
                  <span
                    className={
                      "text-white text-lg font-semibold w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" +
                      (el.location ? " px-4 pt-4 pb-1" : " p-4")
                    }
                  >
                    {el.title}
                  </span>
                  {el.location && (
                    <span className="text-white text-sm font-normal px-4 pb-4 pt-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                      <LocationIcon />
                      {el.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedFragment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedFragment.image}
              alt={selectedFragment.title}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold">{selectedFragment.title}</h3>
              {selectedFragment.location && (
                <div className="text-white text-base font-normal mt-1 flex items-center">
                  <LocationIcon className="inline-block w-5 h-5 mr-2 -mt-0.5" />
                  {selectedFragment.location}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 