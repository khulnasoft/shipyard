// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repo

import "github.com/khulnasoft/shipyard/models/db"

// SearchOrderByMap represents all possible search order
var SearchOrderByMap = map[string]map[string]db.SearchOrderBy{
	"asc": {
		"alpha":   db.SearchOrderByAlphabetically,
		"created": db.SearchOrderByOldest,
		"updated": db.SearchOrderByLeastUpdated,
		"size":    db.SearchOrderBySize,
		"id":      db.SearchOrderByID,
	},
	"desc": {
		"alpha":   db.SearchOrderByAlphabeticallyReverse,
		"created": db.SearchOrderByNewest,
		"updated": db.SearchOrderByRecentUpdated,
		"size":    db.SearchOrderBySizeReverse,
		"id":      db.SearchOrderByIDReverse,
	},
}
