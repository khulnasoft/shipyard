// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repo_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"

	_ "github.com/khulnasoft/shipyard/models" // register table model
	_ "github.com/khulnasoft/shipyard/models/actions"
	_ "github.com/khulnasoft/shipyard/models/activities"
	_ "github.com/khulnasoft/shipyard/models/perm/access" // register table model
	_ "github.com/khulnasoft/shipyard/models/repo"        // register table model
	_ "github.com/khulnasoft/shipyard/models/user"        // register table model
)

func TestMain(m *testing.M) {
	unittest.MainTest(m)
}
