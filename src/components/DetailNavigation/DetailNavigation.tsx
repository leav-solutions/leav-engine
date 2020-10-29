import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import themingVar from '../../themingVar';
import {getPreviewUrl} from '../../utils';
import RecordPreview from '../LibraryItemsList/LibraryItemsListTable/RecordPreview';

const Detail = styled.div`
    min-width: 30rem;
    max-width: 30rem;

    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    grid-template-rows: 25rem auto;
    word-break: break-all;

    background: ${themingVar['@default-bg']};
    border-right: 1px solid ${themingVar['@divider-color']};
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
    const {t} = useTranslation();

    const {stateNavigation} = useStateNavigation();

    const detailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!stateNavigation.isLoading && detailRef.current && detailRef.current.scrollIntoView) {
            detailRef.current.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }, [detailRef, stateNavigation.recordDetail, stateNavigation.isLoading]);

    if (!stateNavigation.recordDetail) {
        return <></>;
    }

    const recordData = stateNavigation.recordDetail.whoAmI;

    const label = recordData.label ? recordData.label : t('navigation.list.info.no-label');

    const img = recordData.preview.big;

    return (
        <Detail ref={detailRef}>
            <PreviewWrapper>
                <RecordPreview
                    label={recordData.label ? label : recordData.id}
                    color={recordData.color}
                    image={img && getPreviewUrl(img)}
                    tile
                    style={{height: '20rem'}}
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
