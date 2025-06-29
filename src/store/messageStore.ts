import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

type ConversationPartner = {
  id: string;
  full_name: string;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
};

type MessageState = {
  messages: Message[];
  conversations: ConversationPartner[];
  currentConversation: string | null;
  isLoading: boolean;
  error: string | null;
  fetchMessages: (userId: string, partnerId: string) => Promise<void>;
  fetchConversations: (userId: string) => Promise<void>;
  sendMessage: (senderId: string, recipientId: string, content: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  setCurrentConversation: (partnerId: string) => void;
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
  
  fetchMessages: async (userId: string, partnerId: string) => {
    set({ isLoading: true });
    try {
      // Get messages where the user is either sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .and(`sender_id.eq.${partnerId},recipient_id.eq.${partnerId}`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      set({ messages: data as Message[] });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to load messages' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchConversations: async (userId: string) => {
    set({ isLoading: true });
    try {
      // Get the last message with each unique conversation partner
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          recipient_id,
          profiles:recipient_id (
            id, 
            full_name, 
            avatar_url
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });
        
      if (sentError) throw sentError;
      
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender_id,
          profiles:sender_id (
            id, 
            full_name, 
            avatar_url
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });
        
      if (receivedError) throw receivedError;
      
      // Combine and process messages to get unique conversation partners
      const conversationMap = new Map<string, ConversationPartner>();
      
      // Process sent messages
      sentMessages.forEach(msg => {
        const partnerId = msg.recipient_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: partnerId,
            full_name: msg.profiles.full_name,
            avatar_url: msg.profiles.avatar_url,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: 0
          });
        }
      });
      
      // Process received messages
      receivedMessages.forEach(msg => {
        const partnerId = msg.sender_id;
        const existingConversation = conversationMap.get(partnerId);
        
        if (!existingConversation) {
          conversationMap.set(partnerId, {
            id: partnerId,
            full_name: msg.profiles.full_name,
            avatar_url: msg.profiles.avatar_url,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: msg.read ? 0 : 1
          });
        } else {
          // Update if this message is more recent
          const existingTime = new Date(existingConversation.lastMessageTime || '');
          const thisTime = new Date(msg.created_at);
          
          if (thisTime > existingTime) {
            existingConversation.lastMessage = msg.content;
            existingConversation.lastMessageTime = msg.created_at;
          }
          
          if (!msg.read) {
            existingConversation.unreadCount += 1;
          }
        }
      });
      
      // Convert map to array and sort by most recent message
      const conversations = Array.from(conversationMap.values())
        .sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || '').getTime();
          const timeB = new Date(b.lastMessageTime || '').getTime();
          return timeB - timeA;
        });
      
      set({ conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ error: 'Failed to load conversations' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  sendMessage: async (senderId: string, recipientId: string, content: string) => {
    set({ isLoading: true });
    
    try {
      const newMessage = {
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        read: false,
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert([newMessage])
        .select();
        
      if (error) throw error;
      
      // Update local state
      const messages = get().messages;
      set({ messages: [...messages, data[0] as Message] });
      
      // Refresh the conversations list
      await get().fetchConversations(senderId);
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: 'Failed to send message' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  markAsRead: async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
        
      if (error) throw error;
      
      // Update local state
      const messages = get().messages.map(message => 
        messageIds.includes(message.id) 
          ? { ...message, read: true } 
          : message
      );
      
      set({ messages });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      set({ error: 'Failed to mark messages as read' });
    }
  },
  
  setCurrentConversation: (partnerId: string) => {
    set({ currentConversation: partnerId });
  },
}));