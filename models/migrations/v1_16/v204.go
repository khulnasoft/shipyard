// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_16 //nolint

import "xorm.io/xorm"

func AddSSHKeyIsVerified(x *xorm.Engine) error {
	type PublicKey struct {
		Verified bool `xorm:"NOT NULL DEFAULT false"`
	}

	return x.Sync(new(PublicKey))
}
