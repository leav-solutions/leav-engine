// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RedoOutlined} from '@ant-design/icons';
import {Button, Space} from 'antd';
import {FunctionComponent} from 'react';
import styled from 'styled-components';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SearchMode} from '_ui/types/search';
import {ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import DisplayOptions from '../DisplayOptions';
import MenuSelection from '../MenuSelection';
import MenuView from '../MenuView';
import SearchItems from '../SearchItems';
import {CreateNewRecordButton} from '../CreateNewRecordButton/CreateNewRecordButton';

interface IMenuItemListProps {
    library: ILibraryDetailExtended;
    refetch?: () => void;
    notifyNewCreation: () => void;
}

const Wrapper = styled(Space)`
    width: 100%;
`;

const MenuItemList: FunctionComponent<IMenuItemListProps> = ({refetch, library, notifyNewCreation}) => {
    const {t} = useSharedTranslation();
    const {state: searchState} = useSearchReducer();

    const canCreateRecord = library.permissions.create_record;

    const selectionMode = searchState.mode === SearchMode.select;

    return (
        <Wrapper>
            {library?.id && <MenuView library={library} />}

            <Space size="large">
                <MenuSelection />
                <SearchItems />
            </Space>

            <Space size="large">
                {!selectionMode && canCreateRecord && (
                    <CreateNewRecordButton
                        label={t('items_list.new')}
                        notifyNewCreation={notifyNewCreation}
                        libraryBehavior={library.behavior}
                        libraryId={library.id}
                        valuesVersions={searchState.valuesVersions}
                    />
                )}

                <Space size="small">
                    <DisplayOptions />
                    <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()} />
                </Space>
            </Space>
        </Wrapper>
    );
};

export default MenuItemList;
