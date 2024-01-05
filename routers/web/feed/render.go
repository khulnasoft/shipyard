// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package feed

import (
	"github.com/khulnasoft/shipyard/modules/context"
)

// RenderBranchFeed render format for branch or file
func RenderBranchFeed(ctx *context.Context) {
	_, _, showFeedType := GetFeedType(ctx.Params(":reponame"), ctx.Req)
	if ctx.Repo.TreePath == "" {
		ShowBranchFeed(ctx, ctx.Repo.Repository, showFeedType)
	} else {
		ShowFileFeed(ctx, ctx.Repo.Repository, showFeedType)
	}
}
