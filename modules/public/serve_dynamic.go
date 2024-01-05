// Copyright 2016 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

//go:build !bindata

package public

import (
	"github.com/khulnasoft/shipyard/modules/assetfs"
	"github.com/khulnasoft/shipyard/modules/setting"
)

func BuiltinAssets() *assetfs.Layer {
	return assetfs.Local("builtin(static)", setting.StaticRootPath, "public")
}
