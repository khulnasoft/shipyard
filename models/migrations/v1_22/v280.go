// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_22 //nolint

import (
	"xorm.io/xorm"
)

func RenameUserThemes(x *xorm.Engine) error {
	sess := x.NewSession()
	defer sess.Close()

	if err := sess.Begin(); err != nil {
		return err
	}

	if _, err := sess.Exec("UPDATE `user` SET `theme` = 'shipyard-light' WHERE `theme` = 'shipyard'"); err != nil {
		return err
	}
	if _, err := sess.Exec("UPDATE `user` SET `theme` = 'shipyard-dark' WHERE `theme` = 'arc-green'"); err != nil {
		return err
	}
	if _, err := sess.Exec("UPDATE `user` SET `theme` = 'shipyard-auto' WHERE `theme` = 'auto'"); err != nil {
		return err
	}

	return sess.Commit()
}
