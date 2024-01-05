#!/bin/sh

set -e

if [ ! -f ./build/test-env-check.sh ]; then
  echo "${0} can only be executed in shipyard source root directory"
  exit 1
fi


echo "check uid ..."

# the uid of shipyard defined in "https://shipyard.khulnasoft.com/shipyard/test-env" is 1000
shipyard_uid=$(id -u shipyard)
if [ "$shipyard_uid" != "1000" ]; then
  echo "The uid of linux user 'shipyard' is expected to be 1000, but it is $shipyard_uid"
  exit 1
fi

cur_uid=$(id -u)
if [ "$cur_uid" != "0" -a "$cur_uid" != "$shipyard_uid" ]; then
  echo "The uid of current linux user is expected to be 0 or $shipyard_uid, but it is $cur_uid"
  exit 1
fi
