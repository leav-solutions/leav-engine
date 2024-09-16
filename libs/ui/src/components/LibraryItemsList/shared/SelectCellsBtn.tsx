// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, ButtonProps} from 'antd';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import React from 'react';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import useSearchReducer from '../hooks/useSearchReducer';
import {SearchActionTypes} from '../hooks/useSearchReducer/searchReducer';
import {SelectCellsBtnType} from '_ui/components/LibraryItemsList/shared/shared.utils';

interface ISelectCellsBtnProps extends ButtonProps {
    record: IRecordIdentityWhoAmI;
    size: SizeType;
    text: string;
    selectionType: SelectCellsBtnType;
}

function SelectCellsBtn({selectionType, record, size, text, ...btnProps}: ISelectCellsBtnProps): JSX.Element {
    const {state, dispatch} = useSearchReducer();

    const _handleClick = (e: React.SyntheticEvent) => {
        e.stopPropagation();

        const selectionData = {id: record.id, library: record.library.id, label: record.label};

        if (selectionType === SelectCellsBtnType.ONLY) {
            dispatch({
                type: SearchActionTypes.SET_SELECTION,
                selected: [selectionData]
            });
        } else if (selectionType === SelectCellsBtnType.ALL) {
            dispatch({
                type: SearchActionTypes.SELECT_ALL
            });
        }
    };

    return (
        <Button {...btnProps} aria-label="select-records" size={size} onClick={_handleClick}>
            {text}
        </Button>
    );
}

export default SelectCellsBtn;
