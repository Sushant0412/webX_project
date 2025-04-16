import ReactMarkdown from "react-markdown";
import { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { type: "bot", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          College Counselor Chat
        </h2>
        <p className="text-center text-gray-600">
          Ask me anything about college studies and career planning
        </p>
      </div>

      <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.type === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-full whitespace-pre-wrap ${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.type === "bot" ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
