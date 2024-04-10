import { useState, createContext } from "react";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
	const [player, setPlayer] = useState({ name: "", gender: "male", avatar: "" });

	return (
		<PlayerContext.Provider value={{ player, setPlayer }}>{children}</PlayerContext.Provider>
	);
};
