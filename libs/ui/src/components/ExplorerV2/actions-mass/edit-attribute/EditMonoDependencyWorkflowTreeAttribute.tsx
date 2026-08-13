import {type RecordFilterInput} from '_ui/_gqlTypes';
import {KitCollapse, KitLoader, KitSpace, KitTag, KitTypography} from 'aristid-ds';
import {useDelayedLoading} from '_ui/hooks/useDelayedLoading';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type MassEditableAttribute, type SetAttributeMappingWithDependency} from './_types';
import {EditTreeAttributeValuesMapping} from './EditTreeAttributeValuesMapping';
import {useDependencyValues} from './useDependencyValues';

export const EditMonoDependencyWorkflowTreeAttribute = ({
    libraryId,
    attribute,
    massSelectionFilters,
    setAttributeMapping,
}: {
    libraryId: string;
    attribute: MassEditableAttribute;
    massSelectionFilters: RecordFilterInput[];
    setAttributeMapping: SetAttributeMappingWithDependency;
}) => {
    const {t} = useSharedTranslation();

    const [monoDependencyAttribute, _ignoredCurrentAttribute] = attribute.dependencies.toSorted(a =>
        a.id === attribute.id ? 1 : -1,
    );

    const {dependencyValues, loading} = useDependencyValues({
        libraryId,
        monoDependencyAttribute,
        massSelectionFilters,
    });

    const isLoaderVisible = useDelayedLoading(loading);

    if (isLoaderVisible) {
        return <KitLoader />;
    }

    return (
        <KitSpace direction="vertical" style={{width: '100%'}}>
            <KitTypography.Text style={{paddingTop: 'calc(var(--general-spacing-s) * 1px)'}}>
                {t('explorer.massAction.editAttribute_mono_dependency_workflow_notice')}
            </KitTypography.Text>
            {dependencyValues.map(
                ({
                    key,
                    label,
                    dependencyAttributeId,
                    dependencyAttributeNodeId,
                    filtersWithDependency,
                    dependencyFilter,
                }) => (
                    <KitCollapse
                        key={key}
                        items={[
                            {
                                key: '1',
                                label: <KitTag type="secondary">{label}</KitTag>,
                                children: (
                                    <EditTreeAttributeValuesMapping
                                        libraryId={libraryId}
                                        attribute={attribute}
                                        dependencyAttributeId={dependencyAttributeId}
                                        dependencyAttributeNodeId={dependencyAttributeNodeId}
                                        massSelectionFilters={filtersWithDependency}
                                        setAttributeMapping={({before, after, occurrenceCount}) => {
                                            setAttributeMapping({
                                                before,
                                                after,
                                                occurrenceCount,
                                                dependencyFilter,
                                            });
                                        }}
                                    />
                                ),
                            },
                        ]}
                    />
                ),
            )}
        </KitSpace>
    );
};
