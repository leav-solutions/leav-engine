#!/bin/sh
# Copyright LEAV Solutions 2017
# This file is released under LGPL V3
# License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

BASEDIR=$(dirname $0)

checkExitCode () {
    code=$?
    if ! [ $code = 0 ]; then
        echo "Something went wrong, exiting with code $code"
        exit 1
    fi
}

if [ "$NODE_ENV" = "test" ]; then
    exit 0;
fi

export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export HOME=$(getent passwd `whoami`  | cut -d: -f6) # To avoid issue when trying to read /root folder as non-root user
export SKIP_PREFLIGHT_CHECK=true

echo '### Install dependencies ###'
yarn install

# login
echo '### Build login ###'
BUILD_LOGIN_DIR="$BASEDIR/../apps/login/dist"
DEST_LOGIN_DIR="$BASEDIR/../apps/core/applications/login"
yarn workspace login build
checkExitCode
echo '### Move login build to core applications folder ###'
rm -rf $DEST_LOGIN_DIR
checkExitCode
mv $BUILD_LOGIN_DIR $DEST_LOGIN_DIR
checkExitCode

# portal
echo '### Build portal ###'
BUILD_PORTAL_DIR="$BASEDIR/../apps/portal/dist"
DEST_PORTAL_DIR="$BASEDIR/../apps/core/applications/portal"
yarn workspace portal build
checkExitCode
echo '### Move portal build to core applications folder ###'
rm -rf $DEST_PORTAL_DIR
checkExitCode
mv $BUILD_PORTAL_DIR $DEST_PORTAL_DIR
checkExitCode

# admin
echo '### Build admin ###'
BUILD_ADMIN_DIR="$BASEDIR/../apps/admin/dist"
DEST_ADMIN_DIR="$BASEDIR/../apps/core/applications/admin"
yarn workspace admin build
checkExitCode
echo '### Move admin build to core applications folder ###'
rm -rf $DEST_ADMIN_DIR
checkExitCode
mv $BUILD_ADMIN_DIR $DEST_ADMIN_DIR
checkExitCode

# data-studio
echo '### Build data-studio ###'
BUILD_DATA_STUDIO_DIR="$BASEDIR/../apps/data-studio/dist"
DEST_DATA_STUDIO_DIR="$BASEDIR/../apps/core/applications/data-studio"
yarn workspace data-studio build
checkExitCode
echo '### Move data-studio build to core applications folder ###'
rm -rf $DEST_DATA_STUDIO_DIR
checkExitCode
mv $BUILD_DATA_STUDIO_DIR $DEST_DATA_STUDIO_DIR
checkExitCode

echo '### Applications installed ###'
exit 0
