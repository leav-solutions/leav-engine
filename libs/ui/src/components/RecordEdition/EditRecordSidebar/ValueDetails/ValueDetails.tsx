// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {isTypeStandard, localizedTranslation} from '@leav/utils';
import {Collapse, Divider} from 'antd';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useLang from '../../../../hooks/useLang';
import {
    AttributeType,
    RecordFormAttributeFragment,
    RecordFormAttributeTreeAttributeFragment
} from '../../../../_gqlTypes';
import {IRecordPropertyTree, RecordProperty} from '../../../../_queries/records/getRecordPropertiesQuery';
import {MetadataSubmitValueFunc} from '../../EditRecordContent/_types';
import {EditRecordReducerActionsTypes} from '../../editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '../../editRecordReducer/useEditRecordReducer';
import AttributeDetails from './AttributeDetails';
import TreeValuePath from './TreeValuePath';
import ValueInfo from './ValueInfo';
import ValueMetadata from './ValueMetadata';

interface IValueDetailsProps {
    attribute: RecordFormAttributeFragment;
    onMetadataSubmit: MetadataSubmitValueFunc;
    value: RecordProperty;
}

const AttributeTitle = styled.div`
    padding: 1rem;

    .attribute-label {
        font-weight: bold;
    }
`;

const AttributeDescription = styled.div`
    color: rgba(0, 0, 0, 0.5);
    padding: 0 1rem;
`;

const CloseButton = styled(CloseOutlined)`
    cursor: pointer;
    position: absolute;
    right: 1em;
    top: 1em;
`;

const {Panel} = Collapse;

function ValueDetails({attribute, value, onMetadataSubmit}: IValueDetailsProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();

    const _handleClose = () => dispatch({type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE, value: null});

    const metadataFields = (attribute?.metadata_fields ?? []).filter(field => field.permissions.access_attribute);
    const hasMetadata = metadataFields.length > 0 && value !== null;

    const collapseItems = [];

    if (hasMetadata) {
        collapseItems.push({
            key: 'metadata',
            label: isTypeStandard(attribute.type)
                ? t('record_edition.metadata_section')
                : t('record_edition.metadata_section_link'),
            children: <ValueMetadata value={value} attribute={attribute} onMetadataSubmit={onMetadataSubmit} />
        });
    }

    if (attribute.type === AttributeType.tree && value) {
        collapseItems.push({
            key: 'path',
            label: t('record_edition.path_section'),
            children: (
                <TreeValuePath
                    value={value as IRecordPropertyTree}
                    attribute={attribute as RecordFormAttributeTreeAttributeFragment}
                />
            )
        });
    }

    return (
        <>
            <CloseButton onClick={_handleClose} />
            <AttributeTitle>
                {t('record_edition.attribute.info_title')}:
                <span className="attribute-label">{localizedTranslation(attribute.label, lang)}</span>
            </AttributeTitle>
            <AttributeDescription>{localizedTranslation(attribute.description, lang)}</AttributeDescription>
            <AttributeDetails attribute={attribute} />
            <Divider style={{margin: '.5em 0'}} />
            <ValueInfo />
            <Collapse
                items={collapseItems}
                bordered={false}
                defaultActiveKey={['value', 'metadata']}
                style={{background: 'none'}}
                destroyInactivePanel
            />
        </>
    );
}

export default ValueDetails;
