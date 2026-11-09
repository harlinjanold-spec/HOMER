import React, { useState } from 'react';
import { X, Bot, Send, User, AlertTriangle } from 'lucide-react';
import { Patient } from '../types';

interface AssistiveRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  heartRate: number;
  onRequestCaregiver: () => void;
  onTriggerSOS: () => void;
}

interface Message {
  sender: 'robot' | 'user';
  text: string;
}

export const AssistiveRobotModal: React.FC<AssistiveRobotModalProps> = ({
  isOpen,
  onClose,
  patient,
  heartRate,
  onRequestCaregiver,
  onTriggerSOS,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'robot',
      text: `Hello ${patient.name.split(' ')[0]}! I am your Ward Zero Home Assistant. How can I assist your health and comfort today?`,
    },
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text: q }];
    setInput('');

    // Generate responsive simulated health answers
    const lower = q.toLowerCase();
    let reply = "I understand. I've noted this in your home health record.";

    if (lower.includes('vital') || lower.includes('heart') || lower.includes('pulse')) {
      reply = `Your heart rate is currently ${heartRate} BPM from your Smart Home Dress, which is right in your normal baseline range (${patient.baseline_hr_min} - ${patient.baseline_hr_max} BPM).`;
    } else if (lower.includes('medication') || lower.includes('pill')) {
      reply = `Your next scheduled dose is Lisinopril 10mg at your kitchen Smart Pillbox. Don't forget to take it with a glass of water!`;
    } else if (lower.includes('water') || lower.includes('drink') || lower.includes('thirst')) {
      reply = `Your Smart Water Bottle shows you've had 1,850 ml today. You are very close to your 2,000 ml daily recovery target!`;
    } else if (lower.includes('caregiver') || lower.includes('nurse')) {
      reply = `I have contacted your lead virtual nurse, Priya Sharma, RN. She has received your notification at the Command Centre.`;
      onRequestCaregiver();
    } else if (lower.includes('fall') || lower.includes('emergency') || lower.includes('help') || lower.includes('pain')) {
      reply = `Activating immediate emergency priority protocol! Audio channel opened to Virtual Nurse Station.`;
      onTriggerSOS();
    }

    setTimeout(() => {
      setMessages([...newMsgs, { sender: 'robot', text: reply }]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl p-5 text-slate-100 flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Assistive AI Robot Companion</h3>
              <p className="text-[10px] text-purple-400 font-mono">Ward Zero Voice Agent • Active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-slate-950 rounded-xl border border-slate-800 mb-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'robot' && (
                <div className="w-6 h-6 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 text-[10px] flex-shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 text-[10px]">
          <button
            onClick={() => handleSend('How are my vitals?')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
          >
            📊 Check Vitals
          </button>
          <button
            onClick={() => handleSend('When is my next pill?')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
          >
            💊 Medication
          </button>
          <button
            onClick={() => handleSend('Request caregiver visit')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-700"
          >
            👩‍⚕️ Nurse Call
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your assistant anything..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

