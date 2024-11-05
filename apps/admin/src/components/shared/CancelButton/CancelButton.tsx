// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
