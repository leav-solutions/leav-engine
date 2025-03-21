// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitAvatar, KitBreadcrumb, KitIdCard, KitItemList, KitSpace} from 'aristid-ds';
import {FaTrash} from 'react-icons/fa';
import styled from 'styled-components';

const KitItemListStyled = styled(KitItemList)`
    border: none;
    padding: 0;

    &:hover:not(.kit-item-list-disabled) {
        box-shadow: none;
    }
`;

const KitBreadcrumbStyled = styled(KitBreadcrumb)`
    &.ant-breadcrumb {
        li:last-child .ant-breadcrumb-link {
            color: var(--general-utilities-text-primary);
        }

        a {
            cursor: initial;
            pointer-events: none;

            &:hover {
                background-color: initial;
                cursor: initial;
                pointer-events: none;
            }
        }
    }
`;

const BREADCRUMB_SEPARATOR = '>';

const NOT_FOCUSABLE = -1;

interface IUseTreeNodeItemProps {
    color?: RecordFormElementsValueTreeValue['treeValue']['record']['whoAmI']['color'];
    label?: RecordFormElementsValueTreeValue['treeValue']['record']['whoAmI']['label'];
    ancestors?: RecordFormElementsValueTreeValue['treeValue']['ancestors'];
    canDelete?: boolean;
    onClickToDelete?: (node: RecordFormElementsValueTreeValue) => void;
}

const TreeNodeItem = ({color, label, ancestors, canDelete, onClickToDelete}: IUseTreeNodeItemProps) => {
    const {t} = useSharedTranslation();

    return (
        <KitItemListStyled
            tabIndex={NOT_FOCUSABLE} // We don't want ItemList to be focusable
            idCardSubstitute={
                <KitSpace direction="horizontal">
                    <KitAvatar color={color} label={label} shape="square" />
                    <KitSpace direction="vertical" size="none">
                        <KitIdCard title={label} />
                        <KitBreadcrumbStyled
                            items={ancestors?.map(ancestor => ({
                                title: ancestor.record.whoAmI.label
                            }))}
                            separator={BREADCRUMB_SEPARATOR}
                        />
                    </KitSpace>
                </KitSpace>
            }
            actions={
                canDelete
                    ? [
                          {
                              key: 'delete',
                              icon: <FaTrash />,
                              label: t('global.delete'),
                              title: t('global.delete'),
                              onClick: onClickToDelete
                          }
                      ]
                    : undefined
            }
        />
    );
};

export default TreeNodeItem;
