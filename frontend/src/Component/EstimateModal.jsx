import React from 'react'
import ReactDOM from 'react-dom'

function formatINR(n) {
    return '₹' + n.toString()
}

function EstimateModal({ landMark, city, onClose }) {
    if (!landMark && !city) return null

    const dest = encodeURIComponent(`${landMark}, ${city}`)

    // simple per-km rates (approx)
    const rates = {
        auto: 10, // ₹/km
        rapido: 8, // ₹/km (bike)
        cab: 15 // ₹/km
    }

    // distance scenarios in km (base values)
    const baseScenarios = [
        { label: 'Short (0-3 km)', km: 2 },
        { label: 'Medium (3-10 km)', km: 6 },
        { label: 'Long (10-30 km)', km: 18 }
    ]

    // Determine a city multiplier to reflect higher fares in big cities and lower in villages/small towns
    const getCityMultiplier = (c) => {
        if (!c) return 1
        const name = c.toLowerCase()
        const major = ['mumbai','delhi','bangalore','bengaluru','kolkata','chennai','hyderabad','pune','gurgaon','noida','jaipur','patna','imphal']
        const medium = ['lucknow','kanpur','nagpur','vadodara','surat','vadodara','coimbatore','thiruvananthapuram']
        if (major.includes(name)) return 1.35 // higher fares in major metros
        if (medium.includes(name)) return 1.15 // slightly higher in medium cities
        // default: small town / village
        return 0.85
    }

    const cityMultiplier = getCityMultiplier(city)

    // apply multiplier to scenarios to compute effective kms (keeps base scenarios but adjusts fare)
    const scenarios = baseScenarios.map(s => ({ ...s, effectiveKm: Math.max(1, Math.round(s.km * cityMultiplier)) }))

    const buildDirectionsUrl = (from) => {
        const origin = encodeURIComponent(`${from}, ${city}`)
        return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
    }

    const modal = (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60' onClick={onClose}>
            <div className='w-[92%] md:w-[720px] h-[480px] bg-white rounded-lg overflow-auto shadow-xl' onClick={(e)=>e.stopPropagation()}>
                <div className='flex items-center justify-between p-4 border-b'>
                    <div className='text-lg font-semibold'>Estimated fares to {landMark}, {city}</div>
                    <div>
                        <button onClick={onClose} className='px-3 py-1 rounded bg-[#ef4444] text-white hover:opacity-90'>Close</button>
                    </div>
                </div>

                <div className='p-4 grid grid-cols-1 gap-4'>
                    <p className='text-sm text-gray-600'>These are approximate fare estimates for common ride options. For exact distance and duration, click "Open Directions" which will open Google Maps where you can get precise routing and live fare estimates.</p>

                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='border rounded p-3'>
                            <div className='font-semibold mb-2'>From nearest Railway Station</div>
                            <a className='inline-block mb-3 text-sm text-blue-600 underline' href={buildDirectionsUrl('Nearest railway station')} target='_blank' rel='noreferrer'>Open Directions</a>
                            <div className='space-y-2'>
                                {scenarios.map(s => (
                                    <div key={s.label} className='flex items-center justify-between'>
                                        <div className='text-sm text-gray-700'>{s.label}</div>
                                        <div className='text-sm font-medium'>
                                            <span className='mr-3'>Auto: {formatINR(Math.round(rates.auto * s.effectiveKm))}</span>
                                            <span className='mr-3'>Rapido: {formatINR(Math.round(rates.rapido * s.effectiveKm))}</span>
                                            <span>Cab: {formatINR(Math.round(rates.cab * s.effectiveKm))}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='border rounded p-3'>
                            <div className='font-semibold mb-2'>From nearest Airport</div>
                            <a className='inline-block mb-3 text-sm text-blue-600 underline' href={buildDirectionsUrl('Nearest airport')} target='_blank' rel='noreferrer'>Open Directions</a>
                            <div className='space-y-2'>
                                {scenarios.map(s => (
                                    <div key={s.label} className='flex items-center justify-between'>
                                        <div className='text-sm text-gray-700'>{s.label}</div>
                                        <div className='text-sm font-medium'>
                                            <span className='mr-3'>Auto: {formatINR(Math.round(rates.auto * s.km))}</span>
                                            <span className='mr-3'>Rapido: {formatINR(Math.round(rates.rapido * s.km))}</span>
                                            <span>Cab: {formatINR(Math.round(rates.cab * s.km))}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='text-xs text-gray-500'>Note: Actual fares vary by provider, time of day, traffic, and route. Use "Open Directions" to view the route and get live distance/duration; use these values only as a quick approximation.</div>
                </div>
            </div>
        </div>
    )

    if (typeof document === 'undefined') return null
    return ReactDOM.createPortal(modal, document.body)
}

export default EstimateModal
