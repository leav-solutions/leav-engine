// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal, Tabs} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import moment from 'moment';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {defaultFilterConditionByAttributeFormat, getFieldsKeyFromAttribute} from 'utils';
import {RecordFilterCondition} from '_gqlTypes/globalTypes';
import {AttributeFormat, IFilter, ISelectedAttribute, TreeConditionFilter, ITree} from '../../../../_types/types';
import AttributesSelectionList from '../../../AttributesSelectionList';
import TreesSelectionList from '../../../TreesSelectionList';

interface IAttributeListProps {
    showAttr: boolean;
    setShowAttr: React.Dispatch<React.SetStateAction<boolean>>;
}

export const getDefaultFilterValueByFormat = (format: AttributeFormat): boolean | string | number => {
    switch (format) {
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
            return moment().utcOffset(0).startOf('day').unix();
        case AttributeFormat.numeric:
            return 0;
        default:
            return '';
    }
};

function AddFilter({showAttr, setShowAttr}: IAttributeListProps): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const [attributesChecked, setAttributesChecked] = useState<ISelectedAttribute[]>([]);
    const [selectedTrees, setSelectedTrees] = useState<ITree[]>([]);

    const addFilters = () => {
        let filterIndex = searchState.filters.length;

        const attributesFilters: IFilter[] = attributesChecked.map(attributeChecked => {
            const attribute = searchState.attributes.find(
                att => att.id === attributeChecked.id && att.library === attributeChecked.library
            );

            return {
                index: ++filterIndex,
                key: getFieldsKeyFromAttribute(attributeChecked),
                active: true,
                condition: RecordFilterCondition[defaultFilterConditionByAttributeFormat(attribute.format)],
                attribute,
                value: {value: getDefaultFilterValueByFormat(attribute.format)}
            };
        });

        const treeFilters: IFilter[] = selectedTrees.map(selectedTree => ({
            index: ++filterIndex,
            key: String(filterIndex),
            active: true,
            condition: TreeConditionFilter.CLASSIFIED_IN,
            tree: selectedTree,
            value: {value: null}
        }));

        searchDispatch({
            type: SearchActionTypes.SET_FILTERS,
            filters: [...searchState.filters, ...attributesFilters, ...treeFilters]
        });

        setShowAttr(false);
        setAttributesChecked([]);
        setSelectedTrees([]);
    };

    const handleCancel = () => {
        setAttributesChecked([]);
        setSelectedTrees([]);
        setShowAttr(false);
    };

    return (
        <Modal
            visible={showAttr}
            onCancel={() => setShowAttr(false)}
            // title={t('filters.filters')}
            width="70rem"
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('attributes-list.cancel')}
                </Button>,
                <PrimaryBtn key="add" onClick={addFilters}>
                    {t('attributes-list.add')}
                </PrimaryBtn>
            ]}
            destroyOnClose
        >
            <Tabs>
                <Tabs.TabPane tab={t('filters.attributes')} key="1">
                    <AttributesSelectionList
                        library={searchState.library?.id ?? ''}
                        selectedAttributes={attributesChecked}
                        onSelectionChange={setAttributesChecked}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab={t('filters.trees')} key="2">
                    <TreesSelectionList library={searchState.library?.id ?? ''} onSelectionChange={setSelectedTrees} />
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
}

export default AddFilter;
