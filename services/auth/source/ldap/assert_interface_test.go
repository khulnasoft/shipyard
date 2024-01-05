// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package ldap_test

import (
	auth_model "github.com/khulnasoft/shipyard/models/auth"
	"github.com/khulnasoft/shipyard/services/auth"
	"github.com/khulnasoft/shipyard/services/auth/source/ldap"
)

// This test file exists to assert that our Source exposes the interfaces that we expect
// It tightly binds the interfaces and implementation without breaking go import cycles

type sourceInterface interface {
	auth.PasswordAuthenticator
	auth.SynchronizableSource
	auth.LocalTwoFASkipper
	auth_model.SSHKeyProvider
	auth_model.Config
	auth_model.SkipVerifiable
	auth_model.HasTLSer
	auth_model.UseTLSer
	auth_model.SourceSettable
}

var _ (sourceInterface) = &ldap.Source{}
