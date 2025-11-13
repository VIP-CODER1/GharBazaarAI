import React, { useContext } from 'react'
import { userDataContext } from '../Context/UserContext'
import { listingDataContext } from '../Context/ListingContext'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { FcCancel } from "react-icons/fc";
import { useState } from 'react';
import MapModal from './MapModal'
import EstimateModal from './EstimateModal'
import { bookingDataContext } from '../Context/BookingContext';

function Card({ title, landMark, image1, image2, image3, rent, city, id, ratings, isBooked, host }) {
    let navigate = useNavigate()
    let { userData } = useContext(userDataContext)
    let { handleViewCard } = useContext(listingDataContext)
    let [popUp, setPopUp] = useState(false)
    let {cancelBooking}=useContext(bookingDataContext)
    const handleClick = () => {
        if (userData) {
            handleViewCard(id)
        }
        else {
            navigate("/login")
        }
    }
    const [showMap, setShowMap] = useState(false)
    const [showEstimate, setShowEstimate] = useState(false)
    return (
        <div className='w-[330px] max-w-[85%] h-[460px] flex items-start justify-start flex-col rounded-lg cursor-pointer relative z-[10] ' onClick={() => !isBooked ? handleClick() : null}>

            {isBooked && <div className='text-[green] bg-white rounded-lg absolute flex items-center justify-center right-1 top-1 gap-[5px] p-[5px]'><GiConfirmed className='w-[20px] h-[20px] text-[green]' />Booked</div>}
            {isBooked && host == userData?._id && <div className='text-[red] bg-white rounded-lg absolute flex items-center justify-center right-1 top-[50px] gap-[5px] p-[5px]' onClick={()=>setPopUp(true)} ><FcCancel className='w-[20px] h-[20px]' />Cancel Booking</div>}

            {popUp && <div className='w-[300px] h-[100px]  bg-[#ffffffdf] absolute top-[110px] left-[13px] rounded-lg ' >
            <div className='w-[100%] h-[50%] text-[#2e2d2d] flex items-start justify-center rounded-lg overflow-auto text-[20px]  p-[10px]'>Booking Cancel!</div>
                <div className='w-[100%] h-[50%] text-[18px] font-semibold flex items-start justify-center gap-[10px] text-[#986b6b]'>Are you sure? <button className='px-[20px] bg-[red] text-[white] rounded-lg hover:bg-slate-600 ' onClick={()=>{cancelBooking(id);setPopUp(false)}}>Yes</button><button className='px-[10px] bg-[red] text-[white] rounded-lg hover:bg-slate-600' onClick={()=>setPopUp(false)}>No</button></div>
            </div>}
           
            <div className='w-[100%] h-[67%]  rounded-lg overflow-auto flex '>
                <img src={image1} alt="" className='w-[100%] flex-shrink-0' />
                <img src={image2} alt="" className='w-[100%] flex-shrink-0' />
                <img src={image3} alt="" className='w-[100%] flex-shrink-0' />

            </div>
            <div className=' w-[100%] h-[33%] py-[20px] flex flex-col gap-[2px]'>
                <div className='flex items-center justify-between text-[18px] '><span className='w-[80%] text-ellipsis overflow-hidden font-semibold text-nowrap text-[#4a3434]'>In {landMark.toUpperCase()},{city.toUpperCase()}</span>
                    <span className='flex items-center justify-center gap-[5px]'><FaStar className='text-[#eb6262]' />{ratings}</span>
                </div>
                <span className='text-[15px] w-[80%] text-ellipsis overflow-hidden text-nowrap'>{title.toUpperCase()} </span>
                <div className='flex items-center justify-between w-[100%]'>
                    <span className='text-[16px] font-semibold text-[#986b6b]'>₹{rent}/day</span>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowEstimate(true) }}
                            className='px-3 py-1 bg-emerald-500 text-white rounded-full text-[13px] font-semibold shadow-lg flex items-center gap-2 hover:scale-105 transform transition-all duration-150 ring-2 ring-emerald-200 animate-pulse hover:animate-none'
                            aria-label={`Estimate fares to ${landMark}, ${city}`}
                            title='Estimate fares from nearest station/airport'
                        >
                            <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h4l3 6 4-12 3 6h4' />
                            </svg>
                            <span>Estimate</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMap(true) }}
                            className='px-3 py-1 bg-[#06b6d4] text-white rounded-md text-[13px] font-semibold shadow-md flex items-center gap-2 hover:scale-105 transform transition-all duration-150'
                            aria-label={`View live location for ${landMark}, ${city}`}
                            title='View live location on map'
                        >
                            <FaMapMarkerAlt className='w-[14px] h-[14px]' />
                            <span>Map View</span>
                        </button>
                    </div>
                </div>
            </div>

            {showMap && <MapModal query={`${landMark}, ${city}`} onClose={() => setShowMap(false)} />}
            {showEstimate && <EstimateModal landMark={landMark} city={city} onClose={() => setShowEstimate(false)} />}

        </div>
    )
}

export default Card
