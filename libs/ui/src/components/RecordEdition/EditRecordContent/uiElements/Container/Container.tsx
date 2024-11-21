// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Col, FormInstance, Row} from 'antd';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import {FormErrors, IFormElementProps} from '../../_types';

function Container({
    element,
    antdForm,
    formErrors,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues
}: IFormElementProps<{}> & {formErrors?: FormErrors; antdForm?: FormInstance}): JSX.Element {
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
                                formErrors={formErrors?.filter(err => err.name[0] === el.attribute.id) ?? []} //TODO: Adjust here for multivalues ?
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
