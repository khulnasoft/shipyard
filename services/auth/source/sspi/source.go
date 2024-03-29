// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package sspi

import (
	"github.com/khulnasoft/shipyard/models/auth"
	"github.com/khulnasoft/shipyard/modules/json"
)

//   _________ ___________________.___
//  /   _____//   _____/\______   \   |
//  \_____  \ \_____  \  |     ___/   |
//  /        \/        \ |    |   |   |
// /_______  /_______  / |____|   |___|
//         \/        \/

// Source holds configuration for SSPI single sign-on.
type Source struct {
	AutoCreateUsers      bool
	AutoActivateUsers    bool
	StripDomainNames     bool
	SeparatorReplacement string
	DefaultLanguage      string
}

// FromDB fills up an SSPIConfig from serialized format.
func (cfg *Source) FromDB(bs []byte) error {
	return json.UnmarshalHandleDoubleEncode(bs, &cfg)
}

// ToDB exports an SSPIConfig to a serialized format.
func (cfg *Source) ToDB() ([]byte, error) {
	return json.Marshal(cfg)
}

func init() {
	auth.RegisterTypeConfig(auth.SSPI, &Source{})
}
