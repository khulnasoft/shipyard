// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package oauth2

import (
	"html/template"

	"github.com/khulnasoft/shipyard/modules/log"
	"github.com/khulnasoft/shipyard/modules/svg"
)

// BaseProvider represents a common base for Provider
type BaseProvider struct {
	name        string
	displayName string
}

// Name provides the technical name for this provider
func (b *BaseProvider) Name() string {
	return b.name
}

// DisplayName returns the friendly name for this provider
func (b *BaseProvider) DisplayName() string {
	return b.displayName
}

// IconHTML returns icon HTML for this provider
func (b *BaseProvider) IconHTML(size int) template.HTML {
	svgName := "shipyard-" + b.name
	switch b.name {
	case "gplus":
		svgName = "shipyard-google"
	case "github":
		svgName = "octicon-mark-github"
	}
	svgHTML := svg.RenderHTML(svgName, size, "gt-mr-3")
	if svgHTML == "" {
		log.Error("No SVG icon for oauth2 provider %q", b.name)
		svgHTML = svg.RenderHTML("shipyard-openid", size, "gt-mr-3")
	}
	return svgHTML
}

// CustomURLSettings returns the custom url settings for this provider
func (b *BaseProvider) CustomURLSettings() *CustomURLSettings {
	return nil
}

var _ Provider = &BaseProvider{}
