// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Collapse,theme} from 'antd';
import {GlobalToken} from 'antd/lib/theme/interface';
import PropertiesList from 'components/shared/PropertiesList';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {isTypeStandard} from 'utils';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';

const AttributeDetailsCollapse = styled(Collapse)<{$themeToken: GlobalToken}>`
    &&& {
        margin: 1rem;
        background: none;

        .ant-collapse-header {
            justify-content: flex-end;
        }

        .ant-collapse-content {
            background: ${themeVars.defaultBg};
            border: 1px solid ${themeVars.borderColor};
            border-radius: ${p => p.$themeToken.borderRadius}px;
        }
    }
`;

interface IAttributeDetailsProps {
    attribute: RECORD_FORM_recordForm_elements_attribute;
}

function AttributeDetails({attribute}: IAttributeDetailsProps): JSX.Element {
    const {t} = useTranslation();
    const {token} = theme.useToken();

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

    const collapseItems = [
        {
            key: 'attribute',
            label: t('record_edition.attribute_details_section'),
            children: <PropertiesList items={attributeDetailsContent} />
        }
    ];

    return (
        <AttributeDetailsCollapse
            items={collapseItems}
            destroyInactivePanel
            bordered={false}
            ghost
            $themeToken={token}
        />
    );
}

export default AttributeDetails;
