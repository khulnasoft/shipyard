// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package i18n

import (
	"github.com/khulnasoft/shipyard/modules/util"
)

var (
	ErrLocaleAlreadyExist = util.SilentWrap{Message: "lang already exists", Err: util.ErrAlreadyExist}
	ErrUncertainArguments = util.SilentWrap{Message: "arguments to i18n should not contain uncertain slices", Err: util.ErrInvalidArgument}
)
