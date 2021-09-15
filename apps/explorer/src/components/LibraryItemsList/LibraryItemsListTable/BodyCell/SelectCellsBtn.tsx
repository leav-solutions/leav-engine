// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import React from 'react';
import {IRecordIdentityWhoAmI, SharedStateSelectionType} from '_types/types';
import {setSelection, setSelectionToggleSelected, resetSelection} from 'redux/selection';
import {useAppDispatch} from 'redux/store';

interface ISelectCellsBtnProps {
    record: IRecordIdentityWhoAmI;
    size: SizeType;
    text: string;
    type: SelectCellsBtnType;
}

export enum SelectCellsBtnType {
    ONLY = 'ONLY',
    ALL = 'ALL'
}

function SelectCellsBtn({type, record, size, text}: ISelectCellsBtnProps): JSX.Element {
    const dispatch = useAppDispatch();

    const _handleClick = () => {
        const selectionData = {id: record.id, library: record.library.id, label: record.label};

        if (type === SelectCellsBtnType.ONLY) {
            dispatch(resetSelection());

            dispatch(
                setSelectionToggleSelected({
                    selectionType: SharedStateSelectionType.search,
                    elementSelected: selectionData
                })
            );
        } else if (type === SelectCellsBtnType.ALL) {
            dispatch(
                setSelection({
                    type: SharedStateSelectionType.search,
                    selected: [],
                    allSelected: true
                })
            );
        }
    };

    return (
        <Button aria-label="select-records" size={size} onClick={_handleClick}>
            {text}
        </Button>
    );
}

export default SelectCellsBtn;
