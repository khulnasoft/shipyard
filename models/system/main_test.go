// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package system_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"

	_ "github.com/khulnasoft/shipyard/models" // register models
	_ "github.com/khulnasoft/shipyard/models/actions"
	_ "github.com/khulnasoft/shipyard/models/activities"
	_ "github.com/khulnasoft/shipyard/models/system" // register models of system
)

func TestMain(m *testing.M) {
	unittest.MainTest(m)
}
