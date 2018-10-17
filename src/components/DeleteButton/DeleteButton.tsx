import * as React from 'react';
import {Button} from 'semantic-ui-react';

interface IDeleteButtonProps {
    disabled: boolean;
    onClick?: (event: React.SyntheticEvent) => void;
}

function DeleteButton({disabled, onClick}: IDeleteButtonProps): JSX.Element {
    return <Button className="delete" circular icon="trash" disabled={disabled} onClick={onClick} />;
}

export default DeleteButton;
