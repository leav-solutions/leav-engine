import {useQuery} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import themingVar from '../../themingVar';
import {getPreviewUrl, localizedLabel} from '../../utils';
import RecordPreview from '../LibraryItemsList/LibraryItemsListTable/RecordPreview';

const Detail = styled.div`
    min-width: 30rem;
    max-width: 30rem;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
    grid-template-rows: 25rem auto;

    background: ${themingVar['@default-bg']};
`;

const PreviewWrapper = styled.div`
    padding: 2rem;
    height: 25rem;
    width: 100%;

    grid-column-start: 1;
    grid-column-end: 3;
`;

function DetailNavigation(): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    if (!stateNavigation.recordDetail) {
        return <></>;
    }

    const recordData = stateNavigation.recordDetail.whoAmI;

    const label = recordData.label ? localizedLabel(recordData.label, lang) : 'No label';
    const img = recordData.preview.big;

    return (
        <Detail>
            <PreviewWrapper>
                <RecordPreview
                    label={recordData.label ? label : recordData.id}
                    color={recordData.color}
                    image={img && getPreviewUrl(img)}
                    tile
                    style={{height: '20rem'}}
                />
            </PreviewWrapper>
            <div>
                <span>Id:</span> {recordData.id}
            </div>
            <div>
                <span>Label:</span> {label}
            </div>
        </Detail>
    );
}

export default DetailNavigation;
