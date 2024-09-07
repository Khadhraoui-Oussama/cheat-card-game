import {closestCenter, closestCorners, DndContext, DragOverlay, rectIntersection} from "@dnd-kit/core";
import {useState} from "react";
import DroppableArea from "./DroppableArea";
import {Container, Stack} from "react-bootstrap";
import {arrayMove, horizontalListSortingStrategy, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import {useSensor, useSensors, TouchSensor, MouseSensor, KeyboardSensor} from "@dnd-kit/core";

export const GameBoard = () => {
	const [yourCards, setYourCards] = useState(["AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "TC", "JC", "QC", "KC", "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "TD", "JD", "QD", "KD", "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H"]);
	const [turnManagerCards, setTurnManagerCards] = useState(["9H", "TH", "JH", "QH", "KH", "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "TS", "JS", "QS", "KS"]);
	const [activeId, setActiveId] = useState();

	const mouseSensor = useSensor(MouseSensor);
	const touchSensor = useSensor(TouchSensor);
	const keyboardSensor = useSensor(KeyboardSensor, {
		coordinateGetter: sortableKeyboardCoordinates,
	});

	const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

	const handleDragStart = (event) => {
		const {active} = event;
		const {id} = active;

		setActiveId(id);
	};
	const handleDragEnd = (event) => {
		const {active, over} = event;
		const activeParent = active?.data?.current?.parent;
		const overParent = over?.data?.current?.parent;
		console.log("OverParent end:", overParent);
		console.log("ActiveParent end:", activeParent);
		if (activeParent !== overParent) return;
		if (activeParent === "yourCards") {
			setYourCards((items) => {
				const oldIndex = items.indexOf(active.id);
				const newIndex = items.indexOf(over.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		} else if (activeParent === "turnManager") {
			setTurnManagerCards((items) => {
				const oldIndex = items.indexOf(active.id);
				const newIndex = items.indexOf(over.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};
	const handleDragOver = (event) => {
		const {active, over} = event;
		const activeParent = active?.data?.current?.parent;
		const overParent = over?.data?.current?.parent;
		console.log("active :", activeParent);
		console.log("over:", overParent);
		if (activeParent === "yourCards" && (overParent === "turnManager" || overParent === undefined)) {
			setTurnManagerCards((prev) => [...prev, active.data.current.title]);
			setYourCards((prev) => [...prev.slice(0, active.data.current.index), ...prev.slice(active.data.current.index + 1)]);
		} else if (activeParent === "turnManager" && (overParent === "yourCards" || overParent === undefined)) {
			setYourCards((prev) => [...prev, active.data.current.title]);
			setTurnManagerCards((prev) => [...prev.slice(0, active.data.current.index), ...prev.slice(active.data.current.index + 1)]);
		}
	};
	return (
		<Container>
			<DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<DroppableArea
					items={yourCards}
					parent="yourCards"
					style={{
						minWidth: "200px",
						border: "solid blue 2px",
						display: "flex",
						marginTop: "50px",
						minHeight: "100px",
					}}
					id="yourCards"
				/>
				<DroppableArea
					items={turnManagerCards}
					parent="turnManager"
					style={{
						minWidth: "200px",
						border: "solid red 2px",
						display: "flex",
						marginTop: "50px",
						minHeight: "100px",
					}}
					id="turnManager"
				/>
				<DragOverlay style={{zIndex: "9999"}}>{activeId ? <SortableItem id={activeId} title={activeId} /> : null}</DragOverlay>
			</DndContext>
		</Container>
	);
};
export default GameBoard;
