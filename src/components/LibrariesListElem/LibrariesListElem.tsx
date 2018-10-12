import * as React from 'react';
import {Link} from 'react-router-dom';
import {List, Transition} from 'semantic-ui-react';
import DeleteLibrary from '../../containers/DeleteLibrary';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';

interface ILibrariesListElemProps {
    library: GET_LIBRARIES_libraries;
}

interface ILibrariesListElemState {
    hover: boolean;
}

class LibrariesListElem extends React.Component<ILibrariesListElemProps, ILibrariesListElemState> {
    constructor(props: ILibrariesListElemProps) {
        super(props);

        this.state = {
            hover: false
        };
    }

    public render() {
        const {library} = this.props;
        const label = library.label !== null ? library.label.fr || library.label.en || library.id : library.id;
        return (
            <List.Item
                as={Link}
                to={'/libraries/edit/' + library.id}
                onMouseEnter={this._onMouseHover}
                onMouseLeave={this._onMouseLeave}
                style={{minHeight: 50}}
            >
                {!library.system && (
                    <Transition visible={this.state.hover} animation="slide left" duration={200}>
                        <List.Content floated="right">
                            <DeleteLibrary library={library} />
                        </List.Content>
                    </Transition>
                )}
                <List.Icon name="book" size="large" />
                <List.Content>
                    <List.Header size="huge">{label}</List.Header>
                    <List.Description>{library.id}</List.Description>
                </List.Content>
            </List.Item>
        );
    }

    private _onMouseHover = () => this.setState({hover: true});
    private _onMouseLeave = () => this.setState({hover: false});
}

export default LibrariesListElem;
