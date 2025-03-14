import {createContext, useState} from "react";

export const GameContext = createContext();

export const GameContextProvider = ({children}) => {
	const [gameOptions, setGameOptions] = useState({preorder: true});

	return <GameContext.Provider value={{gameOptions, setGameOptions}}>{children}</GameContext.Provider>;
};
