// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, ButtonProps} from 'antd';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import React from 'react';
import {resetSelection, setSelection, setSelectionToggleSelected} from 'reduxStore/selection';
import {useAppDispatch} from 'reduxStore/store';
import {IRecordIdentityWhoAmI, SharedStateSelectionType} from '_types/types';

interface ISelectCellsBtnProps extends ButtonProps {
    record: IRecordIdentityWhoAmI;
    size: SizeType;
    text: string;
    selectionType: SelectCellsBtnType;
}

export enum SelectCellsBtnType {
    ONLY = 'ONLY',
    ALL = 'ALL'
}

function SelectCellsBtn({selectionType, record, size, text, ...btnProps}: ISelectCellsBtnProps): JSX.Element {
    const dispatch = useAppDispatch();

    const _handleClick = (e: React.SyntheticEvent) => {
        e.stopPropagation();

        const selectionData = {id: record.id, library: record.library.id, label: record.label};

        if (selectionType === SelectCellsBtnType.ONLY) {
            dispatch(resetSelection());

            dispatch(
                setSelectionToggleSelected({
                    selectionType: SharedStateSelectionType.search,
                    elementSelected: selectionData
                })
            );
        } else if (selectionType === SelectCellsBtnType.ALL) {
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
        <Button {...btnProps} aria-label="select-records" size={size} onClick={_handleClick}>
            {text}
        </Button>
    );
}

export default SelectCellsBtn;
