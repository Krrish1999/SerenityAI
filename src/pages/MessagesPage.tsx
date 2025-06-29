import React, { useEffect, useState } from 'react';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { Search, UserCircle, Info, ArrowLeft, Phone, Send, Paperclip } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const { 
    messages, 
    conversations, 
    currentConversation, 
    fetchMessages,
    fetchConversations,
    sendMessage,
    markAsRead,
    setCurrentConversation,
    isLoading 
  } = useMessageStore();
  
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchConversations(user.id);
    }
  }, [user, fetchConversations]);
  
  useEffect(() => {
    if (user && currentConversation) {
      fetchMessages(user.id, currentConversation);
      
      // Mark unread messages as read
      const unreadMessageIds = messages
        .filter(msg => msg.recipient_id === user.id && !msg.read)
        .map(msg => msg.id);
        
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [user, currentConversation, messages.length, fetchMessages, markAsRead]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && currentConversation && newMessage.trim()) {
      sendMessage(user.id, currentConversation, newMessage.trim());
      setNewMessage('');
    }
  };
  
  const handleSelectConversation = (partnerId: string) => {
    setCurrentConversation(partnerId);
  };
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentConversationInfo = conversations.find(
    conv => conv.id === currentConversation
  );

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] min-h-[700px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4 text-gray-600" />}
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-gray-600 hover:text-accent-teal flex items-center px-2 rounded-xl"
          >
            Back
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl h-full flex border border-gray-200 shadow-md">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header with title and tabs */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Messages</h1>
            <div className="flex border-b border-gray-200 -mb-px">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 rounded-t-lg ${
                  activeTab === 'chat'
                    ? 'text-accent-teal border-accent-teal bg-pastel-teal/10'
                    : 'text-gray-600 border-transparent hover:text-accent-teal hover:bg-gray-50'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('call')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ml-6 rounded-t-lg ${
                  activeTab === 'call'
                    ? 'text-accent-teal border-accent-teal bg-pastel-teal/10'
                    : 'text-gray-600 border-transparent hover:text-accent-teal hover:bg-gray-50'
                }`}
              >
                Call
              </button>
            </div>
          </div>

          {activeTab === 'chat' && (
            <>
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-neutral-light-gray border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-teal"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                </div>
              </div>
              
              {/* Conversations List */}
              <div className="overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="ml-3 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="p-2">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`w-full p-3 mb-2 rounded-lg text-left transition-all duration-200 ${
                          currentConversation === conversation.id
                            ? 'bg-pastel-teal/30 shadow-sm'
                            : 'bg-white hover:bg-neutral-light-gray'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0 shadow-sm">
                            {conversation.avatar_url ? (
                              <img
                                src={conversation.avatar_url}
                                alt={conversation.full_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getUserInitials(conversation.full_name)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 truncate">
                              {conversation.full_name}
                            </h4>
                            {conversation.lastMessage ? (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {conversation.lastMessage}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No messages yet</p>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-accent-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 shadow-sm">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No conversations found
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'call' && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="p-4 rounded-full bg-pastel-lavender shadow-sm w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-accent-teal" />
                </div>
                <h3 className="text-gray-800 font-medium mb-2">Voice Calls Coming Soon</h3>
                <p className="text-gray-600 text-sm max-w-[200px]">
                  Video and voice calling will be available in a future update.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side - Message Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation && activeTab === 'chat' ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center bg-neutral-light-gray/30">
                <div className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center text-white text-sm font-medium mr-3 shadow-sm">
                  {currentConversationInfo?.avatar_url ? (
                    <img
                      src={currentConversationInfo.avatar_url}
                      alt={currentConversationInfo.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(currentConversationInfo?.full_name || '')
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{currentConversationInfo?.full_name}</h3>
                  <p className="text-sm text-accent-teal">Online</p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-off-white">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse flex justify-end">
                      <div className="bg-gray-200 rounded-xl h-10 w-2/3"></div>
                    </div>
                    <div className="animate-pulse flex justify-start">
                      <div className="bg-gray-200 rounded-xl h-10 w-2/3"></div>
                    </div>
                    <div className="animate-pulse flex justify-end">
                      <div className="bg-gray-200 rounded-xl h-10 w-2/3"></div>
                    </div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      {message.sender_id === user?.id ? (
                        // User messages on the right
                        <div className="flex items-start justify-end space-x-3">
                          <div className="flex flex-col flex-1 items-end">
                            <div className="text-gray-700 text-sm font-medium mb-1">
                              You
                            </div>
                            <div className="chat-bubble-user">
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {format(new Date(message.created_at), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                            {user?.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.full_name} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getUserInitials(user?.full_name || 'User')
                            )}
                          </div>
                        </div>
                      ) : (
                        // Other person's messages on the left
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-sm">
                            {currentConversationInfo?.avatar_url ? (
                              <img 
                                src={currentConversationInfo.avatar_url} 
                                alt={currentConversationInfo.full_name} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getUserInitials(currentConversationInfo?.full_name || 'User')
                            )}
                          </div>
                          <div className="flex flex-col flex-1">
                            <div className="text-gray-700 text-sm font-medium mb-1">
                              {currentConversationInfo?.full_name}
                            </div>
                            <div className="chat-bubble-ai">
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                {format(new Date(message.created_at), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                      <div className="p-4 rounded-full bg-pastel-teal w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Info className="w-8 h-8 text-accent-teal" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No messages yet</h3>
                      <p className="text-gray-600 mb-6">
                        Send a message to start a conversation with {currentConversationInfo?.full_name}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <div className="flex-1 flex items-center space-x-2 bg-neutral-light-gray rounded-xl px-4 py-3 border border-gray-200">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isLoading}
                      className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="text-gray-500 hover:text-accent-teal transition-colors"
                      disabled={isLoading}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="rounded-xl p-3 h-12 w-12 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Messages are private and secure
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-neutral-off-white">
              <div className="text-center p-6 max-w-md">
                <div className="p-4 rounded-full bg-pastel-teal w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <UserCircle className="w-10 h-10 text-accent-teal" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Select a conversation</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Choose a conversation from the sidebar to start messaging.
                </p>
                
                <div className="bg-blue-50 rounded-xl p-5 flex items-start text-left border border-blue-200 shadow-sm">
                  <Info className="text-blue-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">
                      All messages are private and secure. Your conversations are encrypted and never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};