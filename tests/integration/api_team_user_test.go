// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package integration

import (
	"net/http"
	"testing"
	"time"

	auth_model "github.com/khulnasoft/shipyard/models/auth"
	"github.com/khulnasoft/shipyard/models/db"
	"github.com/khulnasoft/shipyard/models/unittest"
	user_model "github.com/khulnasoft/shipyard/models/user"
	api "github.com/khulnasoft/shipyard/modules/structs"
	"github.com/khulnasoft/shipyard/services/convert"
	"github.com/khulnasoft/shipyard/tests"

	"github.com/stretchr/testify/assert"
)

func TestAPITeamUser(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	normalUsername := "user2"
	session := loginUser(t, normalUsername)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeReadOrganization)
	req := NewRequest(t, "GET", "/api/v1/teams/1/members/user1").
		AddTokenAuth(token)
	MakeRequest(t, req, http.StatusNotFound)

	req = NewRequest(t, "GET", "/api/v1/teams/1/members/user2").
		AddTokenAuth(token)
	resp := MakeRequest(t, req, http.StatusOK)
	var user2 *api.User
	DecodeJSON(t, resp, &user2)
	user2.Created = user2.Created.In(time.Local)
	user := unittest.AssertExistsAndLoadBean(t, &user_model.User{Name: "user2"})

	expectedUser := convert.ToUser(db.DefaultContext, user, user)

	// test time via unix timestamp
	assert.EqualValues(t, expectedUser.LastLogin.Unix(), user2.LastLogin.Unix())
	assert.EqualValues(t, expectedUser.Created.Unix(), user2.Created.Unix())
	expectedUser.LastLogin = user2.LastLogin
	expectedUser.Created = user2.Created

	assert.Equal(t, expectedUser, user2)
}
