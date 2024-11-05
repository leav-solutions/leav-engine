// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Space, theme} from 'antd';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {PreviewSize} from '../../../../constants';
import {useLang} from '../../../../hooks';
import {useGetRecordValuesQuery} from '../../../../hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {IRecordIdentityWhoAmI} from '../../../../types/records';
import {IRecordColumnValueLink, IRecordColumnValueStandard} from '../../../../_queries/records/getRecordColumnsValues';
import {ErrorDisplay} from '../../../ErrorDisplay';
import {Loading} from '../../../Loading';
import {RecordPreviewWithModal} from '../../../RecordPreviewWithModal';
import PropertiesList from '../PropertiesList';

interface IRecordSummaryProps {
    record: IRecordIdentityWhoAmI;
}

export const Wrapper = styled(Space)`
    padding: 1em;
    display: flex;
`;

function RecordSummary({record}: IRecordSummaryProps): JSX.Element {
    const preview = record?.preview?.medium ? String(record?.preview?.medium) : null;
    const previewFile = record?.preview?.file;
    const {token} = theme.useToken();

    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const {loading, error, data} = useGetRecordValuesQuery(
        record?.library?.id,
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
                    user: (recordData?.created_by?.[0] as IRecordColumnValueLink)?.linkValue?.whoAmI?.label,
                    interpolation: {escapeValue: false}
                })
            });
        }

        if (recordData.modified_at?.[0]) {
            summaryContent.push({
                title: t('record_summary.modified_at'),
                value: t('record_summary.modified_at_value', {
                    date: (recordData?.modified_at?.[0] as IRecordColumnValueStandard).value,
                    user: (recordData?.modified_by?.[0] as IRecordColumnValueLink)?.linkValue?.whoAmI?.label,
                    interpolation: {escapeValue: false}
                })
            });
        }
    }

    return (
        <Wrapper direction="vertical">
            <RecordPreviewWithModal
                label={record?.label ?? record?.id}
                color={record?.color}
                image={preview ?? null}
                tile
                size={PreviewSize.medium}
                style={{borderRadius: token.borderRadius}}
                previewFile={previewFile}
                imageStyle={{borderRadius: token.borderRadius}}
            />
            <PropertiesList items={summaryContent} />
        </Wrapper>
    );
}

export default RecordSummary;
