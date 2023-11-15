// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import {useTranslation} from 'react-i18next';
import {List} from 'semantic-ui-react';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '_gqlTypes/GET_LIBRARIES';
import Loading from '../shared/Loading';

export interface IRootSelectorContainerProps {
    restrictToRoots: string[];
    onSelect: (root: string) => void;
    lang: string[];
}
interface IRootSelectorElemProps {
    onSelect: (root: string) => void;
    elem: any;
}

function RootSelectorContainer({restrictToRoots, onSelect, lang}: IRootSelectorContainerProps) {
    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery);
    const {t} = useTranslation();
    if (loading) {
        return <Loading />;
    }
    if (error) {
        return <p data-testid="error">{error.message}</p>;
    }

    const librariesList = (restrictToRoots.length > 0
        ? data.libraries.list.filter(lib => restrictToRoots.includes(lib.id))
        : data.libraries.list
    ).map(lib => ({
        id: lib.id,
        label: lib.label[lang[0]]
    }));

    return (
        <div className="ui placeholder segment">
            <div className="ui two column relaxed stackable grid">
                <div className="middle aligned column">
                    <List selection>
                        {librariesList.map(lib => {
                            return <RootSelectorElem key={lib.id} onSelect={onSelect} elem={lib} />;
                        })}
                    </List>
                </div>
                <div className="middle aligned column">
                    <div className="ui visible info large message">{t('navigator.select_root')}</div>
                </div>
            </div>
            <div className="ui vertical divider">
                <i className="angle double left icon" />
            </div>
        </div>
    );
}

function RootSelectorElem({onSelect, elem}: IRootSelectorElemProps) {
    const handleClick = () => {
        onSelect(elem.id);
    };
    return (
        <List.Item onClick={handleClick}>
            <List.Icon name="book" size="big" />
            <List.Content>
                <List.Header>{elem.label}</List.Header>
                {elem.id}
            </List.Content>
        </List.Item>
    );
}

export default RootSelectorContainer;
