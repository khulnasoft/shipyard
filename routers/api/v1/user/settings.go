// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package user

import (
	"net/http"

	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/modules/context"
	api "github.com/khulnasoft/shipyard/modules/structs"
	"github.com/khulnasoft/shipyard/modules/web"
	"github.com/khulnasoft/shipyard/services/convert"
)

// GetUserSettings returns user settings
func GetUserSettings(ctx *context.APIContext) {
	// swagger:operation GET /user/settings user getUserSettings
	// ---
	// summary: Get user settings
	// produces:
	// - application/json
	// responses:
	//   "200":
	//     "$ref": "#/responses/UserSettings"
	ctx.JSON(http.StatusOK, convert.User2UserSettings(ctx.Doer))
}

// UpdateUserSettings returns user settings
func UpdateUserSettings(ctx *context.APIContext) {
	// swagger:operation PATCH /user/settings user updateUserSettings
	// ---
	// summary: Update user settings
	// parameters:
	// - name: body
	//   in: body
	//   schema:
	//     "$ref": "#/definitions/UserSettingsOptions"
	// produces:
	// - application/json
	// responses:
	//   "200":
	//     "$ref": "#/responses/UserSettings"

	form := web.GetForm(ctx).(*api.UserSettingsOptions)

	if form.FullName != nil {
		ctx.Doer.FullName = *form.FullName
	}
	if form.Description != nil {
		ctx.Doer.Description = *form.Description
	}
	if form.Website != nil {
		ctx.Doer.Website = *form.Website
	}
	if form.Location != nil {
		ctx.Doer.Location = *form.Location
	}
	if form.Language != nil {
		ctx.Doer.Language = *form.Language
	}
	if form.Theme != nil {
		ctx.Doer.Theme = *form.Theme
	}
	if form.DiffViewStyle != nil {
		ctx.Doer.DiffViewStyle = *form.DiffViewStyle
	}

	if form.HideEmail != nil {
		ctx.Doer.KeepEmailPrivate = *form.HideEmail
	}
	if form.HideActivity != nil {
		ctx.Doer.KeepActivityPrivate = *form.HideActivity
	}

	if err := user_model.UpdateUser(ctx, ctx.Doer, false); err != nil {
		ctx.InternalServerError(err)
		return
	}

	ctx.JSON(http.StatusOK, convert.User2UserSettings(ctx.Doer))
}
