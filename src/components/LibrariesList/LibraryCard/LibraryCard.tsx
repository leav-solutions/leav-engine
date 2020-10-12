import {ExportOutlined, HeartOutlined, InfoCircleOutlined, ToolOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Card, Col} from 'antd';
import React from 'react';
import {useHistory} from 'react-router-dom';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
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

    const {data: dataLang} = useQuery(getLang);
    // handle case dataLang is null
    const {lang} = dataLang ?? {lang: []};

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
