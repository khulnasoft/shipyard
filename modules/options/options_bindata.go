// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

//go:build bindata

package options

//go:generate go run ../../build/generate-bindata.go ../../options options bindata.go
