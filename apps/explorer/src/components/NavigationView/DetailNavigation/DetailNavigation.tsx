// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import HeaderColumnNavigation from 'components/NavigationView/ColumnNavigation/HeaderColumnNavigation';
import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import themingVar from '../../../themingVar';
import {getFileUrl} from '../../../utils';
import RecordPreview from '../../LibraryItemsList/LibraryItemsListTable/RecordPreview';

const Detail = styled.div`
    min-width: 30rem;
    max-width: 30rem;

    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    grid-template-rows: 2.5rem 25rem auto;
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

const DetailNavigation = (): JSX.Element => {
    const navigation = useAppSelector(state => state.navigation);
    const {t} = useTranslation();

    const detailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setImmediate(() => {
            if (detailRef?.current?.scrollIntoView) {
                detailRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        });
    }, [detailRef, navigation.isLoading]);

    if (!navigation.recordDetail) {
        return <></>;
    }

    const recordData = navigation.recordDetail.whoAmI;

    const label = recordData.label ? recordData.label : t('navigation.list.info.no-label');

    const img = recordData.preview?.big;

    return (
        <Detail ref={detailRef} data-testid="details-column">
            <div className="header-detail">
                <HeaderColumnNavigation
                    depth={navigation.path.length}
                    isActive={true}
                    isDetail={true}
                    treeElement={{record: navigation.recordDetail, children: []}}
                />
            </div>
            <PreviewWrapper>
                <RecordPreview
                    label={recordData.label ? label : recordData.id}
                    color={recordData.color}
                    image={img && getFileUrl(img)}
                    tile
                    style={{maxHeight: '20rem', maxWidth: '100%', height: 'auto'}}
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
