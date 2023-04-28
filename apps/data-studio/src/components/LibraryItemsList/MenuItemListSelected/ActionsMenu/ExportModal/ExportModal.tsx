// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownloadOutlined, LoadingOutlined} from '@ant-design/icons';
import {useLazyQuery} from '@apollo/client';
import {Button, Modal, Result, StepProps, Steps} from 'antd';
import AttributesSelectionList from 'components/AttributesSelectionList';
import useNotification from 'hooks/useNotification';
import useSearchReducer from 'hooks/useSearchReducer';
import {useState} from 'react';
import {ErrorDisplay} from '@leav/ui';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {setIsPanelOpen} from 'reduxStore/notifications';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {getRequestFromFilters} from 'utils/getRequestFromFilter';
import {exportQuery} from '../../../../../graphQL/queries/export/exportQuery';
import {useActiveLibrary} from '../../../../../hooks/ActiveLibHook/ActiveLibHook';
import {EXPORT, EXPORTVariables} from '../../../../../_gqlTypes/EXPORT';
import {
    AttributeType,
    RecordFilterCondition,
    RecordFilterInput,
    RecordFilterOperator
} from '../../../../../_gqlTypes/globalTypes';
import {
    IInfo,
    InfoChannel,
    InfoPriority,
    InfoType,
    ISelectedAttribute,
    SharedStateSelectionType
} from '../../../../../_types/types';

export interface IExportModalProps {
    open: boolean;
    onClose: () => void;
}

enum ExportSteps {
    ATTRIBUTE_SELECTION = 0,
    PROCESSING = 1,
    DONE = 2
}

const Content = styled.div`
    margin-top: 2em;
`;

const CenteredWrapper = styled.div`
    text-align: center;
`;

const NOTIFICATION_DURATION = 2.5; // seconds

function ExportModal({onClose, open}: IExportModalProps): JSX.Element {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const {selectionState} = useAppSelector(state => ({selectionState: state.selection}));

    const notification = useNotification();

    const {state: searchState} = useSearchReducer();

    const [activeLibrary] = useActiveLibrary();

    const [selectedAttributes, setSelectedAttributes] = useState<ISelectedAttribute[]>([]);
    const [currentStep, setCurrentStep] = useState<ExportSteps>(ExportSteps.ATTRIBUTE_SELECTION);
    const [filepath, setFilepath] = useState<string>('');

    const [runExport, {error: exportError}] = useLazyQuery<EXPORT, EXPORTVariables>(exportQuery, {
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            setCurrentStep(ExportSteps.DONE);

            notification.triggerNotification({
                message: t('export.export_notification_title'),
                icon: <DownloadOutlined style={{color: '#108ee9'}} />,
                onClick: _onNotificationsClick,
                duration: NOTIFICATION_DURATION
            });

            setFilepath(data?.export);
        },
        onError: error => {
            const info: IInfo = {
                type: InfoType.error,
                priority: InfoPriority.high,
                channel: InfoChannel.passive,
                content: `${t('error.error_occurred')}: ${error.message}`
            };

            dispatch(addInfo(info));

            setCurrentStep(ExportSteps.DONE);
        }
    });

    const _runExport = () => {
        setCurrentStep(ExportSteps.PROCESSING);

        let queryFilters: RecordFilterInput[];
        if (selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected) {
            queryFilters = getRequestFromFilters(searchState.filters);
        } else {
            const selectedIds = selectionState.selection.selected.map(elementSelected => elementSelected.id);

            // Convert selected IDs to a search query with OR between each ID
            queryFilters = selectedIds.length
                ? [
                      {
                          operator: RecordFilterOperator.OPEN_BRACKET
                      },
                      ...selectedIds.reduce(
                          (allFilters: RecordFilterInput[], id: string, index: number): RecordFilterInput[] => {
                              allFilters.push({
                                  field: 'id',
                                  condition: RecordFilterCondition.EQUAL,
                                  value: id
                              });

                              if (index < selectedIds.length - 1) {
                                  allFilters.push({
                                      operator: RecordFilterOperator.OR
                                  });
                              }

                              return allFilters;
                          },
                          []
                      ),
                      {
                          operator: RecordFilterOperator.CLOSE_BRACKET
                      }
                  ]
                : [];
        }

        // For tree attribute, attribute path is [parent id].[library id].[attribute id].
        // We don't want the library ID
        const attributesToExport = selectedAttributes.length
            ? selectedAttributes.map(selectedAttribute =>
                  selectedAttribute?.parentAttributeData?.type === AttributeType.tree
                      ? `${selectedAttribute?.parentAttributeData.id}.${selectedAttribute.id}`
                      : selectedAttribute.path
              )
            : ['id'];

        runExport({
            variables: {
                library: activeLibrary?.id || '',
                attributes: attributesToExport,
                filters: queryFilters
            }
        });
    };

    const _handleOk = () => {
        if (currentStep === ExportSteps.DONE) {
            onClose();
            return;
        }

        _runExport();
    };
    const validateButtonLabel = t(currentStep === ExportSteps.DONE ? 'global.close' : 'export.start');

    const _onNotificationsClick = () => {
        dispatch(setIsPanelOpen(true));
        onClose();
    };

    const stepsItems: StepProps[] = [
        {
            title: t('export.attributes_selection')
        },
        {
            title: t('export.export_generation'),
            icon: currentStep === ExportSteps.PROCESSING ? <LoadingOutlined /> : null
        },
        {
            title: t('export.export_done'),
            status: exportError ? 'error' : null
        }
    ];

    return (
        <Modal
            title={t('export.title')}
            okText={validateButtonLabel}
            okType="primary"
            cancelText={t('global.cancel')}
            onOk={_handleOk}
            onCancel={onClose}
            open={open}
            closable
            width="90vw"
            centered
            confirmLoading={currentStep === ExportSteps.PROCESSING}
            bodyStyle={{height: 'calc(100vh - 10rem)'}}
            cancelButtonProps={{disabled: currentStep === ExportSteps.DONE}}
            destroyOnClose
        >
            <Steps current={currentStep} style={{marginBottom: '2em'}} items={stepsItems} />
            <Content>
                {currentStep === ExportSteps.ATTRIBUTE_SELECTION && (
                    <AttributesSelectionList
                        library={activeLibrary!.id}
                        multiple
                        onSelectionChange={setSelectedAttributes}
                        selectedAttributes={selectedAttributes}
                        canExpandExtendedAttributes={false}
                    />
                )}
                {currentStep === ExportSteps.PROCESSING && (
                    <CenteredWrapper data-test-id="processing">{t('global.processing') + '...'}</CenteredWrapper>
                )}
                {currentStep === ExportSteps.DONE && (
                    <CenteredWrapper data-test-id="done">
                        {!exportError ? (
                            <Result
                                status="success"
                                title={t('export.export_done')}
                                subTitle={t('export.export_done_description')}
                                extra={[
                                    <Button type="primary" onClick={_onNotificationsClick}>
                                        {t('export.export_done_open_notifications')}
                                    </Button>
                                ]}
                            />
                        ) : (
                            <ErrorDisplay message={exportError.message} />
                        )}
                    </CenteredWrapper>
                )}
            </Content>
        </Modal>
    );
}

export default ExportModal;
