// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Collapse} from 'antd';
import PropertiesList from 'components/shared/PropertiesList';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {isTypeStandard} from 'utils';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';

const AttributeDetailsCollapse = styled(Collapse)`
    &&& {
        margin: 1rem;
        background: none;

        .ant-collapse-header {
            justify-content: flex-end;
        }

        .ant-collapse-content {
            background: ${themingVar['@default-bg']};
            border: 1px solid ${themingVar['@border-color-base']};
            border-radius: ${themingVar['@border-radius-base']};
        }
    }
`;

interface IAttributeDetailsProps {
    attribute: RECORD_FORM_recordForm_elements_attribute;
}

function AttributeDetails({attribute}: IAttributeDetailsProps): JSX.Element {
    const {t} = useTranslation();

    const attributeDetailsContent = [
        {
            title: t('record_edition.attribute.id'),
            value: attribute.id
        },
        {
            title: t('record_edition.attribute.type'),
            value: t(`record_edition.attribute.type_${attribute.type}`)
        }
    ];

    if (isTypeStandard(attribute.type)) {
        attributeDetailsContent.push({
            title: t('record_edition.attribute.format'),
            value: attribute.format ? t(`record_edition.attribute.format_${attribute.format}`) : null
        });
    }

    return (
        <AttributeDetailsCollapse destroyInactivePanel bordered={false} ghost>
            <Collapse.Panel key="attribute" header={t('record_edition.attribute_details_section')}>
                <PropertiesList items={attributeDetailsContent} />
            </Collapse.Panel>
        </AttributeDetailsCollapse>
    );
}

export default AttributeDetails;
