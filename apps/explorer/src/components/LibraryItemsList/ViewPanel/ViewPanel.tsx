// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from '../../../themingVar';
import {IView, ViewType} from '../../../_types/types';
import View from '../View/View';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themingVar['@divider-color']} 1px solid;
    overflow-y: scroll;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themingVar['@leav-secondary-bg']};
    display: grid;
    align-items: center;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themingVar['@divider-color']};
`;

const SubHeader = styled.div`
    width: 100%;
    border-top: ${themingVar['@item-active-bg']} 1px solid;
    border-bottom: ${themingVar['@item-active-bg']} 1px solid;
    padding: 0.3rem;
    padding-left: 1rem;
    margin-top: 1rem;
`;

const Views = styled.div`
    width: 100%;
`;

const defaultViews: IView[] = [
    {value: 0, text: 'My view list 1', type: ViewType.list, color: '#50F0C4'},
    {value: 1, text: 'My view list 2', type: ViewType.list, color: '#E02020'},
    {value: 2, text: 'My view tile 3', type: ViewType.tile, color: '#7EAC56'},
    {value: 3, text: 'My view list 4', type: ViewType.list, color: '#E4B34C'},
    {value: 4, text: 'My view tile 5', type: ViewType.tile}
];

function ViewPanel(): JSX.Element {
    const {t} = useTranslation();
    const [views] = useState(defaultViews);

    return (
        <Wrapper>
            <Header>{t('view.list')}</Header>
            <SubHeader>{t('view.my-views')}</SubHeader>
            <Views>
                {views.map(view => (
                    <View key={view.value} view={view} />
                ))}
            </Views>
        </Wrapper>
    );
}

export default ViewPanel;
