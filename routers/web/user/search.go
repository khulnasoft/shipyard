// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package user

import (
	"net/http"

	"github.com/khulnasoft/shipyard/models/db"
	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/modules/context"
	"github.com/khulnasoft/shipyard/services/convert"
)

// Search search users
func Search(ctx *context.Context) {
	listOptions := db.ListOptions{
		Page:     ctx.FormInt("page"),
		PageSize: convert.ToCorrectPageSize(ctx.FormInt("limit")),
	}

	users, maxResults, err := user_model.SearchUsers(ctx, &user_model.SearchUserOptions{
		Actor:       ctx.Doer,
		Keyword:     ctx.FormTrim("q"),
		UID:         ctx.FormInt64("uid"),
		Type:        user_model.UserTypeIndividual,
		IsActive:    ctx.FormOptionalBool("active"),
		ListOptions: listOptions,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, map[string]any{
			"ok":    false,
			"error": err.Error(),
		})
		return
	}

	ctx.SetTotalCountHeader(maxResults)

	ctx.JSON(http.StatusOK, map[string]any{
		"ok":   true,
		"data": convert.ToUsers(ctx, ctx.Doer, users),
	})
}
