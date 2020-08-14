import {PlusOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {Button, Card, Col, Divider, Row} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {getLibraryDetailQuery} from '../../../queries/libraries/getLibraryDetailQuery';
import {localizedLabel} from '../../../utils';
import {ILabel} from '../../../_types/types';

interface ILibraryDetailProps {
    libId: string;
    libQueryName: string;
    filterName: string;
}

interface IDetails {
    id: string;
    system: boolean;
    label: ILabel;
    attributes: {
        id: string;
        type: string;
        format: string;
        label: ILabel;
    }[];
    totalCount: number;
}

function LibraryDetail({libId, libQueryName, filterName}: ILibraryDetailProps): JSX.Element {
    const {t} = useTranslation();
    const [details, setDetails] = useState<IDetails>();

    const {data: dataLang} = useQuery(getLang);

    const {loading, data, error} = useQuery(getLibraryDetailQuery(libQueryName), {
        variables: {
            libId
        }
    });

    useEffect(() => {
        if (!loading) {
            const dataDetails = data?.libraries?.list[0];
            const totalCount = data[libQueryName]?.totalCount;
            setDetails({...dataDetails, totalCount});
        }
    }, [loading, data, error, libQueryName]);

    if (error) {
        return <div>error</div>;
    }

    return (
        <Card>
            <h3>{localizedLabel(details?.label, dataLang?.lang ?? []) ?? `${t('lib_detail.id')}: ${details?.id}`}</h3>

            <Divider />

            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <h4>{t('lib_detail.lib_info')}</h4>
                    <Card>
                        {details?.totalCount ?? '0'} {t('lib_detail.elements')}
                    </Card>
                    <Button icon={<PlusOutlined />}>{t('lib_detail.new')}</Button>
                </Col>

                <Col span={8}>
                    <h4>{t('lib_detail.search_saves')}</h4>
                    <Card>
                        <NavLink to={`/library/items/${libId}/${libQueryName}/${filterName}`}>
                            {t('lib_detail.search_all')}
                        </NavLink>
                    </Card>
                    <Button icon={<PlusOutlined />}>{t('lib_detail.add_filter')}</Button>
                </Col>

                <Col span={8}>
                    <h4>{t('lib_detail.last_views')}</h4>
                </Col>
            </Row>
        </Card>
    );
}

export default LibraryDetail;
