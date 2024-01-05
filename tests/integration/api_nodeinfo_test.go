// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package integration

import (
	"net/http"
	"net/url"
	"testing"

	"github.com/khulnasoft/shipyard/modules/setting"
	api "github.com/khulnasoft/shipyard/modules/structs"
	"github.com/khulnasoft/shipyard/routers"

	"github.com/stretchr/testify/assert"
)

func TestNodeinfo(t *testing.T) {
	setting.Federation.Enabled = true
	testWebRoutes = routers.NormalRoutes()
	defer func() {
		setting.Federation.Enabled = false
		testWebRoutes = routers.NormalRoutes()
	}()

	onShipyardRun(t, func(*testing.T, *url.URL) {
		req := NewRequest(t, "GET", "/api/v1/nodeinfo")
		resp := MakeRequest(t, req, http.StatusOK)
		VerifyJSONSchema(t, resp, "nodeinfo_2.1.json")

		var nodeinfo api.NodeInfo
		DecodeJSON(t, resp, &nodeinfo)
		assert.True(t, nodeinfo.OpenRegistrations)
		assert.Equal(t, "shipyard", nodeinfo.Software.Name)
		assert.Equal(t, 25, nodeinfo.Usage.Users.Total)
		assert.Equal(t, 20, nodeinfo.Usage.LocalPosts)
		assert.Equal(t, 3, nodeinfo.Usage.LocalComments)
	})
}
