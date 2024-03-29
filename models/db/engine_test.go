// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package db_test

import (
	"path/filepath"
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	issues_model "github.com/khulnasoft/shipyard/models/issues"
	"github.com/khulnasoft/shipyard/models/unittest"
	"github.com/khulnasoft/shipyard/modules/setting"

	_ "github.com/khulnasoft/shipyard/cmd" // for TestPrimaryKeys

	"github.com/stretchr/testify/assert"
)

func TestDumpDatabase(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())

	dir := t.TempDir()

	type Version struct {
		ID      int64 `xorm:"pk autoincr"`
		Version int64
	}
	assert.NoError(t, db.GetEngine(db.DefaultContext).Sync(new(Version)))

	for _, dbType := range setting.SupportedDatabaseTypes {
		assert.NoError(t, db.DumpDatabase(filepath.Join(dir, dbType+".sql"), dbType))
	}
}

func TestDeleteOrphanedObjects(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())

	countBefore, err := db.GetEngine(db.DefaultContext).Count(&issues_model.PullRequest{})
	assert.NoError(t, err)

	_, err = db.GetEngine(db.DefaultContext).Insert(&issues_model.PullRequest{IssueID: 1000}, &issues_model.PullRequest{IssueID: 1001}, &issues_model.PullRequest{IssueID: 1003})
	assert.NoError(t, err)

	orphaned, err := db.CountOrphanedObjects(db.DefaultContext, "pull_request", "issue", "pull_request.issue_id=issue.id")
	assert.NoError(t, err)
	assert.EqualValues(t, 3, orphaned)

	err = db.DeleteOrphanedObjects(db.DefaultContext, "pull_request", "issue", "pull_request.issue_id=issue.id")
	assert.NoError(t, err)

	countAfter, err := db.GetEngine(db.DefaultContext).Count(&issues_model.PullRequest{})
	assert.NoError(t, err)
	assert.EqualValues(t, countBefore, countAfter)
}

func TestPrimaryKeys(t *testing.T) {
	// Some dbs require that all tables have primary keys, see
	//   https://github.com/go-shipyard/shipyard/issues/21086
	//   https://github.com/go-shipyard/shipyard/issues/16802
	// To avoid creating tables without primary key again, this test will check them.
	// Import "github.com/khulnasoft/shipyard/cmd" to make sure each db.RegisterModel in init functions has been called.

	beans, err := db.NamesToBean()
	if err != nil {
		t.Fatal(err)
	}

	whitelist := map[string]string{
		"the_table_name_to_skip_checking": "Write a note here to explain why",
	}

	for _, bean := range beans {
		table, err := db.TableInfo(bean)
		if err != nil {
			t.Fatal(err)
		}
		if why, ok := whitelist[table.Name]; ok {
			t.Logf("ignore %q because %q", table.Name, why)
			continue
		}
		if len(table.PrimaryKeys) == 0 {
			t.Errorf("table %q has no primary key", table.Name)
		}
	}
}
