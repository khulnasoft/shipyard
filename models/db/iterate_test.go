// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package db_test

import (
	"context"
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	"github.com/khulnasoft/shipyard/models/unittest"

	"github.com/stretchr/testify/assert"
)

func TestIterate(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())
	xe := unittest.GetXORMEngine()
	assert.NoError(t, xe.Sync(&repo_model.RepoUnit{}))

	cnt, err := db.GetEngine(db.DefaultContext).Count(&repo_model.RepoUnit{})
	assert.NoError(t, err)

	var repoUnitCnt int
	err = db.Iterate(db.DefaultContext, nil, func(ctx context.Context, repo *repo_model.RepoUnit) error {
		repoUnitCnt++
		return nil
	})
	assert.NoError(t, err)
	assert.EqualValues(t, cnt, repoUnitCnt)

	err = db.Iterate(db.DefaultContext, nil, func(ctx context.Context, repoUnit *repo_model.RepoUnit) error {
		has, err := db.ExistByID[repo_model.RepoUnit](ctx, repoUnit.ID)
		if err != nil {
			return err
		}
		if !has {
			return db.ErrNotExist{Resource: "repo_unit", ID: repoUnit.ID}
		}
		assert.EqualValues(t, repoUnit.RepoID, repoUnit.RepoID)
		assert.EqualValues(t, repoUnit.CreatedUnix, repoUnit.CreatedUnix)
		return nil
	})
	assert.NoError(t, err)
}
