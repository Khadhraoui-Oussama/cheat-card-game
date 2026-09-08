/*
	Every lobby round-trip has the same shape: ask the server one question, wait
	for exactly one answer, and never be left hanging if that answer never comes.

	Doing that by hand with socket.on() is what leaked listeners: a handler was
	registered on every click and removed on none, so old handlers piled up and
	kept firing on later replies - including replies to a *different* question,
	since "create a game" and "join with a code" both ask getRoomSize and both
	hear getRoomSizeR on the same socket.

	Returns a cancel function: call it on unmount, or before starting a second
	request, so nothing is left listening.
*/

// Generous, because a cold-started backend can be slow to answer its first packet.
const DEFAULT_TIMEOUT_MS = 15000;

export const socketRequest = (socket, {emit, payload, response, onReply, onTimeout, timeoutMs = DEFAULT_TIMEOUT_MS}) => {
	let timeoutId = null;
	let settled = false;

	const stop = () => {
		if (settled) return;
		settled = true;
		clearTimeout(timeoutId);
		socket.off(response, handleReply);
		socket.off("connect", armTimeout);
	};

	const armTimeout = () => {
		timeoutId = setTimeout(() => {
			stop();
			onTimeout?.();
		}, timeoutMs);
	};

	const handleReply = (...args) => {
		stop();
		onReply(...args);
	};

	socket.once(response, handleReply);

	// The lobby socket is opened by JoinGameRoomSection; if it dropped (leaving a
	// game room disconnects it) the emit would sit in the send buffer forever
	// instead of reaching the server.
	if (!socket.connected) socket.connect();
	socket.emit(emit, payload);

	// Only start counting once there is a connection, so a slow first handshake
	// is not mistaken for an unresponsive server.
	if (socket.connected) armTimeout();
	else socket.once("connect", armTimeout);

	return stop;
};
