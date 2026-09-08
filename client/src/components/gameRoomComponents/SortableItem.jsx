import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import PlayableCard from "./PlayableCard";

/*
	The fan is built out of layout (flex order + a negative margin from
	--card-spread), never out of a CSS transform.

	dnd-kit measures a draggable with getTransformAgnosticClientRect, which
	strips the element's own transform before recording where it is. A card
	positioned by transform therefore measures as if it were still at the
	untransformed spot, and the drag overlay is placed there instead of under
	the pointer. The transform slot here is left for dnd-kit alone.
*/
const SortableItem = ({title, index = 0, parent, hidden}) => {
	const {isDragging, attributes, listeners, setNodeRef, transform, transition} = useSortable({
		id: title,
		data: {title, parent, index},
	});

	const style = {
		display: hidden ? "none" : "block",
		transform: CSS.Translate.toString(transform),
		transition,
		zIndex: isDragging ? 9999 : index,
		opacity: isDragging ? 0.3 : 1,
	};

	return (
		<div className="sortable-card" style={style} {...listeners} {...attributes} ref={setNodeRef}>
			<PlayableCard cardType={title} />
		</div>
	);
};

export default SortableItem;
