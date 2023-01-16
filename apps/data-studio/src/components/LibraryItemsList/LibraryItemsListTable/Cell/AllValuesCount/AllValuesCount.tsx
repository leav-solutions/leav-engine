// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Modal, Tooltip} from 'antd';
import List from 'components/shared/List';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {stopEvent} from 'utils';
import {PreviewSize} from '_types/types';

interface IAllValuesCountProps {
    values: any[];
}

const MoreValuesCount = styled.span`
    padding: 0 0.75em;
    height: 1.75em;
    margin: 0 1em;
    border-radius: 2em;
    background: ${themeVars.activeColor};
    color: ${themeVars.secondaryTextColor};
    font-weight: bold;
    font-size: 0.9em;
    cursor: pointer;
`;

function AllValuesCount({values}: IAllValuesCountProps): JSX.Element {
    const {t} = useTranslation();

    const _handleShowMoreClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        stopEvent(e);
        Modal.info({
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

    const otherValuesList = (
        <List
            dataSource={values.slice(0, 5).map(val => val?.whoAmI?.label ?? val?.whoAmI?.id)}
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
        </>
    );
}

export default AllValuesCount;
