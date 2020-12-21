// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Button} from 'semantic-ui-react';

interface IDeleteButtonProps {
    disabled: boolean;
    onClick?: (event: React.SyntheticEvent) => void;
}

function DeleteButton({disabled, onClick}: IDeleteButtonProps): JSX.Element {
    return <Button className="delete" circular icon="trash" disabled={disabled} onClick={onClick} />;
}

export default DeleteButton;
