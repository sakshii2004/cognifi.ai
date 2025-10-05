// store/useGenAIStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-toastify";

export const useGenAIStore = create((set) => ({
  genAIResponse: null,    // state to store the AI response
  loading: false,         // to track loading state

  chatHistory: [],        // Stores the entire chat history for the current user in the frontend
  chatLoading: false,     // loading state for chatbot messages
  chatError: null, 

  // function to call Flask endpoint
  fetchGenAIResponse: async (user_id) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/generate_diagnosis", { user_id });

      // res.data could be {summary, insights, recommendations} or {raw_response}
      set({ genAIResponse: res.data });
    } catch (error) {
      console.error("GenAI API error:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch AI financial insights"
      );
      set({ genAIResponse: null });
    } finally {
      set({ loading: false });
    }
  },

  // Clear the state
  clearGenAIResponse: () => set({ genAIResponse: null }),

  // --- Functions for chatbot endpoint ---

  // Function to send a message to the chatbot backend
  sendMessage: async (user_id, message) => {
    set({ chatLoading: true, chatError: null });

    // add user's message to chat history
    set((state) => ({
      chatHistory: [...state.chatHistory, { role: 'user', content: message }],
    }));

    try {
      const res = await axiosInstance.post("/chatbot", { user_id, message });
      const botResponse = res.data.response;

      // Add bot's response to chat history
      set((state) => ({
        chatHistory: [...state.chatHistory, { role: 'assistant', content: botResponse }],
      }));

      return botResponse;
    } catch (error) {
      console.error("Chatbot API error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to get response from chatbot";
      toast.error(errorMessage);
      set({ chatError: errorMessage });
      return null;
    } finally {
      set({ chatLoading: false });
    }
  },
  
  // Sets the initial chat history
  setChatHistory: (history) => set({ chatHistory: history }),
  
  // Clear the chat history
  clearChatHistory: () => set({ chatHistory: [] }),

}));

