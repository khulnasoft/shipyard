// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package asymkey

import (
	"context"

	"github.com/khulnasoft/shipyard/models"
	asymkey_model "github.com/khulnasoft/shipyard/models/asymkey"
	"github.com/khulnasoft/shipyard/models/db"
	user_model "github.com/khulnasoft/shipyard/models/user"
)

// DeleteDeployKey deletes deploy key from its repository authorized_keys file if needed.
func DeleteDeployKey(ctx context.Context, doer *user_model.User, id int64) error {
	dbCtx, committer, err := db.TxContext(ctx)
	if err != nil {
		return err
	}
	defer committer.Close()

	if err := models.DeleteDeployKey(dbCtx, doer, id); err != nil {
		return err
	}
	if err := committer.Commit(); err != nil {
		return err
	}

	return asymkey_model.RewriteAllPublicKeys(ctx)
}
