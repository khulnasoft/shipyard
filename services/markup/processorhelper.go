// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package markup

import (
	"context"

	"github.com/khulnasoft/shipyard/models/user"
	shipyard_context "github.com/khulnasoft/shipyard/modules/context"
	"github.com/khulnasoft/shipyard/modules/markup"
)

func ProcessorHelper() *markup.ProcessorHelper {
	return &markup.ProcessorHelper{
		ElementDir: "auto", // set dir="auto" for necessary (eg: <p>, <h?>, etc) tags
		IsUsernameMentionable: func(ctx context.Context, username string) bool {
			mentionedUser, err := user.GetUserByName(ctx, username)
			if err != nil {
				return false
			}

			shipyardCtx, ok := ctx.(*shipyard_context.Context)
			if !ok {
				// when using general context, use user's visibility to check
				return mentionedUser.Visibility.IsPublic()
			}

			// when using shipyard context (web context), use user's visibility and user's permission to check
			return user.IsUserVisibleToViewer(shipyardCtx, mentionedUser, shipyardCtx.Doer)
		},
	}
}
