// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package setting

import "github.com/khulnasoft/shipyard/modules/log"

type OtherConfig struct {
	ShowFooterVersion          bool
	ShowFooterTemplateLoadTime bool
	EnableFeed                 bool
	EnableSitemap              bool
}

var Other = OtherConfig{
	ShowFooterVersion:          true,
	ShowFooterTemplateLoadTime: true,
	EnableSitemap:              true,
	EnableFeed:                 true,
}

func loadOtherFrom(rootCfg ConfigProvider) {
	sec := rootCfg.Section("other")
	if err := sec.MapTo(&Other); err != nil {
		log.Fatal("Failed to map [other] settings: %v", err)
	}
}
