// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('VersionProfiles', () => {
    const testTreeName = 'test_version_profile_tree';
    const profileId = 'test_version_profile';

    beforeAll(async () => {
        await gqlSaveTree(testTreeName, 'Test Tree', ['users']);
    });

    test('CRUD', async () => {
        // Create profile
        const resSaveProfile = await makeGraphQlCall(`mutation {
            saveVersionProfile(versionProfile: {
                id: "${profileId}",
                label: {en: "test_profile"},
                description: {en: "Best profile ever!"},
                trees: ["${testTreeName}"],
            }) {
              id
              trees {
                id
              }
            }
          }
        `);

        expect(resSaveProfile.status).toBe(200);
        expect(resSaveProfile.data.errors).toBeUndefined();
        expect(resSaveProfile.data.data.saveVersionProfile.id).toBeTruthy();
        expect(resSaveProfile.data.data.saveVersionProfile.trees[0].id).toBeTruthy();

        // Get view
        const resGetProfiles = await makeGraphQlCall(`{
            versionProfiles {
                list {
                    id
                    trees {
                        id
                    }
                }
            }
          }`);

        expect(resGetProfiles.status).toBe(200);
        expect(resGetProfiles.data.errors).toBeUndefined();
        expect(resGetProfiles.data.data.versionProfiles.list.length).toBeGreaterThanOrEqual(1);
        expect(resGetProfiles.data.data.versionProfiles.list[0].trees[0].id).toBeTruthy();

        // Update view
        const resUpdateProfile = await makeGraphQlCall(`mutation {
            saveVersionProfile(versionProfile: {
              id: "${profileId}",
              label: {en: "test_profile modified"},
            }) {
              id
              label
            }
          }
        `);

        expect(resUpdateProfile.status).toBe(200);
        expect(resUpdateProfile.data.errors).toBeUndefined();
        expect(resUpdateProfile.data.data.saveVersionProfile.label.en).toBe('test_profile modified');

        // Delete view
        const resDeleteProfile = await makeGraphQlCall(`mutation {
            deleteVersionProfile(id: "${profileId}") {
                id
            }
        }`);

        expect(resDeleteProfile.status).toBe(200);
        expect(resDeleteProfile.data.errors).toBeUndefined();
        expect(resDeleteProfile.data.data.deleteVersionProfile.id).toBe(profileId);
    });
});
