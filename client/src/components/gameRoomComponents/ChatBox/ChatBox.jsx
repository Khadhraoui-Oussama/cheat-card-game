import {useState, useEffect, useRef} from "react";
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
			<div className="chat-head">Table chat</div>
			<div className="chat-messages" ref={chatContainerRef}>
				{chatHistory.length === 0 && <p className="chat-empty">No messages yet. Say something — or stay suspiciously quiet.</p>}
				{chatHistory.map((msg, index) => {
					const isOwn = !msg.isSystemMessage && msg.playerName === playerName;
					return (
						<div key={index} className={`message ${msg.isSystemMessage ? "system-message" : ""} ${isOwn ? "own-message" : ""}`}>
							{!msg.isSystemMessage && <span className="player-name">{msg.playerName}: </span>}
							<span className="message-text">{msg.message}</span>
						</div>
					);
				})}
			</div>
			<Form onSubmit={handleSubmit} className="chat-input">
				<Form.Control type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message…" maxLength={200} />
				<Button type="submit" variant="success" disabled={!message.trim()}>
					Send
				</Button>
			</Form>
		</div>
	);
};

export default ChatBox;
