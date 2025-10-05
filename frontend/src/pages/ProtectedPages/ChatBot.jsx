// pages/dashboard/ChatBot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useGenAIStore } from "../../store/useGenAIStore"; 
import { useSelector } from "react-redux"; 
import { toast } from "react-toastify";

const ChatbotPage = () => {
  const user = useSelector((state) => state.auth.user); 
  const {
    chatHistory,
    chatLoading,
    chatError,
    sendMessage,
    clearChatHistory,
    setChatHistory, 
  } = useGenAIStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null); 

  useEffect(() => {
    clearChatHistory(); 
    
    return () => {
      clearChatHistory();
    };
  }, [user?._id, clearChatHistory, setChatHistory]);


  // --- Auto-scroll to the latest message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]); // Scroll whenever history or loading state changes

  // --- Handle sending a message ---
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!inputMessage.trim()) {
      toast.warn("Please enter a message.");
      return;
    }
    if (!user?._id) {
      toast.error("User not authenticated. Cannot send message.");
      return;
    }
    if (chatLoading) {
        toast.info("Please wait for the previous response.");
        return;
    }

    const messageToSend = inputMessage;
    setInputMessage(""); // Clear input field immediately

    try {
      await sendMessage(user._id, messageToSend);
      // Success is handled by state updates in Zustand
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <section className="w-full h-[90vh] md:h-[90vh] px-6 md:px-12 flex flex-col gap-6">
      <div>
        <h2 className="text-3xl text-pretty mt-3">
          Talk to your Finance AI, {user?.username} 👋
        </h2>
        <h3 className="text-lg text-gray-500">
          Ask questions about your finances, get advice, or just chat!
        </h3>
      </div>

      {/* Chat messages display area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4 border-2 border-secondary rounded-lg bg-gray-50 shadow-inner">
        {chatHistory.length === 0 && !chatLoading && !chatError && (
          <p className="text-center text-gray-400 mt-auto">
            Your conversation starts here...
          </p>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                msg.role === "user"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              <p className="text-sm md:text-base whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator for bot response */}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-white text-gray-800 border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-0"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error message display */}
        {chatError && (
          <div className="text-center text-red-500 mt-2">
            Error: {chatError}
          </div>
        )}

        {/* This div is the target for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <form onSubmit={handleSendMessage} className="flex gap-4 mb-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={chatLoading ? "AI is thinking..." : "Type your message..."}
          className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          disabled={chatLoading}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={chatLoading}
        >
          {chatLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {/* Clear Chat History button */}
      <div className="text-right mb-6">
        <button
          onClick={clearChatHistory}
          className="text-gray-500 hover:text-gray-700 text-sm"
          disabled={chatLoading}
        >
          Clear Chat
        </button>
      </div>
    </section>
  );
};

export default ChatbotPage;