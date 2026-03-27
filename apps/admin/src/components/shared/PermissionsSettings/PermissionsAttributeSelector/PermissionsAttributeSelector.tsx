// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from '../../ErrorDisplay';
import Loading from '../../Loading';
import SimplisticButton from '../../SimplisticButton';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Icon} from 'semantic-ui-react';
import {type GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';
import {type GET_LIB_BY_ID_libraries_list} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeType, useGetAttributesLazyQuery} from '../../../../_gqlTypes';
import PermissionsAttributeSelectorList from './PermissionsAttributeSelectorList';
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';

interface IPermissionsAttributeSelectorProps {
    library?: GET_LIB_BY_ID_libraries_list;
    attribute?: GET_ATTRIBUTE_BY_ID_attributes_list;
    selectedAttributes: string[];
    onSelectAttribute: (attribute: string) => void;
}

function PermissionsAttributeSelector({
    library,
    attribute,
    selectedAttributes,
    onSelectAttribute,
}: IPermissionsAttributeSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const [isListExpanded, setIsListExpanded] = useState(false);

    const [getAttributes, {loading, error, data, called}] = useGetAttributesLazyQuery({
        variables: {
            libraries: library ? [library.id] : attribute ? attribute.libraries.map(l => l.id) : null,
            type: [AttributeType.tree],
        },
    });

    useEffect(() => {
        if (!isListExpanded || called) {
            return;
        }

        getAttributes();
    }, [isListExpanded, called]);

    const _expandList = () => {
        setIsListExpanded(true);
    };

    const _handleAttributeSelected = (attr: GET_ATTRIBUTES_attributes_list) => {
        onSelectAttribute(attr.id);
        setIsListExpanded(false);
    };

    const attributesList = (data?.attributes?.list ?? []).filter(attr => !selectedAttributes.includes(attr.id));

    return (
        <>
            <SimplisticButton basic compact onClick={_expandList}>
                <Icon name="plus" />
                {t('permissions_settings.add_permissions_attribute')}
            </SimplisticButton>
            {loading && <Loading size="small" />}
            {error && <ErrorDisplay message={error.message} size="small" />}
            {isListExpanded && called && !loading && !error && (
                <PermissionsAttributeSelectorList
                    attributes={attributesList as GET_ATTRIBUTES_attributes_list[]}
                    onSelect={_handleAttributeSelected}
                />
            )}
        </>
    );
}

export default PermissionsAttributeSelector;
