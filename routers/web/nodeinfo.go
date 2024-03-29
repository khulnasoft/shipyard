// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package web

import (
	"fmt"
	"net/http"

	"github.com/khulnasoft/shipyard/modules/context"
	"github.com/khulnasoft/shipyard/modules/setting"
)

type nodeInfoLinks struct {
	Links []nodeInfoLink `json:"links"`
}

type nodeInfoLink struct {
	Href string `json:"href"`
	Rel  string `json:"rel"`
}

// NodeInfoLinks returns links to the node info endpoint
func NodeInfoLinks(ctx *context.Context) {
	nodeinfolinks := &nodeInfoLinks{
		Links: []nodeInfoLink{{
			fmt.Sprintf("%sapi/v1/nodeinfo", setting.AppURL),
			"http://nodeinfo.diaspora.software/ns/schema/2.1",
		}},
	}
	ctx.JSON(http.StatusOK, nodeinfolinks)
}
