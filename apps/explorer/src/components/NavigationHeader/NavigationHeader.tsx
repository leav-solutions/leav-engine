// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {resetSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {SharedStateSelectionType} from '_types/types';

const Wrapper = styled.div`
    height: 3rem;
    display: flex;
    align-items: center;

    & > * {
        margin: 0 1rem;
    }
`;

function NavigationHeader(): JSX.Element {
    const {t} = useTranslation();

    const {selectionState} = useAppSelector(state => ({selectionState: state.selection}));
    const dispatch = useAppDispatch();

    const strSelectionType = t(`search.type.${SharedStateSelectionType[selectionState.selection.type]}`);
    const nbSharedSelectionElements = selectionState.selection.selected.length || 0;

    const _clearSelection = () => {
        dispatch(resetSelection());
    };

    return (
        <Wrapper>
            <div>
                <span>
                    {t('navigation.header.nb-selection', {
                        nb: nbSharedSelectionElements,
                        selectionType: strSelectionType
                    })}
                </span>
                <span>
                    {!!nbSharedSelectionElements && <Button onClick={_clearSelection}>{t('global.clear')}</Button>}
                </span>
            </div>
        </Wrapper>
    );
}

export default NavigationHeader;
