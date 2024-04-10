import { createContext } from "react";

export const GameContext = createContext();

export const GameContextProvider = ({ children }) => {
	//
	//

	return <GameContext.Provider>{children}</GameContext.Provider>;
};
