import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  Circle,
  Smile,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [message, setMessage] = useState('');

  const chats = [
    { 
      id: '1', 
      name: 'Sarah Chen', 
      role: 'Recruiter @ Stripe', 
      lastMsg: 'Your portfolio looks impressive! Are you free for a call tomorrow?', 
      time: '10:24 AM', 
      unread: true, 
      online: true 
    },
    { 
      id: '2', 
      name: 'Marcus Miller', 
      role: 'Engineering Manager @ Vercel', 
      lastMsg: 'Thanks for sending over the resume. We will review it.', 
      time: 'Yesterday', 
      unread: false, 
      online: false 
    },
    { 
      id: '3', 
      name: 'Elena Rodriguez', 
      role: 'Recruiter @ Airbnb', 
      lastMsg: 'The team loved the case study you shared.', 
      time: '2 days ago', 
      unread: false, 
      online: true 
    },
  ];

  const currentChat = chats.find(c => c.id === selectedChat);

  return (
    <div className="h-[calc(100vh-140px)] bg-brand-surface border border-brand-border rounded-radius-card shadow-sm overflow-hidden flex animate-in fade-in duration-700">
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-brand-border flex flex-col">
        <div className="p-4 border-b border-brand-border bg-brand-bg/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "p-4 border-b border-brand-bg cursor-pointer transition-all hover:bg-brand-bg/50 flex gap-3",
                selectedChat === chat.id ? "bg-brand-primary-light/30 border-r-4 border-r-brand-primary" : ""
              )}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success border-2 border-brand-surface rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-sm font-bold text-brand-text-main truncate">{chat.name}</h4>
                  <span className="text-[10px] text-brand-text-muted font-medium uppercase tracking-tight">{chat.time}</span>
                </div>
                <p className="text-[11px] text-brand-text-muted font-medium mb-1 truncate">{chat.role}</p>
                <p className={cn(
                  "text-[12px] truncate",
                  chat.unread ? "text-brand-text-main font-bold" : "text-brand-text-muted"
                )}>
                  {chat.lastMsg}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="flex-1 flex flex-col bg-brand-bg/10">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-brand-surface border-b border-brand-border flex items-center justify-between shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  {currentChat.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-success border-2 border-brand-surface rounded-full" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-text-main leading-tight">{currentChat.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Circle className={cn("w-2 h-2 fill-current", currentChat.online ? "text-brand-success" : "text-brand-text-muted")} />
                    <span className="text-[11px] font-medium text-brand-text-muted">
                      {currentChat.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-bg rounded-lg transition-all">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-bg rounded-lg transition-all">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-brand-text-muted hover:text-brand-text-main hover:bg-brand-bg rounded-lg transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center">
                <span className="px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">
                  Today
                </span>
              </div>

              {/* Received */}
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 mt-auto" />
                <div className="space-y-1">
                  <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl rounded-bl-none text-[13px] text-brand-text-main shadow-sm leading-relaxed">
                    Hello Jordan! I saw your recent update to your design system portfolio. The way you handled accessibility specs is fantastic. Are you currently open to new roles at Stripe?
                  </div>
                  <span className="text-[10px] text-brand-text-muted ml-1">10:20 AM</span>
                </div>
              </div>

              {/* Sent */}
              <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div className="space-y-1">
                  <div className="p-4 bg-brand-primary text-white rounded-2xl rounded-br-none text-[13px] shadow-md shadow-brand-primary/20 leading-relaxed">
                    Hi Sarah! Thank you so much for the kind words. Yes, I am exploring new opportunities where I can combine design systems and frontend development. I'd love to hear more about what Stripe is looking for.
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-brand-text-muted mr-1">10:22 AM &bull; Delivered</span>
                  </div>
                </div>
              </div>

              {/* Received Again */}
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 mt-auto" />
                <div className="space-y-1">
                  <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl rounded-bl-none text-[13px] text-brand-text-main shadow-sm leading-relaxed">
                    Wonderful! Your portfolio looks impressive. Are you free for a call tomorrow between 2 PM and 4 PM PST? I can send over a calendar invite.
                  </div>
                  <span className="text-[10px] text-brand-text-muted ml-1">10:24 AM</span>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-brand-surface border-t border-brand-border">
              <div className="flex items-end gap-2 bg-brand-bg rounded-2xl p-2 border border-brand-border focus-within:border-brand-primary/50 transition-all">
                <div className="flex gap-1 pb-1 px-1">
                  <button className="p-1.5 text-brand-text-muted hover:text-brand-primary transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-brand-text-muted hover:text-brand-primary transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <textarea 
                  rows={1}
                  placeholder="Type your message here..."
                  className="flex-1 bg-transparent border-none outline-none py-1.5 px-2 text-[13px] text-brand-text-main resize-none min-h-[38px] max-h-32"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex gap-1 pb-1 px-1">
                  <button className="p-1.5 text-brand-text-muted hover:text-brand-primary transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-brand-text-main mb-1">Select a Message</h3>
            <p className="text-brand-text-muted max-w-xs">
              Choose a conversation from the sidebar to chat with recruiters and managers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
