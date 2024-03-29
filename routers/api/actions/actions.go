// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package actions

import (
	"net/http"

	"github.com/khulnasoft/shipyard/modules/web"
	"github.com/khulnasoft/shipyard/routers/api/actions/ping"
	"github.com/khulnasoft/shipyard/routers/api/actions/runner"
)

func Routes(prefix string) *web.Route {
	m := web.NewRoute()

	path, handler := ping.NewPingServiceHandler()
	m.Post(path+"*", http.StripPrefix(prefix, handler).ServeHTTP)

	path, handler = runner.NewRunnerServiceHandler()
	m.Post(path+"*", http.StripPrefix(prefix, handler).ServeHTTP)

	return m
}
