// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal, Tooltip} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {RecordCard} from '_ui/components';
import List from '_ui/components/List';
import {PreviewSize} from '_ui/constants';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeType} from '_ui/_gqlTypes';
import {stopEvent} from '_ui/_utils';

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

function AllValuesCount({values, attributeType}: IAllValuesCountProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [modal, contextHolder] = Modal.useModal();

    const _handleShowMoreClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        stopEvent(e);
        modal.info({
            icon: null,
            content: (
                <List
                    dataSource={values.map(val =>
                        val?.whoAmI ? <RecordCard record={val?.whoAmI} size={PreviewSize.small} /> : val
                    )}
                    size="small"
                    maxHeight="50vh"
                />
            ),
            okText: t('global.close')
        });
    };

    const otherValuesData = values
        .slice(0, 5)
        .map(val => {
            const whoAmI = attributeType === AttributeType.tree ? val?.record?.whoAmI : val?.whoAmI;

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
}

export default AllValuesCount;
