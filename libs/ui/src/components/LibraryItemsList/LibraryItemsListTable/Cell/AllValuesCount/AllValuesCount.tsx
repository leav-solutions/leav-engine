// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal, Tooltip} from 'antd';
import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {RecordCard} from '_ui/components';
import List from '_ui/components/List';
import {PreviewSize} from '_ui/constants';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeType} from '_ui/_gqlTypes';
import {stopEvent} from '_ui/_utils';
import {TypeGuards} from '../typeGuards';
import {IRecordIdentityWhoAmI} from '_ui/types';

interface IAllValuesCountProps {
    values: any[];
    attributeType: AttributeType;
}

const MoreValuesCount = styled.span`
    padding: 0 0.75em;
    height: 1.75em;
    line-height: 1.75em;
    margin: 0 1em;
    border-radius: 2em;
    background: ${themeVars.activeColor};
    color: ${themeVars.secondaryTextColor};
    font-weight: bold;
    font-size: 0.9em;
    cursor: pointer;
`;

const AllValuesCount: FunctionComponent<IAllValuesCountProps> = ({values, attributeType}) => {
    const {t} = useSharedTranslation();
    const [modal, contextHolder] = Modal.useModal();

    const _handleShowMoreClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        stopEvent(e);
        modal.info({
            icon: null,
            content: (
                <List
                    dataSource={values.map(value => {
                        let whoAmI = null;

                        if (TypeGuards.isTreeCellValues(values)) {
                            whoAmI = value?.treeValue?.record?.whoAmI;
                        }

                        if (TypeGuards.isLinkCellValues(values)) {
                            whoAmI = value.linkValue?.whoAmI;
                        }

                        return whoAmI ? <RecordCard record={whoAmI} size={PreviewSize.small} /> : value;
                    })}
                    size="small"
                    maxHeight="50vh"
                />
            ),
            okText: t('global.close')
        });
    };

    const otherValuesData = values
        .slice(0, 5)
        .map(value => {
            let whoAmI: IRecordIdentityWhoAmI = null;

            if (TypeGuards.isTreeCellValue(value)) {
                whoAmI = value.treeValue?.record?.whoAmI;
            }

            if (TypeGuards.isLinkCellValue(value)) {
                whoAmI = value.linkValue?.whoAmI;
            }

            if (!whoAmI) {
                return null;
            }

            return whoAmI.label ?? whoAmI.id;
        })
        .filter(val => !!val); // To make sure we don't have null values. This crashes the List component

    const otherValuesList = (
        <List
            dataSource={otherValuesData}
            size="small"
            maxHeight="50vh"
            footer={values.length > 5 && <a onClick={_handleShowMoreClick}>{t('items_list.show_more_links')}</a>}
        />
    );

    return (
        <>
            <Tooltip overlay={otherValuesList} color="white">
                <MoreValuesCount onClick={_handleShowMoreClick} onDoubleClick={stopEvent}>
                    {values.length}
                </MoreValuesCount>
            </Tooltip>
            {contextHolder}
        </>
    );
};

export default AllValuesCount;
