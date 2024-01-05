#!/usr/bin/env bash
# This is an update script for shipyard installed via the binary distribution
# from dl.shipyard.khulnasoft.com on linux as systemd service. It performs a backup and updates
# Shipyard in place.
# NOTE: This adds the GPG Signing Key of the Shipyard maintainers to the keyring.
# Depends on: bash, curl, xz, sha256sum. optionally jq, gpg
#   See section below for available environment vars.
#   When no version is specified, updates to the latest release.
# Examples:
#   upgrade.sh 1.15.10
#   shipyardhome=/opt/shipyard shipyardconf=$shipyardhome/app.ini upgrade.sh

# Check if shipyard service is running
if ! pidof shipyard &> /dev/null; then
  echo "Error: shipyard is not running."
  exit 1
fi

# Continue with rest of the script if shipyard is running
echo "Shipyard is running. Continuing with rest of script..."

# apply variables from environment
: "${shipyardbin:="/usr/local/bin/shipyard"}"
: "${shipyardhome:="/var/lib/shipyard"}"
: "${shipyardconf:="/etc/shipyard/app.ini"}"
: "${shipyarduser:="git"}"
: "${sudocmd:="sudo"}"
: "${arch:="linux-amd64"}"
: "${service_start:="$sudocmd systemctl start shipyard"}"
: "${service_stop:="$sudocmd systemctl stop shipyard"}"
: "${service_status:="$sudocmd systemctl status shipyard"}"
: "${backupopts:=""}" # see `shipyard dump --help` for available options

function shipyardcmd {
  if [[ $sudocmd = "su" ]]; then
    # `-c` only accept one string as argument.
    "$sudocmd" - "$shipyarduser" -c "$(printf "%q " "$shipyardbin" "--config" "$shipyardconf" "--work-path" "$shipyardhome" "$@")"
  else
    "$sudocmd" --user "$shipyarduser" "$shipyardbin" --config "$shipyardconf" --work-path "$shipyardhome" "$@"
  fi
}

function require {
  for exe in "$@"; do
    command -v "$exe" &>/dev/null || (echo "missing dependency '$exe'"; exit 1)
  done
}

# parse command line arguments
while true; do
  case "$1" in
    -v | --version ) shipyardversion="$2"; shift 2 ;;
    -y | --yes ) no_confirm="yes"; shift ;;
    --ignore-gpg) ignore_gpg="yes"; shift ;;
    "" | -- ) shift; break ;;
    * ) echo "Usage:  [<environment vars>] upgrade.sh [-v <version>] [-y] [--ignore-gpg]"; exit 1;; 
  esac
done

# exit once any command fails. this means that each step should be idempotent!
set -euo pipefail

if [[ -f /etc/os-release ]]; then
  os_release=$(cat /etc/os-release)

  if [[ "$os_release" =~ "OpenWrt" ]]; then
    sudocmd="su"
    service_start="/etc/init.d/shipyard start"
    service_stop="/etc/init.d/shipyard stop"
    service_status="/etc/init.d/shipyard status"
  else
    require systemctl
  fi
fi

require curl xz sha256sum "$sudocmd"

# select version to install
if [[ -z "${shipyardversion:-}" ]]; then
  require jq
  shipyardversion=$(curl --connect-timeout 10 -sL https://dl.shipyard.khulnasoft.com/shipyard/version.json | jq -r .latest.version)
  echo "Latest available version is $shipyardversion"
fi

# confirm update
echo "Checking currently installed version..."
current=$(shipyardcmd --version | cut -d ' ' -f 3)
[[ "$current" == "$shipyardversion" ]] && echo "$current is already installed, stopping." && exit 1
if [[ -z "${no_confirm:-}"  ]]; then
  echo "Make sure to read the changelog first: https://github.com/go-shipyard/shipyard/blob/main/CHANGELOG.md"
  echo "Are you ready to update Shipyard from ${current} to ${shipyardversion}? (y/N)"
  read -r confirm
  [[ "$confirm" == "y" ]] || [[ "$confirm" == "Y" ]] || exit 1
fi

echo "Upgrading shipyard from $current to $shipyardversion ..."

pushd "$(pwd)" &>/dev/null
cd "$shipyardhome" # needed for shipyard dump later

# download new binary
binname="shipyard-${shipyardversion}-${arch}"
binurl="https://dl.shipyard.khulnasoft.com/shipyard/${shipyardversion}/${binname}.xz"
echo "Downloading $binurl..."
curl --connect-timeout 10 --silent --show-error --fail --location -O "$binurl{,.sha256,.asc}"

# validate checksum & gpg signature
sha256sum -c "${binname}.xz.sha256"
if [[ -z "${ignore_gpg:-}" ]]; then
  require gpg
  gpg --keyserver keys.openpgp.org --recv 7C9E68152594688862D62AF62D9AE806EC1592E2
  gpg --verify "${binname}.xz.asc" "${binname}.xz" || { echo 'Signature does not match'; exit 1; }
fi
rm "${binname}".xz.{sha256,asc}

# unpack binary + make executable
xz --decompress --force "${binname}.xz"
chown "$shipyarduser" "$binname"
chmod +x "$binname"

# stop shipyard, create backup, replace binary, restart shipyard
echo "Flushing shipyard queues at $(date)"
shipyardcmd manager flush-queues
echo "Stopping shipyard at $(date)"
$service_stop
echo "Creating backup in $shipyardhome"
shipyardcmd dump $backupopts
echo "Updating binary at $shipyardbin"
cp -f "$shipyardbin" "$shipyardbin.bak" && mv -f "$binname" "$shipyardbin"
$service_start
$service_status

echo "Upgrade to $shipyardversion successful!"

popd
