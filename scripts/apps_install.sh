#!/bin/sh
# Copyright LEAV Solutions 2017
# This file is released under LGPL V3
# License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

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

echo 'Injecting these variables:'

echo 'Building and installing applications...'
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export HOME=$(getent passwd `whoami`  | cut -d: -f6) # To avoid issue when trying to read /root folder as non-root user
export SKIP_PREFLIGHT_CHECK=true

# login
BUILD_LOGIN_DIR=../apps/login/dist
DEST_LOGIN_DIR=../apps/core/applications/login
yarn workspace login install
yarn workspace login build
checkExitCode

rm -rf $DEST_LOGIN_DIR
checkExitCode
mv $BUILD_LOGIN_DIR $DEST_LOGIN_DIR
checkExitCode

# portal
BUILD_PORTAL_DIR=../apps/portal/dist
DEST_PORTAL_DIR=../apps/core/applications/portal
yarn workspace portal install
yarn workspace portal build
checkExitCode

rm -rf $DEST_PORTAL_DIR
checkExitCode
mv $BUILD_PORTAL_DIR $DEST_PORTAL_DIR
checkExitCode

# admin
BUILD_LOGIN_DIR=../apps/admin/dist
DEST_LOGIN_DIR=../apps/core/applications/admin
yarn workspace admin install
yarn workspace login build
checkExitCode

rm -rf $DEST_LOGIN_DIR
checkExitCode
mv $BUILD_LOGIN_DIR $DEST_LOGIN_DIR
checkExitCode

echo 'Applications installed!'
echo 'All good!'
exit 0
