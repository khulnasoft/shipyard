// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package markup

import (
	"testing"

	"github.com/khulnasoft/shipyard/modules/setting"

	"github.com/stretchr/testify/assert"
)

func TestCamoHandleLink(t *testing.T) {
	setting.AppURL = "https://shipyard.khulnasoft.com"
	// Test media proxy
	setting.Camo.Enabled = true
	setting.Camo.ServerURL = "https://image.proxy"
	setting.Camo.HMACKey = "geheim"

	assert.Equal(t,
		"https://shipyard.khulnasoft.com/img.jpg",
		camoHandleLink("https://shipyard.khulnasoft.com/img.jpg"))
	assert.Equal(t,
		"https://testimages.org/img.jpg",
		camoHandleLink("https://testimages.org/img.jpg"))
	assert.Equal(t,
		"https://image.proxy/eivin43gJwGVIjR9MiYYtFIk0mw/aHR0cDovL3Rlc3RpbWFnZXMub3JnL2ltZy5qcGc",
		camoHandleLink("http://testimages.org/img.jpg"))

	setting.Camo.Allways = true
	assert.Equal(t,
		"https://shipyard.khulnasoft.com/img.jpg",
		camoHandleLink("https://shipyard.khulnasoft.com/img.jpg"))
	assert.Equal(t,
		"https://image.proxy/tkdlvmqpbIr7SjONfHNgEU622y0/aHR0cHM6Ly90ZXN0aW1hZ2VzLm9yZy9pbWcuanBn",
		camoHandleLink("https://testimages.org/img.jpg"))
	assert.Equal(t,
		"https://image.proxy/eivin43gJwGVIjR9MiYYtFIk0mw/aHR0cDovL3Rlc3RpbWFnZXMub3JnL2ltZy5qcGc",
		camoHandleLink("http://testimages.org/img.jpg"))

	// Restore previous settings
	setting.Camo.Enabled = false
}
