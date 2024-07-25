import { useState, createContext } from "react";
import validator from "validator";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
	const [player, setPlayer] = useState({
		playerSocket: null,
		name: "",
		gender: "male",
		avatar: "",
		isLeader: true,
	});
	const [isCreateGame, setIsCreateGame] = useState(null);
	const [selectedAvatarPath, setSelectedAvatarPath] = useState("");

	const [isOpen, setIsOpen] = useState(false);
	const [inputError, setInputError] = useState(false);

	const openPopup = () => {
		if (!player.avatar || !player.name || !validator.isLength(player.name, 3, 20)) {
			setIsOpen(false);
			setInputError(true);
		} else {
			setIsOpen(true);
			setInputError(false);
		}
	};
	return (
		<PlayerContext.Provider
			value={{
				player,
				setPlayer,
				isCreateGame,
				setIsCreateGame,
				selectedAvatarPath,
				setSelectedAvatarPath,
				openPopup,
				isOpen,
				setIsOpen,
				inputError,
			}}>
			{children}
		</PlayerContext.Provider>
	);
};
