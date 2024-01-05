// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_14 //nolint

import (
	"github.com/khulnasoft/shipyard/models/migrations/base"

	"xorm.io/xorm"
)

func ConvertWebhookTaskTypeToString(x *xorm.Engine) error {
	const (
		GOGS int = iota + 1
		SLACK
		SHIPYARD
		DISCORD
		DINGTALK
		TELEGRAM
		MSTEAMS
		FEISHU
		MATRIX
		WECHATWORK
	)

	hookTaskTypes := map[int]string{
		SHIPYARD:   "shipyard",
		GOGS:       "gogs",
		SLACK:      "slack",
		DISCORD:    "discord",
		DINGTALK:   "dingtalk",
		TELEGRAM:   "telegram",
		MSTEAMS:    "msteams",
		FEISHU:     "feishu",
		MATRIX:     "matrix",
		WECHATWORK: "wechatwork",
	}

	type Webhook struct {
		Type string `xorm:"char(16) index"`
	}
	if err := x.Sync(new(Webhook)); err != nil {
		return err
	}

	for i, s := range hookTaskTypes {
		if _, err := x.Exec("UPDATE webhook set type = ? where hook_task_type=?", s, i); err != nil {
			return err
		}
	}

	sess := x.NewSession()
	defer sess.Close()
	if err := sess.Begin(); err != nil {
		return err
	}
	if err := base.DropTableColumns(sess, "webhook", "hook_task_type"); err != nil {
		return err
	}

	return sess.Commit()
}
