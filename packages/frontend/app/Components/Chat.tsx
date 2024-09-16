"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Chat = ({
  imageSrc,
  name,
  members,
}: {
  imageSrc: string;
  name: string;
  members: number;
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const router = useRouter();

  // Handle message sending
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, sender: "You" },
      ]);
      setMessage(""); // Clear input after sending
    }
  };

  
  return (
    <div className="bg-downy-100 min-h-screen flex flex-col items-center">
      {/* Group Header */}
      <div className="flex items-center w-full px-4 py-2 space-x-2  shadow-md">
        {/* Back arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 cursor-pointer"
          onClick={() => {router.back}}
        >
          <path
            fillRule="evenodd"
            d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>

        <Image
          src={imageSrc}
          alt="logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-3">
          <h2 className="text-xl font-bold text-downy-600">{name}</h2>
          <p className="text-gray-500">{members} members</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col w-full max-w-2xl flex-grow bg-white rounded-lg shadow-lg p-4 h-full overflow-y-scroll space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col mb-4 ${
                msg.sender === "You" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  msg.sender === "You"
                    ? "bg-downy-300 text-downy-900"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <small className="text-gray-500 ">{msg.sender}</small>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSend}
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
    </div>
  );
};

export default Chat;
