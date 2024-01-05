// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package markup

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	"github.com/khulnasoft/shipyard/models/unittest"
	"github.com/khulnasoft/shipyard/models/user"
	shipyard_context "github.com/khulnasoft/shipyard/modules/context"
	"github.com/khulnasoft/shipyard/modules/contexttest"

	"github.com/stretchr/testify/assert"
)

func TestProcessorHelper(t *testing.T) {
	assert.NoError(t, unittest.PrepareTestDatabase())

	userPublic := "user1"
	userPrivate := "user31"
	userLimited := "user33"
	userNoSuch := "no-such-user"

	unittest.AssertCount(t, &user.User{Name: userPublic}, 1)
	unittest.AssertCount(t, &user.User{Name: userPrivate}, 1)
	unittest.AssertCount(t, &user.User{Name: userLimited}, 1)
	unittest.AssertCount(t, &user.User{Name: userNoSuch}, 0)

	// when using general context, use user's visibility to check
	assert.True(t, ProcessorHelper().IsUsernameMentionable(context.Background(), userPublic))
	assert.False(t, ProcessorHelper().IsUsernameMentionable(context.Background(), userLimited))
	assert.False(t, ProcessorHelper().IsUsernameMentionable(context.Background(), userPrivate))
	assert.False(t, ProcessorHelper().IsUsernameMentionable(context.Background(), userNoSuch))

	// when using web context, use user.IsUserVisibleToViewer to check
	req, err := http.NewRequest("GET", "/", nil)
	assert.NoError(t, err)
	base, baseCleanUp := shipyard_context.NewBaseContext(httptest.NewRecorder(), req)
	defer baseCleanUp()
	shipyardCtx := shipyard_context.NewWebContext(base, &contexttest.MockRender{}, nil)

	assert.True(t, ProcessorHelper().IsUsernameMentionable(shipyardCtx, userPublic))
	assert.False(t, ProcessorHelper().IsUsernameMentionable(shipyardCtx, userPrivate))

	shipyardCtx.Doer, err = user.GetUserByName(db.DefaultContext, userPrivate)
	assert.NoError(t, err)
	assert.True(t, ProcessorHelper().IsUsernameMentionable(shipyardCtx, userPublic))
	assert.True(t, ProcessorHelper().IsUsernameMentionable(shipyardCtx, userPrivate))
}
