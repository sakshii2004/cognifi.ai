// store/useGenAIStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-toastify";

export const useGenAIStore = create((set) => ({
  genAIResponse: null,    // state to store the AI response
  loading: false,         // optional: to track loading state

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

  // optional: clear the state
  clearGenAIResponse: () => set({ genAIResponse: null }),
}));
