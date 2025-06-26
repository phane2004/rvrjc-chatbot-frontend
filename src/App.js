import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning! How can I help you today?";
    if (hour < 16) return "Good Afternoon! How can I assist you?";
    return "Good Evening! Need help with something about the college?";
  };

  const [messages, setMessages] = useState([
    { sender: "bot", text: getTimeBasedGreeting() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState("college");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const chatBox = document.querySelector(".chat-box");
    const handleScroll = () => {
      const isAtBottom =
        chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 30;
      setShowScrollButton(!isAtBottom);
    };
    chatBox.addEventListener("scroll", handleScroll);
    return () => chatBox.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSend = async (customText) => {
    const userText = customText || input;
    if (!userText.trim()) return;

    const userMessage = { sender: "user", text: userText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("https://rvrjc-chatbot-backend-2.onrender.com/chat", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleFocus = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="main-wrapper">
      <header className="app-header">
        <img src="/logo.jpg" alt="College Logo" className="logo" />
        <h1 className="chatbot-title">College Enquiry Chatbot</h1>
      </header>

      <div className="theme-selector">
        <select onChange={(e) => setTheme(e.target.value)} value={theme}>
          <option value="light">Light </option>
          <option value="dark">Dark </option>
          <option value="college">College </option>
        </select>
      </div>

      <div className="chat-container">
        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.sender}`}>
              <img
                src={msg.sender === "bot" ? "/logo.jpg" : "/user-avatar.png"}
                alt={`${msg.sender} avatar`}
                className="avatar"
              />
              <div 
              className={`message ${msg.sender}`} 
              dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          ))}

          {isTyping && (
            <div className="message bot typing">Bot is typing...</div>
          )}
          <div ref={chatEndRef} />
          {showScrollButton && (
            <button
              className="scroll-to-bottom"
              onClick={() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              aria-label="Scroll to bottom"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="white"
                viewBox="0 0 24 24"
                className="arrow-icon"
              >
                <path d="M12 16.5l-6-6h12l-6 6z" />
              </svg>
            </button>
          )}
        </div>

        <div className="suggestions-wrapper">
          {["Courses Offered", "Fee Structure", "Results", "Placements"].map((sug, i) => (
            <span key={i} className="chip" onClick={() => handleSend(sug)}>
              {sug}
            </span>
          ))}
        </div>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask your question..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
          />
          <button onClick={() => handleSend()} aria-label="Send message">
            &#9658;
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
