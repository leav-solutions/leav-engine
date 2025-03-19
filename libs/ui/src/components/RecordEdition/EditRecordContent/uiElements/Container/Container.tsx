// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Col, FormInstance, Row} from 'antd';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import {IFormElementProps} from '../../_types';
import {GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';

function Container({
    element,
    computedValues,
    antdForm,
    formIdToLoad,
    readonly,
    pendingValues,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<{}> & {antdForm?: FormInstance; computedValues: GetRecordColumnsValuesRecord}): JSX.Element {
    const {elements: formElements} = useRecordEditionContext();
    const children = formElements[element.id] ?? [];
    const isAlone = children.length < 2;

    return (
        <>
            {children.map(el => (
                <Row data-testid="container-child-element" key={el.id} style={isAlone && {height: '100%'}}>
                    <Col span={24}>
                        {el.uiElement && (
                            <el.uiElement
                                element={el}
                                computedValues={computedValues}
                                readonly={readonly}
                                antdForm={antdForm}
                                pendingValues={pendingValues}
                                formIdToLoad={formIdToLoad}
                                onValueSubmit={onValueSubmit}
                                onValueDelete={onValueDelete}
                                onDeleteMultipleValues={onDeleteMultipleValues}
                            />
                        )}
                    </Col>
                </Row>
            ))}
        </>
    );
}

export default Container;
