import { createContext } from "react";

export const GameContext = createContext();

export const GameContextProvider = ({ children }) => {
	//
	//

	return <GameContext.Provider value={{}}>{children}</GameContext.Provider>;
};
