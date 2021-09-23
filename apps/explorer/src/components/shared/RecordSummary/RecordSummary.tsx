// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordPreview from 'components/LibraryItemsList/LibraryItemsListTable/RecordPreview';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {getFileUrl, localizedTranslation} from 'utils';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {PreviewSize} from '_types/types';
import PropertiesList from '../PropertiesList';

interface IRecordSummaryProps {
    record: RecordIdentity_whoAmI;
}

export const Wrapper = styled.div`
    padding: 1em;
`;

function RecordSummary({record}: IRecordSummaryProps): JSX.Element {
    const preview = record?.preview?.medium;
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const summaryContent = [
        {
            title: t('record_summary.label'),
            value: record?.label
        },
        {
            title: t('record_summary.id'),
            value: record?.id
        },
        {
            title: t('record_summary.library'),
            value: localizedTranslation(record?.library.label, lang)
        }
    ];

    return (
        <Wrapper>
            <RecordPreview
                label={record?.label ?? record?.id}
                color={record?.color}
                image={preview && getFileUrl(preview)}
                tile
                size={PreviewSize.medium}
                style={{borderRadius: themingVar['@border-radius-base'], marginBottom: '1rem'}}
            />
            <PropertiesList items={summaryContent} />
        </Wrapper>
    );
}

export default RecordSummary;
