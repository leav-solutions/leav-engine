import {type IFormTextBlockSettings} from '@leav/utils';
import ReactMarkdown from 'react-markdown';
import {type IFormElementProps} from '../../_types';

function TextBlock({element}: IFormElementProps<IFormTextBlockSettings>): JSX.Element {
    return <ReactMarkdown>{element.settings.content}</ReactMarkdown>;
}

export default TextBlock;
