import React, { useState, useContext } from 'react'
import axios from 'axios'
import { authDataContext } from '../Context/AuthContext'

export default function Chatbot() {
  const { serverUrl } = useContext(authDataContext)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await axios.post((serverUrl || '') + '/api/ai/chat', {
        message: text,
        history: messages
      }, { withCredentials: true })
      const reply = res?.data?.reply || 'Sorry, something went wrong.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      const errMsg = e?.response?.data?.message || e?.message || 'Network error. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg"
      >
        {open ? 'Close Chat' : 'Chat'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-blue-600 text-white font-semibold">GharBazaar Assistant</div>
          <div className="p-3 h-80 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={m.role === 'user' ? 'inline-block bg-blue-600 text-white px-3 py-2 rounded-lg' : 'inline-block bg-white text-gray-800 px-3 py-2 rounded-lg border'}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500">Typing…</div>}
          </div>
          <div className="p-3 flex gap-2 bg-white border-t">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="Ask about listings, areas, pricing…"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg">Send</button>
          </div>
        </div>
      )}
    </>
  )
}


