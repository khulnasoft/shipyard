// Copyright 2014 The Gogs Authors. All rights reserved.
// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package misc

import (
	"github.com/khulnasoft/shipyard/modules/context"
	api "github.com/khulnasoft/shipyard/modules/structs"
	"github.com/khulnasoft/shipyard/modules/web"
	"github.com/khulnasoft/shipyard/routers/common"
)

// Markup render markup document to HTML
func Markup(ctx *context.Context) {
	form := web.GetForm(ctx).(*api.MarkupOption)
	common.RenderMarkup(ctx.Base, ctx.Repo, form.Mode, form.Text, form.Context, form.FilePath, form.Wiki)
}
