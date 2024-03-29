// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package issue

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	issues_model "github.com/khulnasoft/shipyard/models/issues"
	"github.com/khulnasoft/shipyard/models/unittest"
	user_model "github.com/khulnasoft/shipyard/models/user"

	"github.com/stretchr/testify/assert"
)

func TestChangeMilestoneAssign(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())
	issue := unittest.AssertExistsAndLoadBean(t, &issues_model.Issue{RepoID: 1})
	doer := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: 2})
	assert.NotNil(t, issue)
	assert.NotNil(t, doer)

	oldMilestoneID := issue.MilestoneID
	issue.MilestoneID = 2
	assert.NoError(t, ChangeMilestoneAssign(db.DefaultContext, issue, doer, oldMilestoneID))
	unittest.AssertExistsAndLoadBean(t, &issues_model.Comment{
		IssueID:        issue.ID,
		Type:           issues_model.CommentTypeMilestone,
		MilestoneID:    issue.MilestoneID,
		OldMilestoneID: oldMilestoneID,
	})
	unittest.CheckConsistencyFor(t, &issues_model.Milestone{}, &issues_model.Issue{})
}
