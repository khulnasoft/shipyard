// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package pull

import (
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	"github.com/khulnasoft/shipyard/modules/git"
	"github.com/khulnasoft/shipyard/modules/log"
)

// doMergeStyleMerge merges the tracking into the current HEAD - which is assumed to tbe staging branch (equal to the pr.BaseBranch)
func doMergeStyleMerge(ctx *mergeContext, message string) error {
	cmd := git.NewCommand(ctx, "merge", "--no-ff", "--no-commit").AddDynamicArguments(trackingBranch)
	if err := runMergeCommand(ctx, repo_model.MergeStyleMerge, cmd); err != nil {
		log.Error("%-v Unable to merge tracking into base: %v", ctx.pr, err)
		return err
	}

	if err := commitAndSignNoAuthor(ctx, message); err != nil {
		log.Error("%-v Unable to make final commit: %v", ctx.pr, err)
		return err
	}
	return nil
}
