// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Col, Row} from 'antd';
import React from 'react';
import LibrariesList from './LibrariesList';
import TreeList from './TreeList';

function Home(): JSX.Element {
    return (
        <Row gutter={10}>
            <Col span={12} data-testid="libraries-list">
                <LibrariesList />
            </Col>
            <Col span={12} data-testid="trees-list">
                <TreeList />
            </Col>
        </Row>
    );
}

export default Home;
