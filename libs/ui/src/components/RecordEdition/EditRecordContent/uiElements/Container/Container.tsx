// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Col, FormInstance, Row} from 'antd';
import {IFormElementProps} from '../../_types';
import {GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';

function Container({
    element,
    antdForm,
    formIdToLoad,
    readonly,
    pendingValues,
    onValueSubmit,
    onValueDelete,
    onCustomEvent,
    onDeleteMultipleValues,
    record,
    valuesMappedByAttributeId,
    elementsByContainer
}: IFormElementProps<{}> & {
    antdForm?: FormInstance;
    valuesMappedByAttributeId?: GetRecordColumnsValuesRecord;
}): JSX.Element {
    const children = elementsByContainer?.[element.id] ?? [];

    const isAlone = children.length < 2;

    return (
        <>
            {children.map(el => (
                <Row data-testid="container-child-element" key={el.id} style={isAlone && {height: '100%'}}>
                    <Col span={24}>
                        {el.uiElement && (
                            <el.uiElement
                                element={el}
                                valuesMappedByAttributeId={valuesMappedByAttributeId}
                                readonly={readonly}
                                antdForm={antdForm}
                                pendingValues={pendingValues}
                                formIdToLoad={formIdToLoad}
                                onValueSubmit={onValueSubmit}
                                onValueDelete={onValueDelete}
                                onCustomEvent={onCustomEvent}
                                onDeleteMultipleValues={onDeleteMultipleValues}
                                record={record}
                                elementsByContainer={elementsByContainer}
                            />
                        )}
                    </Col>
                </Row>
            ))}
        </>
    );
}

export default Container;
