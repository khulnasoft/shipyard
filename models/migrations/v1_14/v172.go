// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_14 //nolint

import (
	"github.com/khulnasoft/shipyard/modules/timeutil"

	"xorm.io/xorm"
)

func AddSessionTable(x *xorm.Engine) error {
	type Session struct {
		Key    string `xorm:"pk CHAR(16)"`
		Data   []byte `xorm:"BLOB"`
		Expiry timeutil.TimeStamp
	}
	return x.Sync(new(Session))
}
