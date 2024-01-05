// Copyright 2023 The Shipyard Authors. All rights reserved.
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
	"github.com/khulnasoft/shipyard/tests"

	"github.com/pquerna/otp/totp"
	"github.com/stretchr/testify/assert"
)

func TestAPITwoFactor(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	user := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: 16})

	req := NewRequest(t, "GET", "/api/v1/user").
		AddBasicAuth(user.Name)
	MakeRequest(t, req, http.StatusOK)

	otpKey, err := totp.Generate(totp.GenerateOpts{
		SecretSize:  40,
		Issuer:      "shipyard-test",
		AccountName: user.Name,
	})
	assert.NoError(t, err)

	tfa := &auth_model.TwoFactor{
		UID: user.ID,
	}
	assert.NoError(t, tfa.SetSecret(otpKey.Secret()))

	assert.NoError(t, auth_model.NewTwoFactor(db.DefaultContext, tfa))

	req = NewRequest(t, "GET", "/api/v1/user").
		AddBasicAuth(user.Name)
	MakeRequest(t, req, http.StatusUnauthorized)

	passcode, err := totp.GenerateCode(otpKey.Secret(), time.Now())
	assert.NoError(t, err)

	req = NewRequest(t, "GET", "/api/v1/user").
		AddBasicAuth(user.Name)
	req.Header.Set("X-Shipyard-OTP", passcode)
	MakeRequest(t, req, http.StatusOK)
}
