// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package setting

// Metrics settings
var Metrics = struct {
	Enabled                  bool
	Token                    string
	EnabledIssueByLabel      bool
	EnabledIssueByRepository bool
}{
	Enabled:                  false,
	Token:                    "",
	EnabledIssueByLabel:      false,
	EnabledIssueByRepository: false,
}

func loadMetricsFrom(rootCfg ConfigProvider) {
	mustMapSetting(rootCfg, "metrics", &Metrics)
}
