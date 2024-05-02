// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Breadcrumb, Button, Divider, Space} from 'antd';
import {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {RecordCard} from '_ui/components';
import List from '_ui/components/List';
import {SelectTreeNode} from '_ui/components/SelectTreeNode';
import {PreviewSize} from '_ui/constants';
import useLang from '_ui/hooks/useLang';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ITreeNodeWithRecord} from '_ui/types/trees';
import {RecordFormAttributeTreeAttributeFragment, ValueDetailsTreeValueFragment} from '_ui/_gqlTypes';
import {getTreeRecordKey} from '_ui/_utils';

interface IValuesAddProps {
    attribute: RecordFormAttributeTreeAttributeFragment;
    onAdd: (values: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
}

const Wrapper = styled.div`
    background-color: ${themeVars.defaultBg};
    z-index: 1;
    position: relative;
`;

const SelectionWrapper = styled.div`
    padding: 1em;
    max-height: 350px;
    overflow: auto;
`;

const FooterWrapper = styled.div`
    padding: 0.5em 1em;
    display: flex;
    justify-content: flex-end;
    background: ${themeVars.lightBg};
`;

const BreadcrumbWrapper = styled.div`
    & .record-card .label {
        font-weight: normal;
    }
`;

const BreadcrumbRoot = styled(Breadcrumb)`
    display: flex;
    align-items: center;
`;

type ValueFromList = ValueDetailsTreeValueFragment['treeValue'];

function ValuesAdd({attribute, onAdd, onClose}: IValuesAddProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const valuesList = attribute?.treeValuesList?.enable ? attribute?.treeValuesList?.values ?? [] : [];
    const wrapperRef = useRef<HTMLDivElement>();

    const [selectedValuesFromTree, setSelectedValuesFromTree] = useState<ITreeNodeWithRecord[]>([]);
    const [selectedValuesFromList, setSelectedValuesFromList] = useState<ValueFromList[]>([]);

    useEffect(() => {
        wrapperRef.current.scrollIntoView({block: 'nearest'});
    }, []);

    const _handleSelectionChange = (selection: ValueFromList[]) => setSelectedValuesFromList(selection);

    const _handleSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        if (selected) {
            onAdd([node]);
        }
    };

    const _handleCheck = (selectedNodes: ITreeNodeWithRecord[]) => setSelectedValuesFromTree(selectedNodes);

    const _handleClose = () => onClose();

    const _handleItemClick = (valueListItem: ValueFromList) => {
        const recordKey = valueListItem.id;
        onAdd([
            {
                record: valueListItem.record,
                key: recordKey,
                id: recordKey,
                title: valueListItem.record.whoAmI.label,
                children: null
            }
        ]);
    };

    const _handleSubmit = () => {
        const selection: ITreeNodeWithRecord[] = [
            ...selectedValuesFromList.map(selectedVal => {
                const recordKey = getTreeRecordKey(selectedVal.record);
                return {
                    record: selectedVal.record,
                    id: recordKey,
                    key: recordKey,
                    title: selectedVal.record.whoAmI.label,
                    children: null
                };
            }),
            ...selectedValuesFromTree
        ];

        onAdd(selection);
    };

    const _renderListItem = (item: ValueFromList) => {
        const pathToDisplay = item.ancestors;

        const parents = pathToDisplay.slice(0, -1);
        const element = pathToDisplay.slice(-1)[0];
        const recordCardSettings = {withLibrary: false, withPreview: false};

        const breadcrumbItems = parents.map(ancestor => ({
                key: ancestor.record.id,
                title: <RecordCard record={ancestor.record.whoAmI} size={PreviewSize.small} {...recordCardSettings} />
            }));

        breadcrumbItems.push({
            key: element.record.id,
            title: <RecordCard record={element.record.whoAmI} size={PreviewSize.small} {...recordCardSettings} />
        });

        return (
            <BreadcrumbWrapper>
                <BreadcrumbRoot items={breadcrumbItems} separator=">" />
                {/* {parents.map(ancestor => {
                        return (
                            <BreadcrumbItem key={ancestor.record.id}>
                                <RecordCard
                                    record={ancestor.record.whoAmI}
                                    size={PreviewSize.small}
                                    {...recordCardSettings}
                                />
                                <Breadcrumb.Separator>{'>'}</Breadcrumb.Separator>
                            </BreadcrumbItem>
                        );
                    })}
                    <BreadcrumbItem key={element.record.id}>
                        <RecordCard record={element.record.whoAmI} size={PreviewSize.small} {...recordCardSettings} />
                    </BreadcrumbItem>
                </BreadcrumbRoot> */}
            </BreadcrumbWrapper>
        );
    };

    return (
        <>
            <Wrapper data-testid="values-add" ref={wrapperRef}>
                <SelectionWrapper>
                    {!!valuesList.length && (
                        <>
                            <Divider orientation="left">{t('record_edition.values_list')}</Divider>
                            <List
                                dataSource={valuesList}
                                onItemClick={_handleItemClick}
                                renderItemContent={_renderListItem}
                                selectable={attribute.multiple_values}
                                selectedItems={selectedValuesFromList}
                                onSelectionChange={_handleSelectionChange}
                                pagination={false}
                            />
                        </>
                    )}
                    <Divider orientation="left">{localizedTranslation(attribute.linked_tree.label, lang)}</Divider>
                    <SelectTreeNode
                        tree={attribute.linked_tree}
                        onSelect={_handleSelect}
                        onCheck={_handleCheck}
                        multiple={attribute.multiple_values}
                    />
                </SelectionWrapper>
                {attribute.multiple_values && (
                    <FooterWrapper>
                        <Space>
                            <Button size="small" onClick={_handleClose}>
                                {t('global.cancel')}
                            </Button>
                            <Button type="primary" size="small" onClick={_handleSubmit}>
                                {t('global.submit')}
                            </Button>
                        </Space>
                    </FooterWrapper>
                )}
            </Wrapper>
        </>
    );
}

export default ValuesAdd;
