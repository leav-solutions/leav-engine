import * as React from 'react';
import {Button} from 'semantic-ui-react';

interface IDeleteButtonProps {
    onDelete: (event: any) => void;
}

function DeleteButton({onDelete}: IDeleteButtonProps): JSX.Element {
    return <Button className="delete" circular icon="trash" onClick={onDelete} />;
}

export default DeleteButton;
