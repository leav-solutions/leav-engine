import {useRef, useState} from 'react';
import {useDoesFileExistAsChild} from '../shared/useDoesFileExistAsChild';
import {type IUploadFile, type ReplaceDecisions} from '../_types';

export interface IReplaceDecision {
    replace: boolean;
    applyToAll: boolean;
}

/**
 * Walks the queue one file at a time and asks the user what to do with each name that already
 * exists in the destination. The prompt is a declarative modal, so the sequential loop awaits a
 * promise that the modal resolves.
 */
export const useCheckFilesExist = (treeId?: string) => {
    const {doesFileExistAsChild} = useDoesFileExistAsChild(treeId);

    const [conflictingFilename, setConflictingFilename] = useState<string>();
    const decideRef = useRef<(decision: IReplaceDecision) => void>();

    const _askUser = async (filename: string) =>
        new Promise<IReplaceDecision>(resolve => {
            decideRef.current = resolve;
            setConflictingFilename(filename);
        });

    const _handleDecide = (decision: IReplaceDecision) => {
        setConflictingFilename(undefined);
        decideRef.current?.(decision);
        decideRef.current = undefined;
    };

    const checkFilesExist = async (parentNode: string, files: IUploadFile[]): Promise<ReplaceDecisions> => {
        const decisions: ReplaceDecisions = {};
        let appliedToAll: boolean | undefined;

        for (const file of files) {
            if (appliedToAll !== undefined) {
                decisions[file.uid] = appliedToAll;
                continue;
            }

            if (!(await doesFileExistAsChild(parentNode, file.name))) {
                continue;
            }

            const {replace, applyToAll} = await _askUser(file.name);

            decisions[file.uid] = replace;

            if (applyToAll) {
                appliedToAll = replace;
            }
        }

        return decisions;
    };

    return {
        checkFilesExist,
        conflictingFilename,
        onDecide: _handleDecide,
    };
};
