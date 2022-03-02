// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_TREE_CONTENT_treeContent} from '_gqlTypes/GET_TREE_CONTENT';
import themingVar from '../../../../../themingVar';
import {getFileUrl} from '../../../../../utils';
import RecordPreview from '../../../../shared/RecordPreview';

const Detail = styled.div`
    min-width: ${themingVar['@leav-navigation-column-details-width']};
    max-width: ${themingVar['@leav-navigation-column-details-width']};

    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    grid-template-rows: 25rem auto;
    word-break: break-all;

    background: ${themingVar['@default-bg']};
    border-right: 1px solid ${themingVar['@divider-color']};

    .header-detail {
        width: 100%;
    }
`;

const Content = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: start;

    & > * {
        margin: 1rem;
    }
`;

const DetailElement = styled.div`
    span {
        font-weight: 600;
    }
`;

const PreviewWrapper = styled.div`
    padding: 2rem;
    height: 25rem;
    width: 100%;
`;

interface IDetailNavigationProps {
    treeElement: GET_TREE_CONTENT_treeContent;
}

const DetailNavigation = ({treeElement}: IDetailNavigationProps): JSX.Element => {
    const {t} = useTranslation();

    const recordData = treeElement.record;

    const label = recordData.whoAmI.label ? recordData.whoAmI.label : t('navigation.list.info.no-label');

    const img = recordData.whoAmI.preview?.big;

    return (
        <Detail data-testid="details-column">
            <PreviewWrapper>
                <RecordPreview
                    key={recordData.id}
                    label={recordData.whoAmI.label ? label : recordData.id}
                    color={recordData.whoAmI.color}
                    image={img && getFileUrl(img)}
                    tile
                    style={{maxHeight: '20rem', maxWidth: '100%', height: '100%'}}
                />
            </PreviewWrapper>
            <Content>
                <DetailElement>
                    <span>{t('navigation.list.info.id')}:</span> {recordData.id}
                </DetailElement>
                <DetailElement>
                    <span>{t('navigation.list.info.label')}:</span> {label}
                </DetailElement>
            </Content>
        </Detail>
    );
};

export default DetailNavigation;
