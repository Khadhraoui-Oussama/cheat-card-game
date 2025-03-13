import React from "react";
import {Modal, Button, Form} from "react-bootstrap";

const SettingsModal = ({show, onHide, currentTheme, onThemeChange}) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Game Settings</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group>
						<Form.Label>Theme</Form.Label>
						<Form.Select value={currentTheme} onChange={(e) => onThemeChange(e.target.value)}>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</Form.Select>
					</Form.Group>
				</Form>
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
