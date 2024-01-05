---
date: "2018-06-06T09:33:00+08:00"
title: "备份与恢复"
slug: "backup-and-restore"
sidebar_position: 11
toc: false
draft: false
aliases:
  - /zh-cn/backup-and-restore
menu:
  sidebar:
    parent: "administration"
    name: "备份与恢复"
    sidebar_position: 11
    identifier: "backup-and-restore"
---

# 备份与恢复

Shipyard 已经实现了 `dump` 命令可以用来备份所有需要的文件到一个zip压缩文件。该压缩文件可以被用来进行数据恢复。

## 备份命令 (`dump`)

先转到git用户的权限: `su git`. 再Shipyard目录运行 `./shipyard dump`。一般会显示类似如下的输出：

```
2016/12/27 22:32:09 Creating tmp work dir: /tmp/shipyard-dump-417443001
2016/12/27 22:32:09 Dumping local repositories.../home/git/shipyard-repositories
2016/12/27 22:32:22 Dumping database...
2016/12/27 22:32:22 Packing dump files...
2016/12/27 22:32:34 Removing tmp work dir: /tmp/shipyard-dump-417443001
2016/12/27 22:32:34 Finish dumping in file shipyard-dump-1482906742.zip
```

最后生成的 `shipyard-dump-1482906742.zip` 文件将会包含如下内容：

* `custom` - 所有保存在 `custom/` 目录下的配置和自定义的文件。
* `data` - 数据目录下的所有内容不包含使用文件session的文件。该目录包含 `attachments`, `avatars`, `lfs`, `indexers`, 如果使用sqlite 还会包含 sqlite 数据库文件。
* `shipyard-db.sql` - 数据库dump出来的 SQL。
* `shipyard-repo.zip` - Git仓库压缩文件。
* `log/` - Logs文件，如果用作迁移不是必须的。

中间备份文件将会在临时目录进行创建，如果您要重新指定临时目录，可以用 `--tempdir` 参数，或者用 `TMPDIR` 环境变量。

## Restore Command (`restore`)

当前还没有恢复命令，恢复需要人工进行。主要是把文件和数据库进行恢复。

例如：

```sh
unzip shipyard-dump-1610949662.zip
cd shipyard-dump-1610949662
mv data/conf/app.ini /etc/shipyard/conf/app.ini
mv data/* /var/lib/shipyard/data/
mv log/* /var/lib/shipyard/log/
mv repos/* /var/lib/shipyard/repositories/
chown -R shipyard:shipyard /etc/shipyard/conf/app.ini /var/lib/shipyard

# mysql
mysql --default-character-set=utf8mb4 -u$USER -p$PASS $DATABASE <shipyard-db.sql
# sqlite3
sqlite3 $DATABASE_PATH <shipyard-db.sql
# postgres
psql -U $USER -d $DATABASE < shipyard-db.sql

service shipyard restart
```
