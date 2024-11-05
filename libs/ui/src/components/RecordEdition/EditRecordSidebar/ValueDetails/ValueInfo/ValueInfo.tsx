// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isTypeLink, isTypeStandard} from '@leav/utils';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {RecordCard} from '_ui/components/RecordCard';
import {PreviewSize} from '_ui/constants';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeFormat} from '_ui/_gqlTypes';
import {IRecordPropertyLink, IRecordPropertyTree} from '_ui/_queries/records/getRecordPropertiesQuery';
import {getValueVersionLabel} from '_ui/_utils';
import {useEditRecordReducer} from '../../../editRecordReducer/useEditRecordReducer';
import PropertiesList from '../../PropertiesList';

const Wrapper = styled.div`
    padding: 1rem;
`;

const ValueLengthWrapper = styled.div`
    background: ${themeVars.activeColor};
    padding: 0px 15px;
    border-radius: 1em;
    width: fit-content;
`;

const Title = styled.div`
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
`;

function ValueInfo(): JSX.Element {
    const {t} = useSharedTranslation();
    const {state} = useEditRecordReducer();
    const {value, attribute} = state.activeValue;

    const valueDetailsContent = value?.modified_at
        ? [
              {
                  title: isTypeStandard(attribute.type)
                      ? t('record_edition.created_at')
                      : t('record_edition.link_created_at'),
                  value: `${new Date(value.created_at * 1000).toLocaleString()} ${
                      value?.created_by ? ` ${t('record_edition.by')} ${value.created_by.whoAmI.label}` : ''
                  }`
              },
              {
                  title: t('record_edition.modified_at'),
                  value: `${new Date(value.modified_at * 1000).toLocaleString()} ${
                      value?.modified_by ? ` ${t('record_edition.by')} ${value.modified_by.whoAmI.label}` : ''
                  }`
              }
          ]
        : [];

    if (value?.version && !isEmpty(value?.version)) {
        valueDetailsContent.push({
            title: t('values_version.version'),
            value: getValueVersionLabel(value.version)
        });
    }

    if (state?.record && value?.id_value && !isEmpty(value?.id_value)) {
        valueDetailsContent.push({
            title: t('record_edition.attribute.id'),
            value: value?.id_value
        });
    }

    const canCountValueLength =
        isTypeStandard(attribute.type) && attribute.format === AttributeFormat.text && !!state.activeValue.value;

    if (!valueDetailsContent.length && !canCountValueLength) {
        return null;
    }

    const valueLength = canCountValueLength ? String(state.activeValue.editingValue).length : null;
    const valueDetailsSectionTitle = isTypeStandard(attribute.type)
        ? t('record_edition.value_details')
        : t('record_edition.link_details');

    const valueWhoAmI = isTypeStandard(attribute.type)
        ? null
        : isTypeLink(attribute.type)
        ? (value as IRecordPropertyLink)?.linkValue?.whoAmI
        : (value as IRecordPropertyTree)?.treeValue?.record?.whoAmI;

    return (
        <Wrapper>
            <Title>
                {valueDetailsSectionTitle}:
                {canCountValueLength && (
                    <ValueLengthWrapper>{t('record_edition.value_length', {length: valueLength})}</ValueLengthWrapper>
                )}
            </Title>
            {valueWhoAmI && (
                <RecordCard record={valueWhoAmI} size={PreviewSize.big} tile style={{marginBottom: '1rem'}} />
            )}
            <PropertiesList items={valueDetailsContent} />
        </Wrapper>
    );
}

export default ValueInfo;
