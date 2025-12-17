// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import SimplisticButton from 'components/shared/SimplisticButton';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Icon} from 'semantic-ui-react';
import {type GET_ATTRIBUTES_attributes_list} from '_gqlTypes/GET_ATTRIBUTES';
import {type GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import {AttributeType} from '_gqlTypes/globalTypes';
import PermissionsAttributeSelectorList from './PermissionsAttributeSelectorList';
import {useGetAttributesLazyQuery} from '_gqlTypes';

interface IPermissionsAttributeSelectorProps {
    library?: GET_LIB_BY_ID_libraries_list;
    selectedAttributes: string[];
    onSelectAttribute: (attribute: string) => void;
}

function PermissionsAttributeSelector({
    library,
    selectedAttributes,
    onSelectAttribute,
}: IPermissionsAttributeSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const [isListExpanded, setIsListExpanded] = useState(false);
    const [getAttributes, {loading, error, data, called}] = useGetAttributesLazyQuery({
        variables: {
            libraries: library ? [library.id] : null,
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

    const _handleAttributeSelected = (attribute: GET_ATTRIBUTES_attributes_list) => {
        onSelectAttribute(attribute.id);
        setIsListExpanded(false);
    };

    const attributesList = (data?.attributes?.list ?? []).filter(
        attribute => !selectedAttributes.includes(attribute.id),
    );

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
