// Copyright 2017 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package integration

import (
	"net/http"
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"
	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/tests"

	"github.com/stretchr/testify/assert"
)

func TestXSSUserFullName(t *testing.T) {
	defer tests.PrepareTestEnv(t)()
	user := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: 2})
	const fullName = `name & <script class="evil">alert('Oh no!');</script>`

	session := loginUser(t, user.Name)
	req := NewRequestWithValues(t, "POST", "/user/settings", map[string]string{
		"_csrf":     GetCSRF(t, session, "/user/settings"),
		"name":      user.Name,
		"full_name": fullName,
		"email":     user.Email,
		"language":  "en-US",
	})
	session.MakeRequest(t, req, http.StatusSeeOther)

	req = NewRequestf(t, "GET", "/%s", user.Name)
	resp := session.MakeRequest(t, req, http.StatusOK)
	htmlDoc := NewHTMLParser(t, resp.Body)
	assert.EqualValues(t, 0, htmlDoc.doc.Find("script.evil").Length())
	assert.EqualValues(t, fullName,
		htmlDoc.doc.Find("div.content").Find(".header.text.center").Text(),
	)
}
