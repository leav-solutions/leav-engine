#!/bin/sh
# Copyright LEAV Solutions 2017
# This file is released under LGPL V3
# License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

# Supplied env variables:
# - LEAV_API_URL
# - LEAV_CORE_URL
# - LEAV_LOGIN_ENDPOINT
# - LEAV_DEFAULT_LANG
# - LEAV_AVAILABLE_LANG
# - LEAV_APP_ENDPOINT
# - LEAV_APP_APPLICATION_ID

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
echo REACT_APP_APPLICATION_ID: $LEAV_APPLICATION_ID
echo REACT_APP_API_URL: $LEAV_API_URL
echo REACT_APP_WS_URL: $LEAV_WS_URL
echo REACT_APP_DEFAULT_LANG: $LEAV_DEFAULT_LANG
echo REACT_APP_AVAILABLE_LANG: $LEAV_AVAILABLE_LANG
echo REACT_APP_LOGIN_ENDPOINT: $LEAV_LOGIN_ENDPOINT
echo REACT_APP_ENDPOINT: $LEAV_APP_ENDPOINT
echo PUBLIC_URL: /$LEAV_APP_ENDPOINT

export REACT_APP_APPLICATION_ID=$LEAV_APPLICATION_ID
export REACT_APP_API_URL=$LEAV_API_URL
export REACT_APP_WS_URL=$LEAV_WS_URL
export REACT_APP_DEFAULT_LANG=$LEAV_DEFAULT_LANG
export REACT_APP_AVAILABLE_LANG=$LEAV_AVAILABLE_LANG
export REACT_APP_LOGIN_ENDPOINT=$LEAV_LOGIN_ENDPOINT
export REACT_APP_ENDPOINT=$LEAV_APP_ENDPOINT
export PUBLIC_URL=/$LEAV_APP_ENDPOINT

echo 'Building application...'
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export SKIP_PREFLIGHT_CHECK=true
export HOME=$(getent passwd `whoami`  | cut -d: -f6) # To avoid issue when trying to read /root folder as non-root user
yarn install
yarn workspace admin build
checkExitCode

echo 'Installing application...'
BUILD_DIR=./build
rm -rf $LEAV_DEST_FOLDER
checkExitCode

mv $BUILD_DIR $LEAV_DEST_FOLDER
checkExitCode

echo 'All good!'
exit 0