// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_21 //nolint

import (
	"xorm.io/xorm"
)

func AddIndexToCommentDependentIssueID(x *xorm.Engine) error {
	type Comment struct {
		DependentIssueID int64 `xorm:"index"`
	}

	return x.Sync(new(Comment))
}
