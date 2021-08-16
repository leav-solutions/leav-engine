// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useActiveLibrary} from '../../../../hooks/ActiveLibHook/ActiveLibHook';
import {IFilter, ITree} from '../../../../_types/types';
import TreesSelectionList from '../../../TreesSelectionList';

interface IChangeAttributeProps {
    filter: IFilter;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

function ChangeTree({filter, showModal, setShowModal}: IChangeAttributeProps): JSX.Element {
    const {t} = useTranslation();

    const [activeLibrary] = useActiveLibrary();
    const [selectedTrees, setSelectedTrees] = useState<ITree[]>();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const handleCancel = () => {
        setShowModal(false);
    };

    const changeTree = () => {
        const newFilters: IFilter[] = searchState.filters.map(f => {
            if (f.index === filter.index) {
                const treeSelected = selectedTrees[0];

                return {
                    ...filter,
                    tree: treeSelected,
                    value: null
                };
            }

            return f;
        });

        searchDispatch({type: SearchActionTypes.SET_FILTERS, filters: newFilters});
        setShowModal(false);
    };

    return (
        <Modal
            visible={showModal}
            onCancel={handleCancel}
            width="70rem"
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('change-attribute.cancel')}
                </Button>,
                <PrimaryBtn key="submit" onClick={changeTree}>
                    {t('change-attribute.submit')}
                </PrimaryBtn>
            ]}
        >
            <TreesSelectionList
                multiple={false}
                library={activeLibrary?.id ?? ''}
                onSelectionChange={setSelectedTrees}
            />
        </Modal>
    );
}

export default ChangeTree;
