// Copyright 2017 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package integration

import (
	"net/http"
	"testing"

	auth_model "github.com/khulnasoft/shipyard/models/auth"
	"github.com/khulnasoft/shipyard/models/unittest"
	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/tests"

	"github.com/stretchr/testify/assert"
)

func TestAPIReposRaw(t *testing.T) {
	defer tests.PrepareTestEnv(t)()
	user := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: 2})
	// Login as User2.
	session := loginUser(t, user.Name)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeReadRepository)

	for _, ref := range [...]string{
		"master", // Branch
		"v1.1",   // Tag
		"65f1bf27bc3bf70f64657658635e66094edbcb4d", // Commit
	} {
		req := NewRequestf(t, "GET", "/api/v1/repos/%s/repo1/raw/%s/README.md", user.Name, ref).
			AddTokenAuth(token)
		resp := MakeRequest(t, req, http.StatusOK)
		assert.EqualValues(t, "file", resp.Header().Get("x-shipyard-object-type"))
	}
	// Test default branch
	req := NewRequestf(t, "GET", "/api/v1/repos/%s/repo1/raw/README.md", user.Name).
		AddTokenAuth(token)
	resp := MakeRequest(t, req, http.StatusOK)
	assert.EqualValues(t, "file", resp.Header().Get("x-shipyard-object-type"))
}
