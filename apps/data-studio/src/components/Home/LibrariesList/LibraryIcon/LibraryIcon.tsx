// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileOutlined, FolderOutlined, PictureOutlined} from '@ant-design/icons';
import {RecordPreview} from '@leav/ui';
import styled from 'styled-components';
import {GET_LIBRARIES_LIST_libraries_list} from '_gqlTypes/GET_LIBRARIES_LIST';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {PreviewSize} from '_types/types';

const Wrapper = styled.div`
    width: 2rem;
    display: flex;
    justify-content: center;
`;

interface ILibraryIconProps {
    library: Pick<GET_LIBRARIES_LIST_libraries_list, 'id' | 'behavior' | 'icon'>;
}

function LibraryIcon({library}: ILibraryIconProps): JSX.Element {
    const iconSize = '1.2rem';
    const iconNameByBehavior: {[key in LibraryBehavior]: JSX.Element} = {
        [LibraryBehavior.files]: <PictureOutlined style={{fontSize: iconSize}} />,
        [LibraryBehavior.directories]: <FolderOutlined style={{fontSize: iconSize}} />,
        [LibraryBehavior.standard]: <FileOutlined style={{fontSize: iconSize}} />
    };

    const behavior = library?.behavior ?? LibraryBehavior.standard;

    return (
        <Wrapper>
            {library?.icon?.whoAmI?.preview ? (
                <RecordPreview
                    image={library.icon.whoAmI.preview.tiny}
                    color={null}
                    label={null}
                    size={PreviewSize.tiny}
                />
            ) : (
                iconNameByBehavior[behavior]
            )}
        </Wrapper>
    );
}

export default LibraryIcon;
