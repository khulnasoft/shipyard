// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_19 //nolint

import (
	"xorm.io/xorm"
)

func AddIndexForHookTask(x *xorm.Engine) error {
	type HookTask struct {
		ID     int64  `xorm:"pk autoincr"`
		HookID int64  `xorm:"index"`
		UUID   string `xorm:"unique"`
	}

	return x.Sync(new(HookTask))
}
