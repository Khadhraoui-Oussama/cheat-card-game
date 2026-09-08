/*
	A socket id is thrown away on every disconnect, so it cannot identify a
	player across a dropped connection or a page refresh. These helpers keep a
	stable id (and the room the player belongs to) in sessionStorage, which is
	per tab and survives a reload - exactly the lifetime we want for a seat at
	a table.
*/

const PLAYER_ID_KEY = "cheat.playerId";
const SESSION_KEY = "cheat.session";

// sessionStorage throws in private-mode / blocked-cookie setups, so every
// access is defensive: losing the session only costs a reconnect, not a crash.
const readStorage = (key) => {
	try {
		return window.sessionStorage.getItem(key);
	} catch {
		return null;
	}
};

const writeStorage = (key, value) => {
	try {
		window.sessionStorage.setItem(key, value);
	} catch {
		/* storage unavailable - reconnection just won't survive a refresh */
	}
};

const removeStorage = (key) => {
	try {
		window.sessionStorage.removeItem(key);
	} catch {
		/* nothing to do */
	}
};

export const getPlayerId = () => {
	let playerId = readStorage(PLAYER_ID_KEY);
	if (!playerId) {
		playerId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(16).slice(2)}`;
		writeStorage(PLAYER_ID_KEY, playerId);
	}
	return playerId;
};

export const saveSession = ({roomCode}) => {
	writeStorage(SESSION_KEY, JSON.stringify({roomCode, playerId: getPlayerId()}));
};

export const loadSession = () => {
	const raw = readStorage(SESSION_KEY);
	if (!raw) return null;
	try {
		const session = JSON.parse(raw);
		return session?.roomCode ? session : null;
	} catch {
		return null;
	}
};

export const clearSession = () => removeStorage(SESSION_KEY);
