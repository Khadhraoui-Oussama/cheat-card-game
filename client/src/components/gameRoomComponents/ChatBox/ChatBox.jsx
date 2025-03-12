import React, {useState, useEffect, useRef} from "react";
import {Form, Button} from "react-bootstrap";
import "./ChatBox.css";

const ChatBox = ({socket, roomCode, playerName}) => {
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState([]);
	const chatContainerRef = useRef(null);

	useEffect(() => {
		// Listen for new messages
		socket.on("chatMessage", (messageData) => {
			setChatHistory((prev) => [...prev, messageData]);
		});

		// Listen for chat history
		socket.on("chatHistory", (history) => {
			setChatHistory(history);
		});

		// Request chat history when component mounts
		socket.emit("getChatHistory", roomCode);

		return () => {
			socket.off("chatMessage");
			socket.off("chatHistory");
		};
	}, [socket, roomCode]);

	useEffect(() => {
		// Auto scroll to bottom when new messages arrive
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [chatHistory]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (message.trim()) {
			socket.emit("sendMessage", {
				roomCode,
				message: message.trim(),
				playerName,
			});
			setMessage("");
		}
	};

	return (
		<div className="chat-box">
			<div className="chat-messages" ref={chatContainerRef}>
				{chatHistory.map((msg, index) => (
					<div key={index} className={`message ${msg.isSystemMessage ? "system-message" : ""}`}>
						{!msg.isSystemMessage && <span className="player-name">{msg.playerName}: </span>}
						<span className="message-text">{msg.message}</span>
					</div>
				))}
			</div>
			<Form onSubmit={handleSubmit} className="chat-input">
				<Form.Control type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
				<Button type="submit" variant="primary">
					Send
				</Button>
			</Form>
		</div>
	);
};

export default ChatBox;
