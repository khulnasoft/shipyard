// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package auth

import (
	"github.com/khulnasoft/shipyard/modules/json"
	"github.com/khulnasoft/shipyard/modules/log"
)

func UnmarshalGroupTeamMapping(raw string) (map[string]map[string][]string, error) {
	groupTeamMapping := make(map[string]map[string][]string)
	if raw == "" {
		return groupTeamMapping, nil
	}
	err := json.Unmarshal([]byte(raw), &groupTeamMapping)
	if err != nil {
		log.Error("Failed to unmarshal group team mapping: %v", err)
		return nil, err
	}
	return groupTeamMapping, nil
}
