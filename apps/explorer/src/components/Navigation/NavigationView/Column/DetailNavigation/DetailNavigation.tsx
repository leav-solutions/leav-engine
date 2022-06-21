// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordPreviewWithModal from 'components/shared/RecordPreviewWithModal';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {TREE_NODE_CHILDREN_treeNodeChildren_list} from '_gqlTypes/TREE_NODE_CHILDREN';
import themingVar from '../../../../../themingVar';
import {getFileUrl} from '../../../../../utils';

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
    display: flex;
    align-items: center;
    justify-content: center;
`;

interface IDetailNavigationProps {
    treeElement: TREE_NODE_CHILDREN_treeNodeChildren_list;
}

const DetailNavigation = ({treeElement}: IDetailNavigationProps): JSX.Element => {
    const {t} = useTranslation();

    const recordData = treeElement.record;
    const previewFile = recordData?.whoAmI?.preview?.file;

    const label = recordData.whoAmI.label ? recordData.whoAmI.label : t('navigation.list.info.no-label');

    const img = recordData.whoAmI.preview?.big;

    return (
        <Detail data-testid="details-column">
            <PreviewWrapper>
                <RecordPreviewWithModal
                    key={recordData.id}
                    fileId={previewFile?.id}
                    fileLibraryId={previewFile?.library?.id}
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
