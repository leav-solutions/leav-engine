import {type ReactNode} from 'react';
import {type UploadFile} from 'antd';

/**
 * The entries of an antd `fileList` are the browser `File` instances themselves, decorated with
 * antd's own fields — they are never plain objects. Spreading one would drop `name`, `size` and
 * `type`, which live on `File.prototype`, and would break the upload mutation, which sends the
 * instance as-is. Any per-file state we add must therefore be kept outside the file.
 */
export type IUploadFile = UploadFile;

/** Replace decisions taken by the user, keyed by file uid. */
export type ReplaceDecisions = Record<string, boolean>;

export interface IWizardStep {
    key: string;
    title: ReactNode;
    content: ReactNode;
}
