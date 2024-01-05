// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package fuzz

import (
	"bytes"
	"context"
	"io"
	"testing"

	"github.com/khulnasoft/shipyard/modules/markup"
	"github.com/khulnasoft/shipyard/modules/markup/markdown"
	"github.com/khulnasoft/shipyard/modules/setting"
)

var renderContext = markup.RenderContext{
	Ctx:       context.Background(),
	URLPrefix: "https://example.com/go-shipyard/shipyard",
	Metas: map[string]string{
		"user": "go-shipyard",
		"repo": "shipyard",
	},
}

func FuzzMarkdownRenderRaw(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		setting.AppURL = "http://localhost:3000/"
		markdown.RenderRaw(&renderContext, bytes.NewReader(data), io.Discard)
	})
}

func FuzzMarkupPostProcess(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		setting.AppURL = "http://localhost:3000/"
		markup.PostProcess(&renderContext, bytes.NewReader(data), io.Discard)
	})
}
