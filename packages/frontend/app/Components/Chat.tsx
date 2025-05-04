"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { getUser } from "../../lib/chama";
import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";
import { IoMdSend } from "react-icons/io";
import { BsCheck2All } from "react-icons/bs";

interface ChatMessage {
  id: number;
  text: string;
  sender: string;
  senderId: number;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  isOptimistic?: boolean; // New flag for optimistic updates
}

interface ChatProps {
  chamaId: number;
}

interface User {
  id: number;
  address: string;
  name: string | null;
}

const Chat: React.FC<ChatProps> = ({ chamaId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const { isConnected, address } = useAccount();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (address && isConnected) {
        const userData = await getUser(address);
        setUserDetails(userData);
      }
    };
    fetchUserDetails();
  }, [address, isConnected]);

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, [chamaId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/chamas/${chamaId.toString()}/messages`
      );
      const formattedMessages = response.data.messages.map(
        (msg: ChatMessage) => ({
          ...msg,
          status: msg.senderId === userDetails?.id ? "read" : undefined,
          isOptimistic: false,
        })
      );
      setMessages(formattedMessages);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again.");
      setLoading(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    if (!userDetails?.id) {
      setError("Please connect your wallet to chat");
      return;
    }

    const tempId = Date.now();
    const newMessage: ChatMessage = {
      id: tempId,
      text: message.trim(),
      sender: userDetails.name || "You",
      senderId: userDetails.id,
      timestamp: new Date().toISOString(),
      status: "sent",
      isOptimistic: true, // Mark as optimistic update
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    scrollToBottom();
    inputRef.current?.focus();

    try {
      const response = await axios.post(
        `/api/chamas/${chamaId.toString()}/messages`,
        {
          senderId: userDetails.id,
          text: message.trim(),
        }
      );

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== tempId),
        {
          ...response.data.message,
          status: "delivered",
          isOptimistic: false, // Ensure server response is not marked as optimistic
        },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Message failed to send. Try again.");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        100
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto">
      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 pb-4"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-downy-300 rounded-full"></div>
              <div className="w-3 h-3 bg-downy-400 rounded-full"></div>
              <div className="w-3 h-3 bg-downy-500 rounded-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <FiUser className="text-gray-400 text-4xl mb-2" />
            <h3 className="text-lg font-medium text-gray-600">
              No messages yet
            </h3>
            <p className="text-gray-500">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.senderId === userDetails?.id || msg.isOptimistic
                  ? "justify-end"
                  : "justify-start"
              }`}
              
            >
              <div
                className={`max-w-xs lg:max-w-md rounded-2xl p-3 ${
                  msg.senderId === userDetails?.id || msg.isOptimistic
                    ? "bg-downy-400 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {msg.senderId !== userDetails?.id && !msg.isOptimistic && (
                    <span className="font-semibold text-sm">{msg.sender}</span>
                  )}
                </div>
                <p className="text-sm">{msg.text}</p>
                <div
                  className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                    msg.senderId === userDetails?.id || msg.isOptimistic
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  <span className="text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {(msg.senderId === userDetails?.id || msg.isOptimistic) && (
                    <BsCheck2All
                      className={`ml-1 ${
                        msg.status === "read"
                          ? "text-blue-300"
                          : "text-white/50"
                      }`}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="bg-white p-3 border-t border-gray-200 shadow-lg">
        <form onSubmit={sendMessage} className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-downy-400 focus:border-transparent resize-none max-h-24"
            style={{ minHeight: "44px" }}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={!message.trim()}
            className={`p-2 rounded-full ${
              message.trim()
                ? "bg-downy-500 text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <IoMdSend className="text-xl" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
