// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RedoOutlined} from '@ant-design/icons';
import {PreviewSize, RecordCard} from '@leav/ui';
import {Alert, Button, Tooltip} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import {useTranslation} from 'react-i18next';
import {VscLayers} from 'react-icons/vsc';
import styled from 'styled-components';

const HeaderIcons = styled.div`
    margin-right: 60px;
    font-size: 1.5em;
    display: flex;
    align-items: center;

    > * {
        cursor: pointer;
    }
`;

function EditRecordModalHeader(): JSX.Element {
    const {state, dispatch} = useEditRecordModalReducer();
    const {t} = useTranslation();
    const {record} = state;
    const hasExternalUpdates = !!Object.keys(state.externalUpdate.updatedValues).length;

    const title = record ? <RecordCard record={record} size={PreviewSize.small} /> : t('record_edition.new_record');

    const _handleClickValuesVersions = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
            content: state.sidebarContent === 'valuesVersions' ? 'summary' : 'valuesVersions'
        });
    };

    const _handleClickRefresh = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.REQUEST_REFRESH
        });
    };

    const _handleCloseAlert = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.CLEAR_EXTERNAL_UPDATE
        });
    };

    const _handleRefreshFromAlert = () => {
        _handleClickRefresh();
        _handleCloseAlert();
    };

    const externalUpdateModifiers = state.externalUpdate.modifiers.map(modifier => modifier?.label).join(', ');

    return (
        <>
            {title}
            {hasExternalUpdates && (
                <Alert
                    message={t('record_edition.external_update_warning', {modifiers: externalUpdateModifiers})}
                    type="warning"
                    showIcon
                    closable
                    onClose={_handleCloseAlert}
                    action={
                        <Button
                            style={{marginLeft: '1rem'}}
                            icon={<RedoOutlined />}
                            onClick={_handleRefreshFromAlert}
                            size="small"
                        >
                            {t('global.refresh')}
                        </Button>
                    }
                />
            )}
            <HeaderIcons>
                <Tooltip title={t('values_version.title')}>
                    <VscLayers onClick={_handleClickValuesVersions} />
                </Tooltip>
                <Tooltip title={t('global.refresh')}>
                    <RedoOutlined onClick={_handleClickRefresh} />
                </Tooltip>
            </HeaderIcons>
        </>
    );
}

export default EditRecordModalHeader;
