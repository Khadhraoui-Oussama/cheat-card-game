import React from "react";
import ReactDOM from "react-dom/client";
import App from "../src/App.jsx";
import "../src/index.css";
import { BrowserRouter } from "react-router-dom";
import { PlayerContextProvider } from "./contexts/PlayerContext.jsx";
import { SocketContextProvider } from "./contexts/SocketContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<SocketContextProvider>
			<PlayerContextProvider>
				<App />
			</PlayerContextProvider>
		</SocketContextProvider>
	</BrowserRouter>
);
