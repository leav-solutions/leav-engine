import {type SyntheticEvent} from 'react';
import {Button} from 'semantic-ui-react';

interface IDeleteButtonProps {
    disabled: boolean;
    onClick?: (event: SyntheticEvent) => void;
}

function DeleteButton({disabled, onClick}: IDeleteButtonProps): JSX.Element {
    return (
        <Button aria-label="delete" className="delete" circular icon="trash" disabled={disabled} onClick={onClick} />
    );
}

export default DeleteButton;
