---
date: "2020-01-25T21:00:00-03:00"
title: "Embedded data extraction tool"
slug: "cmd-embedded"
sidebar_position: 20
toc: false
draft: false
aliases:
  - /en-us/cmd-embedded
menu:
  sidebar:
    parent: "administration"
    name: "Embedded data extraction tool"
    sidebar_position: 20
    identifier: "cmd-embedded"
---

# Embedded data extraction tool

Shipyard's executable contains all the resources required to run: templates, images, style-sheets
and translations. Any of them can be overridden by placing a replacement in a matching path
inside the `custom` directory (see [Customizing Shipyard](administration/customizing-shipyard.md)).

To obtain a copy of the embedded resources ready for editing, the `embedded` command from the CLI
can be used from the OS shell interface.

**NOTE:** The embedded data extraction tool is included in Shipyard versions 1.12 and above.

## Listing resources

To list resources embedded in Shipyard's executable, use the following syntax:

```sh
shipyard embedded list [--include-vendored] [patterns...]
```

The `--include-vendored` flag makes the command include vendored files, which are
normally excluded; that is, files from external libraries that are required for Shipyard
(e.g. [octicons](https://octicons.github.com/), etc).

A list of file search patterns can be provided. Shipyard uses [gobwas/glob](https://github.com/gobwas/glob)
for its glob syntax. Here are some examples:

- List all template files, in any virtual directory: `**.tmpl`
- List all mail template files: `templates/mail/**.tmpl`
- List all files inside `public/assets/img`: `public/assets/img/**`

Don't forget to use quotes for the patterns, as spaces, `*` and other characters might have
a special meaning for your command shell.

If no pattern is provided, all files are listed.

### Example: Listing all embedded files

Listing all embedded files with `openid` in their path:

```sh
$ shipyard embedded list '**openid**'
public/assets/img/auth/openid_connect.svg
public/assets/img/openid-16x16.png
templates/user/auth/finalize_openid.tmpl
templates/user/auth/signin_openid.tmpl
templates/user/auth/signup_openid_connect.tmpl
templates/user/auth/signup_openid_navbar.tmpl
templates/user/auth/signup_openid_register.tmpl
templates/user/settings/security_openid.tmpl
```

## Extracting resources

To extract resources embedded in Shipyard's executable, use the following syntax:

```sh
shipyard [--config {file}] embedded extract [--destination {dir}|--custom] [--overwrite|--rename] [--include-vendored] {patterns...}
```

The `--config` option tells Shipyard the location of the `app.ini` configuration file if
it's not in its default location. This option is only used with the `--custom` flag.

The `--destination` option tells Shipyard the directory where the files must be extracted to.
The default is the current directory.

The `--custom` flag tells Shipyard to extract the files directly into the `custom` directory.
For this to work, the command needs to know the location of the `app.ini` configuration
file (`--config`) and, depending of the configuration, be ran from the directory where
Shipyard normally starts. See [Customizing Shipyard](administration/customizing-shipyard.md) for details.

The `--overwrite` flag allows any existing files in the destination directory to be overwritten.

The `--rename` flag tells Shipyard to rename any existing files in the destination directory
as `filename.bak`. Previous `.bak` files are overwritten.

At least one file search pattern must be provided; see `list` subcomand above for pattern
syntax and examples.

### Important notice

Make sure to **only extract those files that require customization**. Files that
are present in the `custom` directory are not upgraded by Shipyard's upgrade process.
When Shipyard is upgraded to a new version (by replacing the executable), many of the
embedded files will suffer changes. Shipyard will honor and use any files found
in the `custom` directory, even if they are old and incompatible.

### Example: Extracting mail templates

Extracting mail templates to a temporary directory:

```sh
$ mkdir tempdir
$ shipyard embedded extract --destination tempdir 'templates/mail/**.tmpl'
Extracting to tempdir:
tempdir/templates/mail/auth/activate.tmpl
tempdir/templates/mail/auth/activate_email.tmpl
tempdir/templates/mail/auth/register_notify.tmpl
tempdir/templates/mail/auth/reset_passwd.tmpl
tempdir/templates/mail/issue/assigned.tmpl
tempdir/templates/mail/issue/default.tmpl
tempdir/templates/mail/notify/collaborator.tmpl
```
