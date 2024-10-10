"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { getUser } from "../../lib/chama";

interface ChatMessage {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
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
  const { isConnected, address } = useAccount();
  const [userDetails, setUserDetails] = useState<User | null>(null);

  // Fetch user details for the connected account
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (address) {
        const userData = await getUser(address);
        setUserDetails(userData);
      }
    };
    fetchUserDetails();
  }, [address]);

  // Fetch messages only when the component loads
  useEffect(() => {
    fetchMessages();
  }, [chamaId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/chamas/${chamaId.toString()}/messages`
      );
      setMessages(response.data.messages);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages.");
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!userDetails || !userDetails.id) {
      setError("Please connect your wallet.");
      return;
    }

    try {
      // Send the message
      const response = await axios.post(
        `/api/chamas/${chamaId.toString()}/messages`,
        {
          senderId: userDetails.id,
          text: message.trim(),
        }
      );

      // Optimistically update the UI by appending the new message
      setMessages((prevMessages) => [...prevMessages, response.data.message]);
      setMessage("");
      scrollToBottom();

      // Reload messages from the server after the message is sent
      // fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Chat Area */}
      <div className="flex flex-col w-full max-w-2xl flex-grow bg-white rounded-lg shadow-lg p-4 overflow-y-scroll space-y-2">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet. Start chatting!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                userDetails?.name !== undefined &&
                msg.sender === userDetails?.name
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs mb-0 space-y-1 ${
                  userDetails?.name !== undefined &&
                  msg.sender === userDetails?.name
                    ? "bg-downy-300 text-downy-900"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="mb-0">{msg.text}</p>
                <small className="text-xs mt-0 text-gray-500">
                  {new Date(msg.timestamp).toLocaleString("en-GB", {
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </small>
              </div>
              <small className="text-gray-500">
                {msg.sender === userDetails?.name ? "you" : msg.sender}
              </small>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="w-full max-w-2xl flex items-center space-x-3 px-4 py-3 bg-white shadow-md"
      >
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-downy-500 resize-none"
        />
        <button
          type="submit"
          className="bg-downy-500 hover:bg-downy-700 text-white p-2 rounded-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>
    </>
  );
};

export default Chat;
