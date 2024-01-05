// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package organization_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"

	_ "github.com/khulnasoft/shipyard/models"
	_ "github.com/khulnasoft/shipyard/models/actions"
	_ "github.com/khulnasoft/shipyard/models/activities"
	_ "github.com/khulnasoft/shipyard/models/organization"
	_ "github.com/khulnasoft/shipyard/models/repo"
	_ "github.com/khulnasoft/shipyard/models/user"
)

func TestMain(m *testing.M) {
	unittest.MainTest(m)
}
