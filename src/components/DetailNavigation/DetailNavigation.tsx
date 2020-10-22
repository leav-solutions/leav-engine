import {useQuery} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';
import {useStateNavigation} from '../../Context/StateNavigationContext';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {getPreviewUrl, localizedLabel} from '../../utils';
import RecordPreview from '../LibraryItemsList/LibraryItemsListTable/RecordPreview';

const Detail = styled.div`
    min-width: 30rem;
    max-width: 30rem;
`;

const PreviewWrapper = styled.div`
    padding: 2rem;
    height: 25rem;
`;

function DetailNavigation(): JSX.Element {
    const {stateNavigation} = useStateNavigation();

    const {data: dataLang} = useQuery(getLang);
    const {lang} = dataLang ?? {lang: []};

    if (!stateNavigation.recordDetail) {
        return <></>;
    }

    const recordData = stateNavigation.recordDetail.whoAmI;

    const displayName = recordData.label ? localizedLabel(recordData.label, lang) : recordData.id;
    const img = recordData.preview.big;

    return (
        <Detail>
            <PreviewWrapper>
                <RecordPreview
                    label={displayName}
                    color={recordData.color}
                    image={img ? getPreviewUrl(img) : undefined}
                    tile
                    style={{height: '20rem'}}
                />
            </PreviewWrapper>
            <div>{displayName}</div>
        </Detail>
    );
}

export default DetailNavigation;
