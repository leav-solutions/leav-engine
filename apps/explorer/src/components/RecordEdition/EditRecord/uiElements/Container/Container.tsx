// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Col, Row} from 'antd';
import React from 'react';
import {useFormElementsContext} from '../../hooks/useFormElementsContext';
import {IFormElementProps} from '../../_types';

function Container({element}: IFormElementProps<{}>): JSX.Element {
    const formElements = useFormElementsContext();
    const children = formElements[element.id] ?? [];

    return (
        <>
            {children.map(el => (
                <Row data-testid="container-child-element" key={el.id}>
                    <Col span={24}>{el.uiElement && <el.uiElement element={el} />}</Col>
                </Row>
            ))}
        </>
    );
}

export default Container;
