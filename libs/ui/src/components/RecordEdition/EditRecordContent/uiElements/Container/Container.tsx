import {Col, type FormInstance, Row} from 'antd';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import {type IFormElementProps} from '../../_types';
import {type GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';

function Container({
    element,
    isFormCreationMode,
    computedValues,
    antdForm,
    readonly,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
}: IFormElementProps<unknown> & {antdForm?: FormInstance; computedValues: GetRecordColumnsValuesRecord}): JSX.Element {
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
                                onValueSubmit={onValueSubmit}
                                onValueDelete={onValueDelete}
                                onDeleteMultipleValues={onDeleteMultipleValues}
                                isFormCreationMode={isFormCreationMode}
                            />
                        )}
                    </Col>
                </Row>
            ))}
        </>
    );
}

export default Container;
