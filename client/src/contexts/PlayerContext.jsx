import {useState, createContext} from "react";
import validator from "validator";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({children}) => {
	const [player, setPlayer] = useState({
		playerSocket: null,
		name: "",
		gender: "male",
		avatar: "",
		isLeader: false,
	});
	const [isCreateGame, setIsCreateGame] = useState(null);
	const [selectedAvatarPath, setSelectedAvatarPath] = useState("");

	const [isOpen, setIsOpen] = useState(false);
	const [inputError, setInputError] = useState(false);

	// Shared by every path that leads to a table (create, quick match, join by
	// code) so they all agree on what counts as a usable player.
	const validatePlayerInfo = () => {
		const isValid = Boolean(player.avatar) && Boolean(player.name) && validator.isLength(player.name, 3, 20);
		setInputError(!isValid);
		return isValid;
	};

	const openPopup = () => {
		if (!validatePlayerInfo()) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
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
				validatePlayerInfo,
				isOpen,
				setIsOpen,
				inputError,
				setInputError,
			}}>
			{children}
		</PlayerContext.Provider>
	);
};
