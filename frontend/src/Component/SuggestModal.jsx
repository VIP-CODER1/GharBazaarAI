import React from 'react'
import ReactDOM from 'react-dom'

function smallCard(listing, onView) {
    return (
        <div key={listing._id} className='flex items-center gap-3 p-2 border rounded'>
            <img src={listing.image1} alt='' className='w-16 h-12 object-cover rounded' />
            <div className='flex-1'>
                <div className='text-sm font-semibold truncate'>{listing.title}</div>
                <div className='text-xs text-gray-600'>{listing.landMark}, {listing.city}</div>
            </div>
            <div className='text-sm font-medium mr-2'>₹{listing.rent}/day</div>
            <button onClick={() => onView(listing._id)} className='px-2 py-1 bg-[#06b6d4] text-white rounded-md text-xs'>View</button>
        </div>
    )
}

function SuggestModal({ query, listings, onClose, onView }) {
    const q = (query || '').toLowerCase().trim()
    const matches = listings.filter(l => {
        if (!q) return false
        return (l.city || '').toLowerCase().includes(q) || (l.landMark || '').toLowerCase().includes(q) || (l.title || '').toLowerCase().includes(q)
    })

    const sortedByRent = [...matches].sort((a,b)=>Number(a.rent)-Number(b.rent))
    const cheap = sortedByRent.slice(0,3)
    const medianIndex = Math.floor(sortedByRent.length/2)
    const mediocre = sortedByRent.slice(Math.max(0, medianIndex-1), medianIndex+2)
    const best = [...matches].sort((a,b)=>Number(b.ratings||0)-Number(a.ratings||0)).slice(0,3)

    const modal = (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60' onClick={onClose}>
            <div className='w-[92%] md:w-[900px] max-h-[80vh] overflow-auto bg-white rounded-lg p-4' onClick={e=>e.stopPropagation()}>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold'>Suggested properties for "{query}"</h3>
                    <button onClick={onClose} className='px-3 py-1 rounded bg-[#ef4444] text-white'>Close</button>
                </div>

                {matches.length === 0 && <div className='text-sm text-gray-600'>No direct matches found for your query. Try a nearby city or more general location.</div>}

                {cheap.length>0 && (
                    <div className='mb-4'>
                        <div className='text-sm font-semibold mb-2'>Cheapest options</div>
                        <div className='grid gap-2'>{cheap.map(l => smallCard(l, onView))}</div>
                    </div>
                )}

                {mediocre.length>0 && (
                    <div className='mb-4'>
                        <div className='text-sm font-semibold mb-2'>Mid-range options</div>
                        <div className='grid gap-2'>{mediocre.map(l => smallCard(l, onView))}</div>
                    </div>
                )}

                {best.length>0 && (
                    <div className='mb-4'>
                        <div className='text-sm font-semibold mb-2'>Best rated options</div>
                        <div className='grid gap-2'>{best.map(l => smallCard(l, onView))}</div>
                    </div>
                )}
            </div>
        </div>
    )

    if (typeof document === 'undefined') return null
    return ReactDOM.createPortal(modal, document.body)
}

export default SuggestModal
