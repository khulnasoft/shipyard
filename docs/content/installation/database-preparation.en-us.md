---
date: "2020-01-16"
title: "Database Preparation"
slug: "database-prep"
sidebar_position: 10
toc: false
draft: false
aliases:
  - /en-us/database-prep
menu:
  sidebar:
    parent: "installation"
    name: "Database preparation"
    sidebar_position: 10
    identifier: "database-prep"
---

# Database Preparation

You need a database to use Shipyard. Shipyard supports PostgreSQL (>= 12), MySQL (>= 8.0), MariaDB (>= 10.4), SQLite (builtin), and MSSQL (>= 2012 SP4). This page will guide into preparing database. Only PostgreSQL and MySQL will be covered here since those database engines are widely-used in production. If you plan to use SQLite, you can ignore this chapter.

If you use an unsupported database version, please [get in touch](/help/support) with us for information on our Extended Support Contracts. We can provide testing and support for older databases and integrate those fixes into the Shipyard codebase.

Database instance can be on same machine as Shipyard (local database setup), or on different machine (remote database).

Note: All steps below requires that the database engine of your choice is installed on your system. For remote database setup, install the server application on database instance and client program on your Shipyard server. The client program is used to test connection to the database from Shipyard server, while Shipyard itself use database driver provided by Go to accomplish the same thing. In addition, make sure you use same engine version for both server and client for some engine features to work. For security reason, protect `root` (MySQL) or `postgres` (PostgreSQL) database superuser with secure password. The steps assumes that you run Linux for both database and Shipyard servers.

## MySQL/MariaDB

1. For remote database setup, you will need to make MySQL listen to your IP address. Edit `bind-address` option on `/etc/mysql/my.cnf` on database instance to:

    ```ini
    bind-address = 203.0.113.3
    ```

2. On database instance, login to database console as root:

    ```
    mysql -u root -p
    ```

    Enter the password as prompted.

3. Create database user which will be used by Shipyard, authenticated by password. This example uses `'shipyard'` as password. Please use a secure password for your instance.

    For local database:

    ```sql
    SET old_passwords=0;
    CREATE USER 'shipyard'@'%' IDENTIFIED BY 'shipyard';
    ```

    For remote database:

    ```sql
    SET old_passwords=0;
    CREATE USER 'shipyard'@'192.0.2.10' IDENTIFIED BY 'shipyard';
    ```

    where `192.0.2.10` is the IP address of your Shipyard instance.

    Replace username and password above as appropriate.

4. Create database with UTF-8 charset and collation. Make sure to use `utf8mb4` charset instead of `utf8` as the former supports all Unicode characters (including emojis) beyond _Basic Multilingual Plane_. Also, collation chosen depending on your expected content. When in doubt, use either `unicode_ci` or `general_ci`.

    ```sql
    CREATE DATABASE shipyarddb CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
    ```

    Replace database name as appropriate.

5. Grant all privileges on the database to database user created above.

    For local database:

    ```sql
    GRANT ALL PRIVILEGES ON shipyarddb.* TO 'shipyard';
    FLUSH PRIVILEGES;
    ```

    For remote database:

    ```sql
    GRANT ALL PRIVILEGES ON shipyarddb.* TO 'shipyard'@'192.0.2.10';
    FLUSH PRIVILEGES;
    ```

6. Quit from database console by `exit`.

7. On your Shipyard server, test connection to the database:

    ```
    mysql -u shipyard -h 203.0.113.3 -p shipyarddb
    ```

    where `shipyard` is database username, `shipyarddb` is database name, and `203.0.113.3` is IP address of database instance. Omit `-h` option for local database.

    You should be connected to the database.

## PostgreSQL

1. For remote database setup, configure PostgreSQL on database instance to listen to your IP address by editing `listen_addresses` on `postgresql.conf` to:

    ```ini
    listen_addresses = 'localhost, 203.0.113.3'
    ```

2. PostgreSQL uses `md5` challenge-response encryption scheme for password authentication by default. Nowadays this scheme is not considered secure anymore. Use SCRAM-SHA-256 scheme instead by editing the `postgresql.conf` configuration file on the database server to:

    ```ini
    password_encryption = scram-sha-256
    ```

    Restart PostgreSQL to apply the setting.

3. On the database server, login to the database console as superuser:

    ```
    su -c "psql" - postgres
    ```

4. Create database user (role in PostgreSQL terms) with login privilege and password. Please use a secure, strong password instead of `'shipyard'` below:

    ```sql
    CREATE ROLE shipyard WITH LOGIN PASSWORD 'shipyard';
    ```

    Replace username and password as appropriate.

5. Create database with UTF-8 charset and owned by the database user created earlier. Any `libc` collations can be specified with `LC_COLLATE` and `LC_CTYPE` parameter, depending on expected content:

    ```sql
    CREATE DATABASE shipyarddb WITH OWNER shipyard TEMPLATE template0 ENCODING UTF8 LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';
    ```

    Replace database name as appropriate.

6. Allow the database user to access the database created above by adding the following authentication rule to `pg_hba.conf`.

    For local database:

    ```ini
    local    shipyarddb    shipyard    scram-sha-256
    ```

    For remote database:

    ```ini
    host    shipyarddb    shipyard    192.0.2.10/32    scram-sha-256
    ```

    Replace database name, user, and IP address of Shipyard instance with your own.

    Note: rules on `pg_hba.conf` are evaluated sequentially, that is the first matching rule will be used for authentication. Your PostgreSQL installation may come with generic authentication rules that match all users and databases. You may need to place the rules presented here above such generic rules if it is the case.

    Restart PostgreSQL to apply new authentication rules.

7. On your Shipyard server, test connection to the database.

    For local database:

    ```
    psql -U shipyard -d shipyarddb
    ```

    For remote database:

    ```
    psql "postgres://shipyard@203.0.113.3/shipyarddb"
    ```

    where `shipyard` is database user, `shipyarddb` is database name, and `203.0.113.3` is IP address of your database instance.

    You should be prompted to enter password for the database user, and connected to the database.

## Database Connection over TLS

If the communication between Shipyard and your database instance is performed through a private network, or if Shipyard and the database are running on the same server, this section can be omitted since the security between Shipyard and the database instance is not critically exposed. If instead the database instance is on a public network, use TLS to encrypt the connection to the database, as it is possible for third-parties to intercept the traffic data.

### Prerequisites

- You need two valid TLS certificates, one for the database instance (database server) and one for the Shipyard instance (database client). Both certificates must be signed by a trusted CA.
- The database certificate must contain `TLS Web Server Authentication` in the `X509v3 Extended Key Usage` extension attribute, while the client certificate needs `TLS Web Client Authentication` in the corresponding attribute.
- On the database server certificate, one of `Subject Alternative Name` or `Common Name` entries must be the fully-qualified domain name (FQDN) of the database instance (e.g. `db.example.com`). On the database client certificate, one of the entries mentioned above must contain the database username that Shipyard will be using to connect.
- You need domain name mappings of both Shipyard and database servers to their respective IP addresses. Either set up DNS records for them or add local mappings to `/etc/hosts` (`%WINDIR%\System32\drivers\etc\hosts` in Windows) on each system. This allows the database connections to be performed by domain name instead of IP address. See documentation of your system for details.

### PostgreSQL TLS

The PostgreSQL driver used by Shipyard supports two-way TLS. In two-way TLS, both database client and server authenticate each other by sending their respective certificates to their respective opposite for validation. In other words, the server verifies client certificate, and the client verifies server certificate.

1. On the server with the database instance, place the following credentials:

    - `/path/to/postgresql.crt`: Database instance certificate
    - `/path/to/postgresql.key`: Database instance private key
    - `/path/to/root.crt`: CA certificate chain to validate client certificates

2. Add following options to `postgresql.conf`:

    ```ini
    ssl = on
    ssl_ca_file = '/path/to/root.crt'
    ssl_cert_file = '/path/to/postgresql.crt'
    ssl_key_file = '/path/to/postgresql.key'
    ssl_min_protocol_version = 'TLSv1.2'
    ```

3. Adjust credentials ownership and permission, as required by PostgreSQL:

    ```
    chown postgres:postgres /path/to/root.crt /path/to/postgresql.crt /path/to/postgresql.key
    chmod 0600 /path/to/root.crt /path/to/postgresql.crt /path/to/postgresql.key
    ```

4. Edit `pg_hba.conf` rule to only allow Shipyard database user to connect over SSL, and to require client certificate verification.

    For PostgreSQL 12:

    ```ini
    hostssl    shipyarddb    shipyard    192.0.2.10/32    scram-sha-256    clientcert=verify-full
    ```

    For PostgreSQL 11 and earlier:

    ```ini
    hostssl    shipyarddb    shipyard    192.0.2.10/32    scram-sha-256    clientcert=1
    ```

    Replace database name, user, and IP address of Shipyard instance as appropriate.

5. Restart PostgreSQL to apply configurations above.

6. On the server running the Shipyard instance, place the following credentials under the home directory of the user who runs Shipyard (e.g. `git`):

    - `~/.postgresql/postgresql.crt`: Database client certificate
    - `~/.postgresql/postgresql.key`: Database client private key
    - `~/.postgresql/root.crt`: CA certificate chain to validate server certificate

    Note: Those file names above are hardcoded in PostgreSQL and it is not possible to change them.

7. Adjust credentials, ownership and permission as required:

    ```
    chown git:git ~/.postgresql/postgresql.crt ~/.postgresql/postgresql.key ~/.postgresql/root.crt
    chown 0600 ~/.postgresql/postgresql.crt ~/.postgresql/postgresql.key ~/.postgresql/root.crt
    ```

8. Test the connection to the database:

    ```
    psql "postgres://shipyard@example.db/shipyarddb?sslmode=verify-full"
    ```

    You should be prompted to enter password for the database user, and then be connected to the database.

### MySQL/MariaDB TLS

While the MySQL driver used by Shipyard also supports two-way TLS, Shipyard currently supports only one-way TLS. See issue #10828 for details.

In one-way TLS, the database client verifies the certificate sent from server during the connection handshake, and the server assumes that the connected client is legitimate, since client certificate verification doesn't take place.

1. On the database instance, place the following credentials:

    - `/path/to/mysql.crt`: Database instance certificate
    - `/path/to/mysql.key`: Database instance key
    - `/path/to/ca.crt`: CA certificate chain. This file isn't used on one-way TLS, but is used to validate client certificates on two-way TLS.

2. Add following options to `my.cnf`:

    ```ini
    [mysqld]
    ssl-ca = /path/to/ca.crt
    ssl-cert = /path/to/mysql.crt
    ssl-key = /path/to/mysql.key
    tls-version = TLSv1.2,TLSv1.3
    ```

3. Adjust credentials ownership and permission:

    ```
    chown mysql:mysql /path/to/ca.crt /path/to/mysql.crt /path/to/mysql.key
    chmod 0600 /path/to/ca.crt /path/to/mysql.crt /path/to/mysql.key
    ```

4. Restart MySQL to apply the setting.

5. The database user for Shipyard may have been created earlier, but it would authenticate only against the IP addresses of the server running Shipyard. To authenticate against its domain name, recreate the user, and this time also set it to require TLS for connecting to the database:

    ```sql
    DROP USER 'shipyard'@'192.0.2.10';
    CREATE USER 'shipyard'@'example.shipyard' IDENTIFIED BY 'shipyard' REQUIRE SSL;
    GRANT ALL PRIVILEGES ON shipyarddb.* TO 'shipyard'@'example.shipyard';
    FLUSH PRIVILEGES;
    ```

    Replace database user name, password, and Shipyard instance domain as appropriate.

6. Make sure that the CA certificate chain required to validate the database server certificate is on the system certificate store of both the database and Shipyard servers. Consult your system documentation for instructions on adding a CA certificate to the certificate store.

7. On the server running Shipyard, test connection to the database:

    ```
    mysql -u shipyard -h example.db -p --ssl
    ```

    You should be connected to the database.
