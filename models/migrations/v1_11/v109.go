// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_11 //nolint

import (
	"xorm.io/xorm"
)

func AddCanCreateOrgRepoColumnForTeam(x *xorm.Engine) error {
	type Team struct {
		CanCreateOrgRepo bool `xorm:"NOT NULL DEFAULT false"`
	}

	return x.Sync(new(Team))
}
