// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package user_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	"github.com/khulnasoft/shipyard/models/unittest"
	user_model "github.com/khulnasoft/shipyard/models/user"

	"github.com/stretchr/testify/assert"
)

func TestLookupUserRedirect(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())

	userID, err := user_model.LookupUserRedirect(db.DefaultContext, "olduser1")
	assert.NoError(t, err)
	assert.EqualValues(t, 1, userID)

	_, err = user_model.LookupUserRedirect(db.DefaultContext, "doesnotexist")
	assert.True(t, user_model.IsErrUserRedirectNotExist(err))
}
