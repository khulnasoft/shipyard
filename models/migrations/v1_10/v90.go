// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_10 //nolint

import "xorm.io/xorm"

func ChangeSomeColumnsLengthOfRepo(x *xorm.Engine) error {
	type Repository struct {
		ID          int64  `xorm:"pk autoincr"`
		Description string `xorm:"TEXT"`
		Website     string `xorm:"VARCHAR(2048)"`
		OriginalURL string `xorm:"VARCHAR(2048)"`
	}

	return x.Sync(new(Repository))
}
