import React, { useContext, useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import { RiAiGenerate } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { MdWhatshot } from "react-icons/md";
import { GiFamilyHouse } from "react-icons/gi";
import { MdBedroomParent } from "react-icons/md";
import { MdOutlinePool } from "react-icons/md";
import { GiWoodCabin } from "react-icons/gi";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { IoBedOutline } from "react-icons/io5";
import { FaK, FaTreeCity } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import { authDataContext } from '../Context/AuthContext';
import axios from 'axios';
import { userDataContext } from '../Context/UserContext';
import { listingDataContext } from '../Context/ListingContext';
import SuggestModal from './SuggestModal';

function Nav() {
    let [showpopup,setShowpopup]= useState(false)
    let {userData ,setUserData}= useContext(userDataContext)
    let navigate = useNavigate()
    let {serverUrl} = useContext(authDataContext)
    let [cate,setCate]= useState()
    let {listingData,setListingData,setNewListData,newListData,searchData,setSearchData,handleSearch,handleViewCard}=useContext(listingDataContext)
    let [input,setInput]=useState("")
    const [showSuggest, setShowSuggest] = useState(false);
    const [showSuggestInput, setShowSuggestInput] = useState(false);
    const [suggestQuery, setSuggestQuery] = useState("")
    const [showSuggestHighlight, setShowSuggestHighlight] = useState(false)
    const [showSummarizeHighlight, setShowSummarizeHighlight] = useState(false)
    const [summary, setSummary] = useState({ loading: false, text: '', error: '' });
    const [showSummaryModal, setShowSummaryModal] = useState(false);


    const popupRef = useRef(null);

    const handleLogOut = async () => {
        try {
            await axios.post((serverUrl || "") + "/api/auth/logout", {}, {
                withCredentials: true
            });
            setUserData(null);
            setInput("");
            setSearchData([]);
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }

    const handleCategory = (category)=>{
       setCate(category)
       if(category=="trending"){
        setNewListData(listingData)
       }
       else{
       setNewListData(listingData.filter((list)=>list.category==category))}
    }

    const handleSummarizeClick = async () => {
        setShowSummaryModal(true);
        setSummary({ loading: true, text: '', error: '' });

        try {
            // Send the current category to the backend for summarization
            const res = await axios.post(`${serverUrl}/api/ai/summarize`, { category: cate || "trending" });
            setSummary({ loading: false, text: res.data.summary, error: '' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Could not generate summary.";
            setSummary({ loading: false, text: '', error: errorMessage });
        }
    };

    const handleClick = (id) => {
        if (userData) {
            handleViewCard(id)
        }
        else {
            navigate("/login")
        }
    }

    const handleAddYourHomeClick = () => {
        if (userData) {
            navigate("/listingpage1");
        } else {
            navigate("/login");
        }
        setShowpopup(false);
    };

    useEffect(()=>{
      handleSearch(input)
    },[input])

    // On first visit highlight Suggest and Summarize buttons
    useEffect(()=>{
        try{
            const seenSuggest = localStorage.getItem('seen_suggest')
            const seenSummarize = localStorage.getItem('seen_summarize')
            setShowSuggestHighlight(!seenSuggest)
            setShowSummarizeHighlight(!seenSummarize)
        }catch(e){
            // ignore localStorage errors
        }
    },[])

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowpopup(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupRef]);

    const closeSummaryModal = () => {
        setShowSummaryModal(false);
        setShowSummarizeHighlight(false);
    try { localStorage.setItem('seen_summarize','1'); } catch (err) { if (import.meta.env.DEV) console.warn('localStorage write failed', err); }
    }

    const handleSuggestClose = () => {
        setShowSuggest(false);
        setShowSuggestHighlight(false);
    try { localStorage.setItem('seen_suggest','1'); } catch (err) { if (import.meta.env.DEV) console.warn('localStorage write failed', err); }
    }

    return (
        <div className='fixed top-0 bg-[#48c6c6] z-[20]'>
            <div className='w-[100vw] min-h-[45px] border-b-[1px] border-[#dcdcdc] px-[12px] flex items-center justify-between md:px-[40px] md:min-h-[60px]'>
                <div><img src={logo} alt="" className='w-[70px] md:w-[100px]' /></div>

                <div className='w-[35%] relative hidden md:block'>
                    <input type="text" className='w-[100%] px-[20px] py-[8px] border-[2px] border-[#bdbaba] outline-none overflow-auto rounded-[30px] text-[15px]' placeholder='Any Where  |  Any Location  |  Any City ' onChange={(e)=>setInput(e.target.value)} value={input}/>
                    <button className='absolute p-[8px] rounded-[50px] bg-[red] right-[3%] top-[4px]'><FiSearch className='w-[18px] h-[18px] text-[white]' /></button>
                </div>
                <div className='flex items-center justify-center gap-[8px] md:gap-[10px] relative' ref={popupRef}>
                    <span className='text-[14px] md:text-[16px] cursor-pointer rounded-[50px] hover:bg-[#ff6b6b] px-[8px] py-[4px] hidden md:block' onClick={handleAddYourHomeClick}>Add your home</span>
                    <button
                        className={`px-4 py-2 bg-amber-500 text-white rounded-full text-[15px] md:text-[16px] font-semibold shadow-lg flex items-center gap-3 hover:scale-105 transform transition-all duration-150 ring-4 ring-amber-200 animate-pulse hover:animate-none mr-3 ${showSummarizeHighlight ? '' : 'hover:bg-amber-600'}`}
                        onClick={() => { handleSummarizeClick() }}
                        aria-label="AI Summarize listings"
                    >
                        <RiAiGenerate className='w-5 h-5 text-white' />
                        <span>Summarize</span>
                        {showSummarizeHighlight && (
                            <span className='absolute -top-2 -right-2 bg-white text-amber-600 text-[12px] px-2.5 py-[3px] rounded-full shadow-sm'>New</span>
                        )}
                    </button>

                    <button
                        onClick={()=>{
                            // if there's already text in header input, open suggestions directly
                            if(input && input.trim().length>0){ setSuggestQuery(input); setShowSuggest(true)}
                            else { setShowSuggestInput(true) }
                        }}
                        className={`px-4 py-2 bg-amber-500 text-white rounded-full text-[15px] md:text-[16px] font-semibold shadow-lg flex items-center gap-3 hover:scale-105 transform transition-all duration-150 ring-4 ring-amber-200 animate-pulse hover:animate-none mr-3 ${showSuggestHighlight ? '' : 'hover:bg-amber-600'}`}
                        aria-label="Suggest listings"
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h4l3 6 4-12 3 6h4' />
                        </svg>
                        <span>Suggest</span>
                        {showSuggestHighlight && (
                            <span className='absolute -top-2 -right-2 bg-white text-amber-600 text-[12px] px-2.5 py-[3px] rounded-full shadow-sm'>New</span>
                        )}
                    </button>
                    <button className='px-[10px] py-[5px] md:px-[15px] md:py-[8px] flex items-center justify-center gap-[4px] md:gap-[5px] border-[1px] border-[#8d8c8c] rounded-[50px] hover:shadow-lg' onClick={()=>setShowpopup(prev =>!prev)}>
                        {showSuggest && <SuggestModal query={suggestQuery || input} listings={listingData} onClose={handleSuggestClose} onView={(id)=>{handleViewCard(id); handleSuggestClose();}} />}

                    {showSuggestInput && (
                        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50' onClick={()=>setShowSuggestInput(false)}>
                            <div className='w-[90%] max-w-[480px] bg-white rounded-lg p-4' onClick={e=>e.stopPropagation()}>
                                <div className='flex items-center justify-between mb-3'>
                                    <div className='text-lg font-semibold'>Find suggestions</div>
                                    <button onClick={()=>setShowSuggestInput(false)} className='text-xl'>&times;</button>
                                </div>
                                <div className='mb-3'>
                                    <input value={suggestQuery} onChange={(e)=>setSuggestQuery(e.target.value)} className='w-full p-2 border rounded-md' placeholder='Enter city, landmark or area (e.g., Patna, Mahaveer Nagar)' />
                                </div>
                                <div className='flex justify-end gap-2'>
                                    <button onClick={()=>{ setShowSuggestInput(false); }} className='px-3 py-1 bg-gray-200 rounded'>Cancel</button>
                                    <button onClick={()=>{ if(suggestQuery && suggestQuery.trim().length>0){ setShowSuggestInput(false); setShowSuggest(true)} }} className='px-3 py-1 bg-emerald-500 text-white rounded'>Search</button>
                                </div>
                            </div>
                        </div>
                    )}
                        <span><GiHamburgerMenu className='w-[15px] h-[15px] md:w-[18px] md:h-[18px]' /></span>
                        {userData == null && <span><CgProfile className='w-[16px] h-[16px] md:w-[20px] md:h-[20px]' /></span>}
                        {userData != null && <span className='w-[20px] h-[20px] md:w-[25px] md:h-[25px] bg-[#080808] text-[white] rounded-full flex items-center justify-center text-[13px] md:text-[16px]'>{userData?.name.slice(0,1)}</span>}
                    </button>
                    {showpopup && <div className='w-[180px] md:w-[220px] h-[250px] absolute bg-slate-50 top-[110%] right-[3%] border-[1px] border-[#aaa9a9] z-10 rounded-lg md:right-[10%]'>
                        <ul className='w-[100%] h-[100%] text-[13px] md:text-[16px] flex items-start justify-around flex-col py-[8px] md:py-[10px]'>
                            {!userData && <li className='w-[100%] px-[12px] py-[6px] md:px-[15px] md:py-[8px] hover:bg-[#ff6b6b] hover:text-white transition-colors duration-200 cursor-pointer' onClick={()=>{navigate("/login");setShowpopup(false)}}>Login</li>}
                            {userData && <li className='w-[100%] px-[12px] py-[6px] md:px-[15px] md:py-[8px] hover:bg-[#ff6b6b] hover:text-white transition-colors duration-200 cursor-pointer' onClick={()=>{handleLogOut();setShowpopup(false)}}>Logout</li>}
                            <div className='w-[100%] h-[1px] bg-[#c1c0c0]'></div>
                            <li className='w-[100%] px-[12px] py-[6px] md:px-[15px] md:py-[8px] hover:bg-[#ff6b6b] hover:text-white transition-colors duration-200 cursor-pointer' onClick={handleAddYourHomeClick}>List your Home</li>
                            <li className='w-[100%] px-[12px] py-[6px] md:px-[15px] md:py-[8px] hover:bg-[#ff6b6b] hover:text-white transition-colors duration-200 cursor-pointer' onClick={()=>{navigate("/mylisting");setShowpopup(false)}}>My Listing</li>
                            <li className='w-[100%] px-[12px] py-[6px] md:px-[15px] md:py-[8px] hover:bg-[#ff6b6b] hover:text-white transition-colors duration-200 cursor-pointer' onClick={()=>{navigate("/mybooking");setShowpopup(false)}}>MY Booking</li>
                        </ul>
                    </div>}
                </div>
                {searchData?.length>0 && <div className='w-[100vw] h-[450px] flex flex-col gap-[20px] absolute top-[50%] overflow-auto left-[0] justify-start items-center'>
                    <div className='max-w-[700px] w-[100vw] h-[300px] overflow-hidden flex flex-col bg-[#fefdfd] p-[20px] rounded-lg border-[1px] border-[#a2a1a1] cursor-pointer'>
                        {searchData.map((search)=>(
                            <div className='border-b border-[black] p-[10px]' onClick={()=>handleClick(search._id)}>
                                {search.title} in {search.landMark},{search.city}
                            </div>
                        ))}
                    </div>
                </div>}

                {showSummaryModal && (
                    <div className='w-full h-full fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50' onClick={() => closeSummaryModal()}>
                        <div className='bg-white rounded-lg p-6 w-11/12 max-w-lg relative text-gray-800' onClick={(e) => e.stopPropagation()}>
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-xl font-bold flex items-center gap-2'><RiAiGenerate /> AI Summary</h2>
                                    <button onClick={() => closeSummaryModal()} className='text-2xl'>&times;</button>
                            </div>
                            <div>
                                {summary.loading && <p className='animate-pulse'>Generating summary...</p>}
                                {summary.error && <p className='text-red-600'>{summary.error}</p>}
                                {summary.text && <p className='text-base leading-relaxed'>{summary.text}</p>}
                            </div>
                            <div className='mt-6 text-right'>
                                <button onClick={() => closeSummaryModal()} className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='w-[100%] h-[35px] md:h-[50px] flex items-center justify-center md:hidden'>
                <div className='w-[85%] relative'>
                    <input type="text" className='w-[100%] px-[12px] py-[5px] md:px-[20px] md:py-[8px] border-[2px] border-[#bdbaba] outline-none overflow-auto rounded-[30px] text-[12px] md:text-[15px]' placeholder='Any Where  |  Any Location  |  Any City ' onChange={(e)=>setInput(e.target.value)} value={input} />
                    <button className='absolute p-[5px] md:p-[8px] rounded-[50px] bg-[red] right-[3%] top-[4px]'><FiSearch className='w-[14px] h-[14px] md:w-[18px] md:h-[18px] text-[white]' /></button>
                </div>
            </div>

            <div className='w-[100vw] h-[45px] md:h-[65px] bg-[#48c6c6] flex items-center justify-start cursor-pointer gap-[15px] md:gap-[30px] overflow-auto md:justify-center px-[8px] md:px-[15px]'>
                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${!cate || cate === "trending" ? "border-b-[1px] border-[#a6a5a5]" : ""}`} onClick={() => handleCategory("trending")}>
                    <MdWhatshot className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Trending</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="villa"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("villa")}>
                    <GiFamilyHouse className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Villa</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="farmHouse"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("farmHouse")}>
                    <FaTreeCity className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Farm House</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="poolHouse"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("poolHouse")}>
                    <MdOutlinePool className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Pool House</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="rooms"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("rooms")}>
                    <MdBedroomParent className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Rooms</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="flat"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("flat")}>
                    <BiBuildingHouse className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Flat</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="pg"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("pg")}>
                    <IoBedOutline className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>PG</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="cabin"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("cabin")}>
                    <GiWoodCabin className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Cabins</h3>
                </div>

                <div className={`flex items-center justify-center flex-col hover:border-b-[1px] border-[#a6a5a5] text-[10px] md:text-[12px] ${cate=="shops"?"border-b-[1px] border-[#a6a5a5]":""}`} onClick={()=>handleCategory("shops")}>
                    <SiHomeassistantcommunitystore className='w-[18px] h-[18px] md:w-[25px] md:h-[25px] text-black' />
                    <h3>Shops</h3>
                </div>
            </div>
        </div>
    )
}

export default Nav