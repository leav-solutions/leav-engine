// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Col, FormInstance, Row} from 'antd';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import {IFormElementProps} from '../../_types';

function Container({
    element,
    antdForm,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<{}> & {antdForm?: FormInstance}): JSX.Element {
    const {elements: formElements} = useRecordEditionContext();
    const children = formElements[element.id] ?? [];

    return (
        <>
            {children.map(el => (
                <Row data-testid="container-child-element" key={el.id}>
                    <Col span={24}>
                        {el.uiElement && (
                            <el.uiElement
                                element={el}
                                antdForm={antdForm}
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
