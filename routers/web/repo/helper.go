// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repo

import (
	"net/url"
	"sort"

	"github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/modules/context"
	"github.com/khulnasoft/shipyard/modules/git"
)

func MakeSelfOnTop(doer *user.User, users []*user.User) []*user.User {
	if doer != nil {
		sort.Slice(users, func(i, j int) bool {
			if users[i].ID == users[j].ID {
				return false
			}
			return users[i].ID == doer.ID // if users[i] is self, put it before others, so less=true
		})
	}
	return users
}

func HandleGitError(ctx *context.Context, msg string, err error) {
	if git.IsErrNotExist(err) {
		refType := ""
		switch {
		case ctx.Repo.IsViewBranch:
			refType = "branch"
		case ctx.Repo.IsViewTag:
			refType = "tag"
		case ctx.Repo.IsViewCommit:
			refType = "commit"
		}
		ctx.Data["NotFoundPrompt"] = ctx.Locale.Tr("repo.tree_path_not_found_"+refType, ctx.Repo.TreePath, url.PathEscape(ctx.Repo.RefName))
		ctx.Data["NotFoundGoBackURL"] = ctx.Repo.RepoLink + "/src/" + refType + "/" + url.PathEscape(ctx.Repo.RefName)
		ctx.NotFound(msg, err)
	} else {
		ctx.ServerError(msg, err)
	}
}
