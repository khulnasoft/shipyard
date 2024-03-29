// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_15 //nolint

import "xorm.io/xorm"

func AddKeyIsVerified(x *xorm.Engine) error {
	type GPGKey struct {
		Verified bool `xorm:"NOT NULL DEFAULT false"`
	}

	return x.Sync(new(GPGKey))
}
