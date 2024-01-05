// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package db_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"

	_ "github.com/khulnasoft/shipyard/models"
	_ "github.com/khulnasoft/shipyard/models/repo"
)

func TestMain(m *testing.M) {
	unittest.MainTest(m)
}
