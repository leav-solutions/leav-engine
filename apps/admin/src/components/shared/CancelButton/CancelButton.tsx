import React from 'react';
import {Button} from 'semantic-ui-react';

interface ICancelButtonProps {
    disabled: boolean;
    onClick?: (event: React.SyntheticEvent) => void;
}

function CancelButton({disabled, onClick}: ICancelButtonProps): JSX.Element {
    return (
        <Button aria-label="cancel" className="cancel" circular icon="cancel" disabled={disabled} onClick={onClick} />
    );
}

export default CancelButton;
