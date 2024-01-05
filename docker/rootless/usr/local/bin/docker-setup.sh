#!/bin/bash

# Prepare git folder
mkdir -p ${HOME} && chmod 0700 ${HOME}
if [ ! -w ${HOME} ]; then echo "${HOME} is not writable"; exit 1; fi

# Prepare custom folder
mkdir -p ${SHIPYARD_CUSTOM} && chmod 0700 ${SHIPYARD_CUSTOM}

# Prepare temp folder
mkdir -p ${SHIPYARD_TEMP} && chmod 0700 ${SHIPYARD_TEMP}
if [ ! -w ${SHIPYARD_TEMP} ]; then echo "${SHIPYARD_TEMP} is not writable"; exit 1; fi

#Prepare config file
if [ ! -f ${SHIPYARD_APP_INI} ]; then

    #Prepare config file folder
    SHIPYARD_APP_INI_DIR=$(dirname ${SHIPYARD_APP_INI})
    mkdir -p ${SHIPYARD_APP_INI_DIR} && chmod 0700 ${SHIPYARD_APP_INI_DIR}
    if [ ! -w ${SHIPYARD_APP_INI_DIR} ]; then echo "${SHIPYARD_APP_INI_DIR} is not writable"; exit 1; fi

    # Set INSTALL_LOCK to true only if SECRET_KEY is not empty and
    # INSTALL_LOCK is empty
    if [ -n "$SECRET_KEY" ] && [ -z "$INSTALL_LOCK" ]; then
        INSTALL_LOCK=true
    fi

    # Substitute the environment variables in the template
    APP_NAME=${APP_NAME:-"Shipyard: Git with a cup of tea"} \
    RUN_MODE=${RUN_MODE:-"prod"} \
    RUN_USER=${USER:-"git"} \
    SSH_DOMAIN=${SSH_DOMAIN:-"localhost"} \
    HTTP_PORT=${HTTP_PORT:-"3000"} \
    ROOT_URL=${ROOT_URL:-""} \
    DISABLE_SSH=${DISABLE_SSH:-"false"} \
    SSH_PORT=${SSH_PORT:-"2222"} \
    SSH_LISTEN_PORT=${SSH_LISTEN_PORT:-$SSH_PORT} \
    DB_TYPE=${DB_TYPE:-"sqlite3"} \
    DB_HOST=${DB_HOST:-"localhost:3306"} \
    DB_NAME=${DB_NAME:-"shipyard"} \
    DB_USER=${DB_USER:-"root"} \
    DB_PASSWD=${DB_PASSWD:-""} \
    INSTALL_LOCK=${INSTALL_LOCK:-"false"} \
    DISABLE_REGISTRATION=${DISABLE_REGISTRATION:-"false"} \
    REQUIRE_SIGNIN_VIEW=${REQUIRE_SIGNIN_VIEW:-"false"} \
    SECRET_KEY=${SECRET_KEY:-""} \
    envsubst < /etc/templates/app.ini > ${SHIPYARD_APP_INI}
fi

# Replace app.ini settings with env variables in the form SHIPYARD__SECTION_NAME__KEY_NAME
environment-to-ini --config ${SHIPYARD_APP_INI}
