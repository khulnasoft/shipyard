// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_13 //nolint

import "xorm.io/xorm"

func AddTrustModelToRepository(x *xorm.Engine) error {
	type Repository struct {
		TrustModel int
	}
	return x.Sync(new(Repository))
}
