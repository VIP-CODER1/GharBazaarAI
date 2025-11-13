
import React from 'react'
import ReactDOM from 'react-dom'

function MapModal({ query, onClose }) {
    const encoded = encodeURIComponent(query || '')
    // Use maps query embed (no API key) as a lightweight solution
    const src = `https://www.google.com/maps?q=${encoded}&output=embed`

    const modal = (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60' onClick={onClose}>
            <div className='w-[92%] md:w-[80%] lg:w-[70%] h-[80%] bg-white rounded-lg overflow-hidden shadow-xl' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center justify-between p-3 border-b'>
                    <div className='font-semibold text-lg'>Live Location</div>
                    <div>
                        <button onClick={onClose} className='px-3 py-1 rounded bg-[#ef4444] text-white hover:opacity-90'>Close</button>
                    </div>
                </div>
                <div className='w-full h-[calc(100%-56px)]'>
                    <iframe title='map' src={src} className='w-full h-full' frameBorder='0' allowFullScreen></iframe>
                </div>
            </div>
        </div>
    )

    if (typeof document === 'undefined') return null

    return ReactDOM.createPortal(modal, document.body)
}

export default MapModal
