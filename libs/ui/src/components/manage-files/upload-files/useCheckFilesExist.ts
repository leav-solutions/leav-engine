import {useRef, useState} from 'react';
import {useDoesFileExistAsChild} from '../shared/useDoesFileExistAsChild';
import {type IUploadFile, type ReplaceDecisions} from '../_types';

export interface IReplaceDecision {
    replace: boolean;
    applyToAll: boolean;
}

/** `null` = the user cancelled the whole upload from the conflict prompt. */
type ReplaceAnswer = IReplaceDecision | null;

/**
 * Walks the queue one file at a time and asks the user what to do with each name that already
 * exists in the destination. The prompt is a declarative modal, so the sequential loop awaits a
 * promise that the modal resolves.
 */
export const useCheckFilesExist = (treeId?: string) => {
    const {doesFileExistAsChild} = useDoesFileExistAsChild(treeId);

    const [conflictingFilename, setConflictingFilename] = useState<string>();
    const decideRef = useRef<(answer: ReplaceAnswer) => void>();

    const _askUser = async (filename: string) =>
        new Promise<ReplaceAnswer>(resolve => {
            decideRef.current = resolve;
            setConflictingFilename(filename);
        });

    const _handleDecide = (answer: ReplaceAnswer) => {
        setConflictingFilename(undefined);
        decideRef.current?.(answer);
        decideRef.current = undefined;
    };

    /** `null` when the user cancelled: nothing must be uploaded at all. */
    const checkFilesExist = async (parentNode: string, files: IUploadFile[]): Promise<ReplaceDecisions | null> => {
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

            const answer = await _askUser(file.name);

            if (answer === null) {
                return null;
            }

            const {replace, applyToAll} = answer;

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
        onCancel: () => _handleDecide(null),
    };
};
