// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {resetSharedSelection} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {displaySharedSearchType as displaySharedSelectionType} from 'utils';

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
    const {stateShared, dispatchShared} = useStateShared();

    const strSelectionType = displaySharedSelectionType(stateShared.selection.type);
    const nbSharedSelectionElements = stateShared.selection.selected.length || 0;

    const _clearSelection = () => {
        dispatchShared(resetSharedSelection());
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
                    {!!nbSharedSelectionElements && (
                        <span data-testid="clear-selection-button">
                            <Button onClick={_clearSelection}>{t('global.clear')}</Button>
                        </span>
                    )}
                </span>
            </div>
        </Wrapper>
    );
}

export default NavigationHeader;
