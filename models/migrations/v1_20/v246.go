// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_20 //nolint

import (
	"xorm.io/xorm"
)

func AddNewColumnForProject(x *xorm.Engine) error {
	type Project struct {
		OwnerID int64 `xorm:"INDEX"`
	}

	return x.Sync(new(Project))
}
