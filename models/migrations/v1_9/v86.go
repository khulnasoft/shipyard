// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package v1_9 //nolint

import (
	"xorm.io/xorm"
)

func AddHTTPMethodToWebhook(x *xorm.Engine) error {
	type Webhook struct {
		HTTPMethod string `xorm:"http_method DEFAULT 'POST'"`
	}

	return x.Sync(new(Webhook))
}
