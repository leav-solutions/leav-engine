// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Card, Descriptions, Divider} from 'antd';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {localizedLabel} from 'utils';
import {IStandardFieldReducerState} from '../standardFieldReducer/standardFieldReducer';

interface IValueDetailsProps {
    state: IStandardFieldReducerState;
}

const CompactDescriptions = styled(Descriptions)`
    .ant-descriptions-row > td {
        padding-bottom: 0;
    }
`;

function ValueDetails({state}: IValueDetailsProps): JSX.Element {
    const [{lang}] = useLang();
    const {t} = useTranslation();
    const {Meta} = Card;

    const fontStyle = {color: 'rgba(0, 0, 0, 0.5)'};

    const attributeDetails = (
        <CompactDescriptions
            size="small"
            layout="horizontal"
            column={1}
            labelStyle={fontStyle}
            contentStyle={fontStyle}
            style={{paddingBottom: 0}}
        >
            <Descriptions.Item label={t('record_edition.attribute.id')}>{state.attribute.id}</Descriptions.Item>
            <Descriptions.Item label={t('record_edition.attribute.type')}>
                {t(`record_edition.attribute.type_${state.attribute.type}`)}
            </Descriptions.Item>
            {state.attribute.format && (
                <Descriptions.Item label={t('record_edition.attribute.format')}>
                    {t(`record_edition.attribute.format_${state.attribute.format}`)}
                </Descriptions.Item>
            )}
            {state.value?.modified_at && (
                <>
                    <Descriptions.Item>
                        <Divider style={{margin: '.5em 0'}} />
                    </Descriptions.Item>
                    <Descriptions.Item label={t('record_edition.modified_at')}>
                        {state.value.modified_at}
                    </Descriptions.Item>
                </>
            )}
        </CompactDescriptions>
    );

    return (
        <Card title={localizedLabel(state.attribute.label, lang)} size="small" data-testid="value-details">
            <Meta description={attributeDetails}></Meta>
        </Card>
    );
}

export default ValueDetails;
