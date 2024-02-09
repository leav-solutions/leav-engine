// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LoadingOutlined} from '@ant-design/icons';
import {Modal, Result, StepProps, Steps} from 'antd';
import {useKitNotification} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IFilter, ISearchSelection, ISelectedAttribute} from '_ui/types';
import {
    AttributeType,
    RecordFilterCondition,
    RecordFilterInput,
    RecordFilterOperator,
    useExportLazyQuery
} from '_ui/_gqlTypes';
import {getRequestFromFilters} from '_ui/_utils/getRequestFromFilter';
import AttributesSelectionList from '../AttributesSelectionList';
import {ErrorDisplay} from '../ErrorDisplay';

export interface IExportModalProps {
    open: boolean;
    library: string;
    selection: ISearchSelection;
    filters?: IFilter[];
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

function ExportModal({library, onClose, selection, filters, open}: IExportModalProps): JSX.Element {
    const {t} = useTranslation();
    const {kitNotification} = useKitNotification();

    const [selectedAttributes, setSelectedAttributes] = useState<ISelectedAttribute[]>([]);
    const [currentStep, setCurrentStep] = useState<ExportSteps>(ExportSteps.ATTRIBUTE_SELECTION);
    const [filepath, setFilepath] = useState<string>('');

    const [runExport, {error: exportError}] = useExportLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            setCurrentStep(ExportSteps.DONE);
            setFilepath(data?.export);

            kitNotification.info({
                message: t('export.export_notification_title'),
                description: null
            });
        },
        onError: error => {
            kitNotification.error({
                message: t('error.error_occurred'),
                description: error.message
            });

            setCurrentStep(ExportSteps.DONE);
        }
    });

    const _runExport = () => {
        setCurrentStep(ExportSteps.PROCESSING);

        let queryFilters: RecordFilterInput[];
        if (selection.allSelected) {
            queryFilters = getRequestFromFilters(filters);
        } else {
            const selectedIds = selection.selected.map(elementSelected => elementSelected.id);

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
                library,
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
            styles={{body: {height: 'calc(100vh - 10rem)'}}}
            cancelButtonProps={{disabled: currentStep === ExportSteps.DONE}}
            destroyOnClose
        >
            <Steps current={currentStep} style={{marginBottom: '2em'}} items={stepsItems} />
            <Content>
                {currentStep === ExportSteps.ATTRIBUTE_SELECTION && (
                    <AttributesSelectionList
                        library={library}
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
