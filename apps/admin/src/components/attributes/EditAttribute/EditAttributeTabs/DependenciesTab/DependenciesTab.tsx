// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type TreePermissionsDependentValuesConfInput,
    useSaveAttributeMutation,
    type AttributeDetailsTreeAttributeFragment,
    AttributeType,
} from '_gqlTypes';
import DependenciesSettings from 'components/attributes/EditAttribute/EditAttributeTabs/DependenciesTab/DependenciesSettings';
import {type ITreePermissionsDependentValuesConf} from 'components/attributes/EditAttribute/EditAttributeTabs/DependenciesTab/DependenciesSettings/DependenciesSettings';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import styled from 'styled-components';
import DependenciesTreePermissionsView from './DependenciesTreePermissionsView';
import {useTranslation} from 'react-i18next';

interface IDependenciesTabProps {
    attribute: AttributeDetailsTreeAttributeFragment;
    libraryId?: string;
}

const DependenciesSettingsBtn = styled(DependenciesSettings)`
    align-self: flex-end;
`;

function DependenciesTab({attribute}: IDependenciesTabProps): JSX.Element {
    const {t} = useTranslation();
    const [saveAttribute, {error}] = useSaveAttributeMutation();

    if (attribute.type !== AttributeType.tree) {
        return <ErrorDisplay message="This tab is only available for attributes of type tree." />;
    }
    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <div className="flex-col height100">
            <DependenciesSettingsBtn
                dependenciesSettings={
                    attribute.permissions_conf_dependent_values as ITreePermissionsDependentValuesConf
                }
                onChangeSettings={(newSettings: TreePermissionsDependentValuesConfInput) => {
                    saveAttribute({
                        variables: {
                            attrData: {
                                id: attribute.id,
                                permissions_conf_dependent_values: newSettings,
                            },
                        },
                    });
                }}
            />
            {!attribute.permissions_conf_dependent_values ||
            attribute.permissions_conf_dependent_values?.dependenciesTreeAttributes.length === 0 ? (
                t('attributes.dependencies.no_dependencies_configured')
            ) : (
                <DependenciesTreePermissionsView
                    treeAttribute={attribute}
                    dependenciesSettings={
                        attribute.permissions_conf_dependent_values as ITreePermissionsDependentValuesConf
                    }
                />
            )}
        </div>
    );
}

export default DependenciesTab;
