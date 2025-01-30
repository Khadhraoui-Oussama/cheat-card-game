import React, {useState, useEffect} from "react";
import "./GameBoardGrid.css";
import GameBoard from "../GameBoard";

const GameBoardGrid = () => {
	//TODO THE CLOCK SOULD BE SERVER SIDE FOR SYNCHRONUZATION
	//TODO START THE GAME LOGIC
	const [selectedCards, setSelectedCards] = useState([]);
	const [theme, setTheme] = useState("light"); // Theme state
	const [timeLeft, setTimeLeft] = useState(30); // Timer for the player's turn

	// Timer logic
	useEffect(() => {
		if (timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeLeft]);

	// Theme switcher handler
	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
		document.body.className = theme === "light" ? "bg-gray-900 text-white" : "bg-white text-black";
	};

	const handleCardClick = (card) => {
		if (selectedCards.includes(card)) {
			setSelectedCards(selectedCards.filter((c) => c !== card));
		} else {
			setSelectedCards([...selectedCards, card]);
		}
	};

	return (
		<div className={`container1 ${theme}`}>
			<div className="interior">
				<button>
					<a href="https://youtube.com" target="blank">
						Home
					</a>
				</button>
			</div>
			{/* Events Section */}
			<div className="interior col-span-4">
				<h6 className="pl-2">EVENTS SECTION EG : PLAYER2 SAYS HE PLAYED 3 CARDS OF 6 OF HEARTS (replace with card image is better :says he played 6x *card_image*)</h6>
			</div>
			<div className="interior">
				{/* Theme Switcher */}
				<button onClick={toggleTheme} className="px-4 py-2 bg-gray-800 text-white rounded-md shadow-md p-4">
					{theme === "light" ? "Dark Mode" : "Light Mode"}
				</button>
			</div>
			{/* AD SPACE */}
			<div className="interior col-span-2 row-span-2  ">AD SPACE</div>
			{/* CHAT */}
			<div className="interior row-start-4 col-span-2 row-span-2 bg-amber-400">CHAT HISTORY AND BOX</div>

			{/* GAME SCORE */}
			<div className="interior row-span-2">
				<ul className="flex flex-col gap-3 items-start">
					<li>Player1(you) : 50pts</li>
					<li>Player2 : 70pts</li>
					<li>Player3 : 90pts</li>
					<li>Player4 : 100pts</li>
				</ul>
			</div>

			<div className="interior col-start-3 row-start-2 col-span-3 ">
				{/* PLAYER 3 AVATAR */}
				<div className="row-start-2 col-start-2 flex justify-center items-center">
					<div className="text-center flex flex-col items-center">
						<div className="w-9 h-9 bg-green-300 rounded-full mx-auto flex justify-center items-center  pb-1">
							<img src="/avatars/m1.svg" width={40} />
						</div>
						<h6>Player 3</h6>
						<button className="mt-1 bg-red-500 text-white rounded-md shadow-md">Accuse</button>
					</div>
				</div>
			</div>
			<div className="interior">
				{/* PLAYER 2 AVATAR */}
				<div className="row-start-2 col-start-2 flex justify-center items-center">
					<div className="text-center flex flex-col items-center">
						<div className="w-9 h-9 bg-green-300 rounded-full mx-auto flex justify-center items-center pb-1">
							<img src="/avatars/m1.svg" width={40} />
						</div>
						<h6>Player 2</h6>
						<button className="mt-1 bg-red-500 text-white rounded-md shadow-md">Accuse</button>
					</div>
				</div>
			</div>
			<div className="interior">
				{/* PILE OF PLAYER CARDS */}
				<div className="row-start-2 col-start-2 flex justify-center items-center pt-4">
					<div className="text-center flex flex-col items-center">
						<div className="w-50 h-10  mx-auto flex justify-center items-center pb-2">
							<img className="pb-2" src="../cardPile.svg" width={200} />
						</div>
						<h6>PLAYED CARDS PILE</h6>
					</div>
				</div>
			</div>
			<div className="interior">
				{/* PLAYER 4 AVATAR */}
				<div className="row-start-2 col-start-2 flex justify-center items-center">
					<div className="text-center flex flex-col items-center">
						<div className="w-9 h-9 bg-green-300 rounded-full mx-auto flex justify-center items-center pb-1">
							<img src="/avatars/m1.svg" width={40} />
						</div>
						<h6>Player 4</h6>
						<button className="mt-1 bg-red-500 text-white rounded-md shadow-md">Accuse</button>
					</div>
				</div>
			</div>

			{/* TURN MANAGER */}
			<div className="interior col-span-3 bg-blue-300 flex flex-col items-center justify-center pt-1">
				{/* clock then my cards then suits then confirm/cancel */}
				{/* Clock Section */}
				<p className="font-bold bg-yellow-300 text-black rounded-md px-4 py-2 shadow-md">Time Left: {timeLeft}s</p>
				{/* Card Numbers Dropdown */}
				<div className="w-50 pt-1">
					<div className="card-number-dropdown pt-1 flex">
						<label htmlFor="cardNumber" className="text-sm  font-medium mx-2 mb-1 ">
							Ech Habetet:
						</label>
						<select id="cardNumber" name="cardNumber" className="bg-white border border-black rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" style={{width: "100px"}}>
							<option value="" disabled selected>
								Select
							</option>
							{["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"].map((card) => (
								<option key={card} value={card}>
									{card}
								</option>
							))}
						</select>
					</div>
				</div>
				{/* Confirm or Cancel Buttons */}
				<div className="pt-1 flex space-x-4">
					<button className="bg-green-500 text-white px-4 py-1 rounded-md shadow-md text-sm">Confirm</button>
					<button className="bg-red-500 text-white px-4 py-1 rounded-md shadow-md text-sm">Cancel</button>
				</div>
				<GameBoard />
			</div>

			{/* Power-ups */}
			<div className="interior row-span-2 flex flex-col col-start-6 bg-amber-400 rounded-md shadow-md p-4 ">
				<p className="text-sm font-bold mb-2">My Power-ups</p>
				<ul className="text-m pl-4">
					<li>Shield</li>
					<li>Make a Player Skip</li>
				</ul>
			</div>
		</div>
	);
};

export default GameBoardGrid;
