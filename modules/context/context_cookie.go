// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package context

import (
	"net/http"
	"strings"

	"github.com/khulnasoft/shipyard/modules/setting"
	"github.com/khulnasoft/shipyard/modules/web/middleware"
)

const CookieNameFlash = "shipyard_flash"

func removeSessionCookieHeader(w http.ResponseWriter) {
	cookies := w.Header()["Set-Cookie"]
	w.Header().Del("Set-Cookie")
	for _, cookie := range cookies {
		if strings.HasPrefix(cookie, setting.SessionConfig.CookieName+"=") {
			continue
		}
		w.Header().Add("Set-Cookie", cookie)
	}
}

// SetSiteCookie convenience function to set most cookies consistently
// CSRF and a few others are the exception here
func (ctx *Context) SetSiteCookie(name, value string, maxAge int) {
	middleware.SetSiteCookie(ctx.Resp, name, value, maxAge)
}

// DeleteSiteCookie convenience function to delete most cookies consistently
// CSRF and a few others are the exception here
func (ctx *Context) DeleteSiteCookie(name string) {
	middleware.SetSiteCookie(ctx.Resp, name, "", -1)
}

// GetSiteCookie returns given cookie value from request header.
func (ctx *Context) GetSiteCookie(name string) string {
	return middleware.GetSiteCookie(ctx.Req, name)
}
