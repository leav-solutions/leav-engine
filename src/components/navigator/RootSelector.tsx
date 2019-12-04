import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {List} from 'semantic-ui-react';
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

export const QUERY = gql`
    query ROOT_SELECTOR_QUERY($lang: [AvailableLanguage!]) {
        libraries {
            list {
                id
                label(lang: $lang)
            }
        }
    }
`;

function RootSelectorContainer({restrictToRoots, onSelect, lang}: IRootSelectorContainerProps) {
    const {loading, error, data} = useQuery(QUERY, {
        variables: {lang}
    });
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
