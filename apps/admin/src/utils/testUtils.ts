// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export async function wait(duration = 0) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
