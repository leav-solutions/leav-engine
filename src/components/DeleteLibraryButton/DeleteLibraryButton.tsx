import * as React from 'react';
import {Button} from 'semantic-ui-react';

interface IDeleteLibraryButtonProps {
    onDelete: (event: any) => void;
}

function DeleteLibraryButton({onDelete}: IDeleteLibraryButtonProps): JSX.Element {
    return <Button className="delete" circular icon="trash" onClick={onDelete} />;
}

export default DeleteLibraryButton;
