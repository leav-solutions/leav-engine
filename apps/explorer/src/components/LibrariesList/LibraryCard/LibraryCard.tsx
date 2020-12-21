// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExportOutlined, HeartOutlined, InfoCircleOutlined, ToolOutlined} from '@ant-design/icons';
import {Card, Col} from 'antd';
import React from 'react';
import {useHistory} from 'react-router-dom';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar.js';
import {localizedLabel} from '../../../utils';
import {ILibrary} from '../../../_types/types';

interface ILibraryCardProps {
    lib: ILibrary;
    active: boolean;
}

function LibraryCard({lib, active}: ILibraryCardProps): JSX.Element {
    const history = useHistory();

    const goLib = () => {
        const detailUrl = `/library/items/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`;
        history.push(detailUrl);
    };

    const handleChangeLibSelected = () => {
        history.push(`/library/list/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`);
    };

    const [{lang}] = useLang();

    return (
        <Col span={6}>
            <Card
                key={lib.id}
                hoverable
                actions={[
                    <ExportOutlined onClick={goLib} />,
                    <HeartOutlined />,
                    <ToolOutlined />,
                    <InfoCircleOutlined onClick={handleChangeLibSelected} />
                ]}
                style={active ? {border: `1px solid ${themingVar['@primary-color']}`} : {}}
            >
                <Card.Meta>{lib.id}</Card.Meta>
                <Card.Meta title={localizedLabel(lib.label, lang) ?? lib.id} description={lib.id} />
            </Card>
        </Col>
    );
}

export default LibraryCard;
