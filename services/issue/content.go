// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package issue

import (
	"context"

	issues_model "github.com/khulnasoft/shipyard/models/issues"
	user_model "github.com/khulnasoft/shipyard/models/user"
	notify_service "github.com/khulnasoft/shipyard/services/notify"
)

// ChangeContent changes issue content, as the given user.
func ChangeContent(ctx context.Context, issue *issues_model.Issue, doer *user_model.User, content string) (err error) {
	oldContent := issue.Content

	if err := issues_model.ChangeIssueContent(ctx, issue, doer, content); err != nil {
		return err
	}

	notify_service.IssueChangeContent(ctx, doer, issue, oldContent)

	return nil
}
