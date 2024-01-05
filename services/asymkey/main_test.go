// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package asymkey

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"

	_ "github.com/khulnasoft/shipyard/models/actions"
	_ "github.com/khulnasoft/shipyard/models/activities"
)

func TestMain(m *testing.M) {
	unittest.MainTest(m)
}
