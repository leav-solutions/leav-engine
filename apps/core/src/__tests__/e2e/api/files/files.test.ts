import {e2eGuestUser, gqlCreateRecord, makeGraphQlCall} from '../e2eUtils';
import {join} from 'path';
import * as fs from 'fs';
import {getConfig} from '../../../../config';
import {PermissionTypes, RecordPermissionsActions} from '../../../../_types/permissions';
import axios from 'axios';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../../../_types/auth';

const fileExists = async (path: string) => !!(await fs.promises.stat(path).catch(() => false));

const filesLibrary = 'files';
const directoriesLibrary = 'files_directories';
const filesTree = 'files_tree';

describe('Files', () => {
    test('create directory', async () => {
        const conf = await getConfig();
        const rootPath = conf.files.rootPaths.trim().split(':')[1];
        const dirName = 'dirName';

        const workDir = join(rootPath, dirName);

        const res = await makeGraphQlCall(
            `mutation { createDirectory(library: "${directoriesLibrary}", nodeId: "${filesTree}", name: "${dirName}") { id }}`,
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.createDirectory.id).toBeDefined();

        expect(await fileExists(workDir)).toBeTruthy();

        if (await fileExists(workDir)) {
            await fs.promises.rmdir(workDir);
        }
    });

    test('Should not have the permission to create directory', async () => {
        await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.LIBRARY},
                        applyTo: "${directoriesLibrary}",
                        usersGroup: null,
                        actions: [
                            {name: ${RecordPermissionsActions.CREATE_RECORD}, allowed: false}
                        ]
                    }
                ) { type }
            }`);

        await expect(
            makeGraphQlCall(
                `mutation { createDirectory(library: "${directoriesLibrary}", nodeId: "${filesTree}", name: "test") { id }}`,
                {user: e2eGuestUser()},
            ),
        ).rejects.toThrow(/Action forbidden/);
    });

    test('Should not have the permission to force previews generation', async () => {
        await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.LIBRARY},
                        applyTo: "${filesLibrary}",
                        usersGroup: null,
                        actions: [
                            {name: ${RecordPermissionsActions.EDIT_RECORD}, allowed: false}
                        ]
                    }
                ) { type }
            }`);

        await expect(
            makeGraphQlCall(`mutation { forcePreviewsGeneration(libraryId: "${filesLibrary}") }`, {
                user: e2eGuestUser(),
            }),
        ).rejects.toThrow(/Action forbidden/);
    });

    test('Should not have the permission to access static file', async () => {
        const fileId = await gqlCreateRecord('files');

        await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.LIBRARY},
                        applyTo: "${filesLibrary}",
                        usersGroup: null,
                        actions: [
                            {name: ${RecordPermissionsActions.ACCESS_RECORD}, allowed: false}
                        ]
                    }
                ) { type }
            }`);

        const conf = await getConfig();
        const fileUrl = `http://${conf.server.host}:${conf.server.port}/${conf.files.originalsPathPrefix}/files/${fileId}`;
        const token = await e2eGuestUser().getAuthToken();

        await expect(
            axios.get(fileUrl, {
                headers: {
                    Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
                },
            }),
        ).rejects.toMatchObject({
            response: expect.objectContaining({
                status: 401,
                statusText: 'Unauthorized',
            }),
        });
    });
});
