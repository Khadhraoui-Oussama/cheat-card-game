import {Modal, Button} from "react-bootstrap";

const THEMES = [
	{value: "dark", label: "Night felt", swatch: "linear-gradient(140deg, #123328, #08120f)"},
	{value: "light", label: "Day felt", swatch: "linear-gradient(140deg, #ffffff, #cfe6da)"},
];

const SettingsModal = ({show, onHide, currentTheme, onThemeChange}) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Game settings</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<span className="field-label">Table theme</span>
				<div className="d-flex gap-2">
					{THEMES.map((theme) => (
						<button
							key={theme.value}
							type="button"
							onClick={() => onThemeChange(theme.value)}
							className="theme-swatch"
							data-active={currentTheme === theme.value}
							aria-pressed={currentTheme === theme.value}>
							<span className="theme-swatch-preview" style={{background: theme.swatch}} />
							{theme.label}
						</button>
					))}
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SettingsModal;
