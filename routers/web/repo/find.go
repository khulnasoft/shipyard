// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repo

import (
	"net/http"

	"github.com/khulnasoft/shipyard/modules/base"
	"github.com/khulnasoft/shipyard/modules/context"
)

const (
	tplFindFiles base.TplName = "repo/find/files"
)

// FindFiles render the page to find repository files
func FindFiles(ctx *context.Context) {
	path := ctx.Params("*")
	ctx.Data["TreeLink"] = ctx.Repo.RepoLink + "/src/" + path
	ctx.Data["DataLink"] = ctx.Repo.RepoLink + "/tree-list/" + path
	ctx.HTML(http.StatusOK, tplFindFiles)
}
