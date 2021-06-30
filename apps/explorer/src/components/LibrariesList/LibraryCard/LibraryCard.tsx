// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ArrowsAltOutlined,
    ArrowUpOutlined,
    HeartOutlined,
    HeartFilled,
    InfoCircleOutlined,
    ToolOutlined
} from '@ant-design/icons';
import {Card, Col} from 'antd';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar.js';
import {localizedLabel} from '../../../utils';
import {ILibrary} from '../../../_types/types';
import ImportModal from '../LibraryImport/ImportModal';

interface ILibraryCardProps {
    lib: ILibrary;
    active: boolean;
    isFavorite?: boolean;
    onUpdateFavorite: (libId: string) => Promise<void>;
}

function LibraryCard({lib, active, isFavorite = false, onUpdateFavorite}: ILibraryCardProps): JSX.Element {
    const history = useHistory();
    const [importModal = false, setImportModal] = useState<boolean>();

    const goLib = () => {
        const detailUrl = `/library/items/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`;
        history.push(detailUrl);
    };

    const handleChangeLibSelected = () => {
        history.push(`/library/list/${lib.id}/${lib.gqlNames.query}/${lib.gqlNames.filter}`);
    };

    const _handleFavoriteClick = async () => {
        await onUpdateFavorite(lib.id);
    };

    const [{lang}] = useLang();

    return (
        <Col span={6}>
            <Card
                key={lib.id}
                hoverable
                actions={[
                    <ArrowsAltOutlined onClick={goLib} />,
                    isFavorite ? (
                        <HeartFilled onClick={_handleFavoriteClick} />
                    ) : (
                        <HeartOutlined onClick={_handleFavoriteClick} />
                    ),
                    <ToolOutlined />,
                    <ArrowUpOutlined onClick={() => setImportModal(true)} />,
                    <InfoCircleOutlined onClick={handleChangeLibSelected} />
                ]}
                style={active ? {border: `1px solid ${themingVar['@primary-color']}`} : {}}
            >
                <Card.Meta>{lib.id}</Card.Meta>
                <Card.Meta title={localizedLabel(lib.label, lang) ?? lib.id} description={lib.id} />
            </Card>
            {importModal && (
                <ImportModal key={'import'} library={lib.id} open={importModal} onClose={() => setImportModal(false)} />
            )}
        </Col>
    );
}

export default LibraryCard;
