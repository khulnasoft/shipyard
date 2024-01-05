// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package user

import (
	"encoding/base64"
	"net/http"

	"github.com/khulnasoft/shipyard/modules/context"
	api "github.com/khulnasoft/shipyard/modules/structs"
	"github.com/khulnasoft/shipyard/modules/web"
	user_service "github.com/khulnasoft/shipyard/services/user"
)

// UpdateAvatar updates the Avatar of an User
func UpdateAvatar(ctx *context.APIContext) {
	// swagger:operation POST /user/avatar user userUpdateAvatar
	// ---
	// summary: Update Avatar
	// produces:
	// - application/json
	// parameters:
	// - name: body
	//   in: body
	//   schema:
	//     "$ref": "#/definitions/UpdateUserAvatarOption"
	// responses:
	//   "204":
	//     "$ref": "#/responses/empty"
	form := web.GetForm(ctx).(*api.UpdateUserAvatarOption)

	content, err := base64.StdEncoding.DecodeString(form.Image)
	if err != nil {
		ctx.Error(http.StatusBadRequest, "DecodeImage", err)
		return
	}

	err = user_service.UploadAvatar(ctx, ctx.Doer, content)
	if err != nil {
		ctx.Error(http.StatusInternalServerError, "UploadAvatar", err)
	}

	ctx.Status(http.StatusNoContent)
}

// DeleteAvatar deletes the Avatar of an User
func DeleteAvatar(ctx *context.APIContext) {
	// swagger:operation DELETE /user/avatar user userDeleteAvatar
	// ---
	// summary: Delete Avatar
	// produces:
	// - application/json
	// responses:
	//   "204":
	//     "$ref": "#/responses/empty"
	err := user_service.DeleteAvatar(ctx, ctx.Doer)
	if err != nil {
		ctx.Error(http.StatusInternalServerError, "DeleteAvatar", err)
	}

	ctx.Status(http.StatusNoContent)
}
