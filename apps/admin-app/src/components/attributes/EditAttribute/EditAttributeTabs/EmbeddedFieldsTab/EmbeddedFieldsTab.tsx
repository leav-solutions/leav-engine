// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import SortableTree, {
    addNodeUnderParent,
    ExtendedNodeData,
    OnDragStateChangedData,
    OnVisibilityToggleData,
    removeNodeAtPath,
    TreeIndex,
    TreeItem,
    TreeNode
} from 'react-sortable-tree';
import {Button} from 'semantic-ui-react';
import {getAttributesEmbeddedFieldsQuery} from '../../../../../queries/attributes/getAttributesEmbeddedFieldsQuery';
import {saveAttributesEmbeddedFieldsQuery} from '../../../../../queries/attributes/saveAttributesEmbeddedFieldsQuery';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat} from '../../../../../_gqlTypes/globalTypes';
import {
    IEmbeddedFields,
    IGetEmbeddedFieldsQuery as IQuery,
    IGetEmbeddedFieldsQueryVariables as IQueryVariables,
    ILabel
} from '../../../../../_types/embeddedFields';
import EditButtons from './EditButtons';
import EmbeddedFieldsWrapper from './EmbeddedFieldsWrapper/EmbeddedFieldsWrapper';
import ExpandButtons from './ExpandButtons';

interface IEmbeddedFieldsTabProps {
    attribute: GET_ATTRIBUTES_attributes_list;
}

export interface ITreeItem extends TreeItem {
    id: string;
}

export interface IFlatItem {
    id: string;
    expanded: boolean;
    displayForm: boolean;
}

export interface IFormValue {
    originalId: string;
    id: string;
    label: ILabel | null;
    format: string;
    validation_regex?: string | null;
}

function EmbeddedFieldsTab({attribute}: IEmbeddedFieldsTabProps): JSX.Element {
    const {t} = useTranslation();

    const [treeItems, setTreeItems] = useState<ITreeItem[]>([]);
    const [flatItems, setFlatItems] = useState<IFlatItem[]>([]);
    const [formValues, setFormValues] = useState<IFormValue[]>([]);
    const [isVirtualized, setIsVirtualized] = useState<boolean>(true);

    // Manually set the depth of embedded_fields to max
    const [level] = useState<number>(100);

    const {loading: lQuery, error: eQuery, data: dQuery, refetch: rQuery} = useQuery<IQuery, IQueryVariables>(
        getAttributesEmbeddedFieldsQuery(level),
        {variables: {attId: attribute.id}}
    );

    const [saveAttribute] = useMutation(saveAttributesEmbeddedFieldsQuery);

    const save = useCallback(
        async (newValues: IFormValue[], treeData?: ITreeItem[]) => {
            const saveAndReload = async (items: ITreeItem[]) => {
                const variables = _getNewAttribute(items[0], newValues);

                await saveAttribute({variables});
                rQuery();
            };

            if (treeData) {
                await saveAndReload(treeData);
            } else {
                setTreeItems(items => {
                    saveAndReload(items);
                    return items;
                });
            }
        },
        [saveAttribute, rQuery, setTreeItems]
    );

    useEffect(() => {
        const _getTreeData = (att: IEmbeddedFields): ITreeItem => {
            const formValue = formValues.find(value => value.originalId === att.id);
            let flatItem = flatItems.find(ti => ti.id === att.id);

            if (!flatItem && !formValue) {
                formValues.forEach(values => {
                    if (values.id !== values.originalId) {
                        const item = flatItems.find(ti => ti.id === values.originalId);

                        if (item) {
                            setFlatItems(items => {
                                flatItem = {...item, id: values.id};
                                return [...items.filter(it => it.id !== values.originalId), flatItem];
                            });
                        }
                    }
                });
            }

            if (!flatItem) {
                const newFlatItem: IFlatItem = {
                    id: att.id,
                    expanded: false,
                    displayForm: false
                };

                setFlatItems(items => [...items, newFlatItem]);
            }

            if (!formValue) {
                const newFormValue: IFormValue = {
                    originalId: att.id,
                    id: att.id,
                    label: att.label,
                    format: att.format,
                    validation_regex: att?.validation_regex ?? ''
                };

                setFormValues(values => [...values.filter(value => value.originalId === value.id), newFormValue]);
            }

            const _save = (newValues: IFormValue[]) => save(newValues);

            const children =
                att.format === AttributeFormat.extended && att.embedded_fields
                    ? att.embedded_fields.filter(em => em ?? undefined).map(emb => _getTreeData(emb))
                    : undefined;

            return {
                id: att.id,
                title: (
                    <EmbeddedFieldsWrapper
                        key={att.id}
                        attribute={att as IEmbeddedFields}
                        displayForm={!!flatItem?.displayForm}
                        formValues={formValues}
                        setFormValues={setFormValues}
                        isRoot={att.id === attribute.id}
                        save={_save}
                    />
                ),
                children,
                expanded: flatItem?.expanded
            };
        };

        const newTreeItem: ITreeItem[] = dQuery?.attributes?.list
            ? dQuery.attributes.list.map(att => {
                  return _getTreeData(att as IEmbeddedFields);
              })
            : [];
        setTreeItems(newTreeItem);
    }, [lQuery, dQuery, flatItems, formValues, attribute.id, save]);

    const _onTreeChange = (newTreeData: ITreeItem[]) => {
        setTreeItems(newTreeData);
    };

    const _onVisibilityToggle = ({node}: OnVisibilityToggleData) => {
        setFlatItems(items =>
            items.map(item => {
                if (item.id === node.id) {
                    return {...item, expanded: !item.expanded};
                }
                return item;
            })
        );
    };

    const _manageRowHeight = (info: ExtendedNodeData | any): number => {
        const item = flatItems.find(e => e.id === info.node.id);
        const displayForm = item ? item.displayForm : false;

        if (displayForm) {
            return 260;
        }
        return 60;
    };

    const _getNodeKey = ({treeIndex}: TreeNode & TreeIndex) => {
        return treeIndex;
    };

    const _genNodeProps = (info: ExtendedNodeData) => {
        const expend = () => {
            setFlatItems(items =>
                items.map(item => {
                    if (item.id === info.node.id) {
                        // trigger rowHeight
                        setIsVirtualized(false);

                        return {...item, displayForm: !item.displayForm};
                    }
                    return item;
                })
            );
        };

        const add = async (newId: string) => {
            const newAtt: IEmbeddedFields = {
                id: newId,
                format: 'text',
                label: {
                    fr: '',
                    en: ''
                }
            };

            const _save = (nValues: IFormValue[]) => save(nValues);

            const {treeData} = addNodeUnderParent({
                treeData: treeItems,
                parentKey: info.treeIndex,
                getNodeKey: ({treeIndex}) => treeIndex,
                newNode: {
                    id: newAtt.id,
                    title: (
                        <EmbeddedFieldsWrapper
                            key={newAtt.id}
                            attribute={newAtt}
                            displayForm={!!flatItem?.displayForm}
                            formValues={formValues}
                            setFormValues={setFormValues}
                            save={_save}
                        />
                    ),
                    children: undefined,
                    expanded: false
                }
            });

            const newValues = [...formValues, {originalId: newAtt.id, ...newAtt}];

            setFormValues(newValues);

            save(newValues, treeData as ITreeItem[]);
        };

        const remove = async () => {
            const treeData = removeNodeAtPath({
                treeData: treeItems,
                path: info.path,
                getNodeKey: ({treeIndex}) => treeIndex
            });

            setTreeItems(treeData as ITreeItem[]);

            const variables = _getNewAttribute(treeData[0], formValues);

            await saveAttribute({variables});
            rQuery();
        };

        const flatItem = flatItems.find(item => item.id === info.node.id);

        const _find = (att: IEmbeddedFields, idToFind: string) => {
            if (att.id === idToFind) {
                return att;
            }
            if (att.embedded_fields) {
                const founds = att.embedded_fields.filter(em => !!em).map(em => _find(em, idToFind));
                return founds.find(em => em && em.id === idToFind);
            }
        };

        const embeddedFields: IEmbeddedFields = _find(dQuery?.attributes.list[0] as IEmbeddedFields, info.node.id);

        return {
            buttons: [
                <div
                    key={info.treeIndex + '_btn-group'}
                    style={{
                        position: 'absolute'
                    }}
                >
                    <EditButtons
                        id={info.node.id}
                        flatItem={flatItem}
                        format={embeddedFields?.format}
                        expend={expend}
                        add={add}
                        remove={remove}
                        isRoot={attribute.id === info.node.id}
                        t={t}
                    />
                </div>
            ]
        };
    };

    const _handleSubmit = async () => {
        save(formValues, treeItems);

        // trigger rowHeight
        setIsVirtualized(false);
    };

    const _handleDrop = async ({isDragging}: OnDragStateChangedData) => {
        if (!isDragging) {
            const variables = _getNewAttribute(treeItems[0], formValues);

            await saveAttribute({
                variables
            });

            rQuery();
        }
    };

    if (eQuery) {
        return <div className="error">ERROR</div>;
    }

    return (
        <div
            className="grow height100"
            style={{
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'space-between'
            }}
        >
            <ExpandButtons flatItems={flatItems} setFlatItems={setFlatItems} />
            <div style={{flex: 1}}>
                <SortableTree
                    treeData={treeItems}
                    onChange={_onTreeChange}
                    onVisibilityToggle={_onVisibilityToggle}
                    rowHeight={_manageRowHeight}
                    getNodeKey={_getNodeKey}
                    generateNodeProps={_genNodeProps}
                    onDragStateChanged={_handleDrop}
                    isVirtualized={isVirtualized}
                />
            </div>
            <div>
                <Button color="green" floated="right" onClick={_handleSubmit}>
                    {t('admin.submit')}
                </Button>
            </div>
        </div>
    );
}

const _getNewAttribute = (treeItem: TreeItem, values: IFormValue[]) => {
    const valuesChecked = values.map(value => (!value.originalId ? {...value, originalId: value.id} : value));

    const _recreateAttributeFromTree = (nTreeItems: TreeItem, nValues: IFormValue[]) => {
        const valueFind = nValues.find(value => {
            return value.originalId === nTreeItems.id;
        });

        // remove originalId from value
        const cloneValueFind = valueFind ? (({originalId, ...rest}) => rest)(valueFind) : undefined;

        if (!nTreeItems.children || valueFind?.format !== AttributeFormat.extended) {
            return cloneValueFind;
        }

        return {
            ...cloneValueFind,
            embedded_fields: (nTreeItems?.children as ITreeItem[]).map(em => _recreateAttributeFromTree(em, nValues))
        };
    };

    const variables = {
        attribute: _recreateAttributeFromTree(treeItem, valuesChecked)
    };

    delete variables.attribute.validation_regex;

    return variables;
};

export default EmbeddedFieldsTab;
