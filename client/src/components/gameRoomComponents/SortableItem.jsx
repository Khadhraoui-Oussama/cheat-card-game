import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import PlayableCard from "./PlayableCard";
import {Col} from "react-bootstrap";

const SortableItem = ({title, index, parent, hidden}) => {
	const {isDragging, attributes, listeners, setNodeRef, transform, transition} = useSortable({
		id: title,
		data: {title, parent, index},
	});

	const style = {
		display: hidden ? "none" : "block",
		transform: CSS.Translate.toString(transform),
		transition,
		position: "absolute", // Enables stacking
		left: `${index * 1.2}rem`, // if we remove the line : left: `${index * 1.1}rem` we get solitaire cards stacking
		//TODO : FIX THE CARDS NOT BEING IN THE MIDDLE OF THE DROPPABLE AREA
		top: 0,
		margin: "auto",
		zIndex: isDragging ? "9999" : "auto",
		opacity: isDragging ? ".3" : "1",
	};

	return (
		<Col style={style} {...listeners} {...attributes} ref={setNodeRef}>
			<PlayableCard cardType={title} />
		</Col>
	);
};

export default SortableItem;
