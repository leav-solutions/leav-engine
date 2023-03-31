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
echo VITE_APPLICATION_ID $LEAV_APPLICATION_ID
echo VITE_API_URL $LEAV_API_URL
echo VITE_WS_URL $LEAV_WS_URL
echo VITE_DEFAULT_LANG $LEAV_DEFAULT_LANG
echo VITE_AVAILABLE_LANG $LEAV_AVAILABLE_LANG
echo VITE_LOGIN_ENDPOINT $LEAV_LOGIN_ENDPOINT
echo VITE_ENDPOINT $LEAV_APP_ENDPOINT
echo VITE_ENDPOINT_BASE: $LEAV_APP_ENDPOINT_BASE
echo VITE_CORE_URL: $LEAV_CORE_URL
echo PUBLIC_URL /$LEAV_APP_ENDPOINT

export VITE_APPLICATION_ID=$LEAV_APPLICATION_ID
export VITE_API_URL=$LEAV_API_URL
export VITE_WS_URL=$LEAV_WS_URL
export VITE_DEFAULT_LANG=$LEAV_DEFAULT_LANG
export VITE_AVAILABLE_LANG=$LEAV_AVAILABLE_LANG
export VITE_LOGIN_ENDPOINT=$LEAV_LOGIN_ENDPOINT
export VITE_ENDPOINT=$LEAV_APP_ENDPOINT
export VITE_ENDPOINT_BASE=$LEAV_APP_ENDPOINT_BASE
export VITE_CORE_URL=$LEAV_CORE_URL
export PUBLIC_URL=/$LEAV_APP_ENDPOINT

echo 'Building application...'
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export HOME=$(getent passwd `whoami`  | cut -d: -f6) # To avoid issue when trying to read /root folder as non-root user
export SKIP_PREFLIGHT_CHECK=true
yarn install
yarn workspace data-studio build
checkExitCode

echo 'Installing application...'
BUILD_DIR=./dist

# Make sure destination is clean
rm -rf $LEAV_DEST_FOLDER
checkExitCode

# Move build to destination
mv $BUILD_DIR $LEAV_DEST_FOLDER
checkExitCode

echo 'All good!'
exit 0