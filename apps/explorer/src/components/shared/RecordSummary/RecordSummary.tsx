// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import RecordPreview from 'components/shared/RecordPreview';
import {IRecordColumnValueLink, IRecordColumnValueStandard} from 'graphQL/queries/records/getRecordColumnsValues';
import {useLang} from 'hooks/LangHook/LangHook';
import {useGetRecordColumnsValuesQuery} from 'hooks/useGetRecordColumnsValuesQuery/useGetRecordColumnsValuesQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {getFileUrl, localizedTranslation} from 'utils';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {PreviewSize} from '_types/types';
import ErrorDisplay from '../ErrorDisplay';
import Loading from '../Loading';
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

    const {loading, error, data} = useGetRecordColumnsValuesQuery(
        record?.library?.gqlNames.query,
        ['created_at', 'created_by', 'modified_at', 'modified_by'],
        [record?.id]
    );

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const recordData = data?.[record?.id];

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

    if (recordData) {
        if (recordData.created_at?.[0]) {
            summaryContent.push({
                title: t('record_summary.created_at'),
                value: t('record_summary.created_at_value', {
                    date: (recordData?.created_at?.[0] as IRecordColumnValueStandard).value,
                    user: (recordData?.created_by?.[0] as IRecordColumnValueLink).linkValue.whoAmI.label,
                    interpolation: {escapeValue: false}
                })
            });
        }

        if (recordData.modified_at?.[0]) {
            summaryContent.push({
                title: t('record_summary.modified_at'),
                value: t('record_summary.modified_at_value', {
                    date: (recordData?.modified_at?.[0] as IRecordColumnValueStandard).value,
                    user: (recordData?.modified_by?.[0] as IRecordColumnValueLink).linkValue.whoAmI.label,
                    interpolation: {escapeValue: false}
                })
            });
        }
    }

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
