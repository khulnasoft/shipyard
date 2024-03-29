// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package db_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	"github.com/khulnasoft/shipyard/models/unittest"

	"github.com/stretchr/testify/assert"
	"xorm.io/builder"
)

type mockListOptions struct {
	db.ListOptions
}

func (opts mockListOptions) IsListAll() bool {
	return true
}

func (opts mockListOptions) ToConds() builder.Cond {
	return builder.NewCond()
}

func TestFind(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())
	xe := unittest.GetXORMEngine()
	assert.NoError(t, xe.Sync(&repo_model.RepoUnit{}))

	var repoUnitCount int
	_, err := db.GetEngine(db.DefaultContext).SQL("SELECT COUNT(*) FROM repo_unit").Get(&repoUnitCount)
	assert.NoError(t, err)
	assert.NotEmpty(t, repoUnitCount)

	opts := mockListOptions{}
	repoUnits, err := db.Find[repo_model.RepoUnit](db.DefaultContext, opts)
	assert.NoError(t, err)
	assert.Len(t, repoUnits, repoUnitCount)

	cnt, err := db.Count[repo_model.RepoUnit](db.DefaultContext, opts)
	assert.NoError(t, err)
	assert.EqualValues(t, repoUnitCount, cnt)

	repoUnits, newCnt, err := db.FindAndCount[repo_model.RepoUnit](db.DefaultContext, opts)
	assert.NoError(t, err)
	assert.EqualValues(t, cnt, newCnt)
	assert.Len(t, repoUnits, repoUnitCount)
}
