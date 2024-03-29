// Copyright 2021 The Shipyard Authors.
// SPDX-License-Identifier: MIT

package user

import (
	"net/http"

	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/modules/context"
)

// GetUserByParamsName get user by name
func GetUserByParamsName(ctx *context.APIContext, name string) *user_model.User {
	username := ctx.Params(name)
	user, err := user_model.GetUserByName(ctx, username)
	if err != nil {
		if user_model.IsErrUserNotExist(err) {
			if redirectUserID, err2 := user_model.LookupUserRedirect(ctx, username); err2 == nil {
				context.RedirectToUser(ctx.Base, username, redirectUserID)
			} else {
				ctx.NotFound("GetUserByName", err)
			}
		} else {
			ctx.Error(http.StatusInternalServerError, "GetUserByName", err)
		}
		return nil
	}
	return user
}

// GetUserByParams returns user whose name is presented in URL (":username").
func GetUserByParams(ctx *context.APIContext) *user_model.User {
	return GetUserByParamsName(ctx, ":username")
}
