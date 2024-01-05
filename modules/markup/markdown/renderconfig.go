// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package markdown

import (
	"fmt"
	"strings"

	"github.com/khulnasoft/shipyard/modules/markup"

	"github.com/yuin/goldmark/ast"
	"gopkg.in/yaml.v3"
)

// RenderConfig represents rendering configuration for this file
type RenderConfig struct {
	Meta     markup.RenderMetaMode
	Icon     string
	TOC      string // "false": hide,  "side"/empty: in sidebar,  "main"/"true": in main view
	Lang     string
	yamlNode *yaml.Node

	// Used internally.  Cannot be controlled by frontmatter.
	metaLength int
}

func renderMetaModeFromString(s string) markup.RenderMetaMode {
	switch strings.TrimSpace(strings.ToLower(s)) {
	case "none":
		return markup.RenderMetaAsNone
	case "table":
		return markup.RenderMetaAsTable
	default: // "details"
		return markup.RenderMetaAsDetails
	}
}

// UnmarshalYAML implement yaml.v3 UnmarshalYAML
func (rc *RenderConfig) UnmarshalYAML(value *yaml.Node) error {
	if rc == nil {
		return nil
	}

	rc.yamlNode = value

	type commonRenderConfig struct {
		TOC  string `yaml:"include_toc"`
		Lang string `yaml:"lang"`
	}
	var basic commonRenderConfig
	if err := value.Decode(&basic); err != nil {
		return fmt.Errorf("unable to decode into commonRenderConfig %w", err)
	}

	if basic.Lang != "" {
		rc.Lang = basic.Lang
	}

	rc.TOC = basic.TOC

	type controlStringRenderConfig struct {
		Shipyard string `yaml:"shipyard"`
	}

	var stringBasic controlStringRenderConfig

	if err := value.Decode(&stringBasic); err == nil {
		if stringBasic.Shipyard != "" {
			rc.Meta = renderMetaModeFromString(stringBasic.Shipyard)
		}
		return nil
	}

	type yamlRenderConfig struct {
		Meta *string `yaml:"meta"`
		Icon *string `yaml:"details_icon"`
		TOC  *string `yaml:"include_toc"`
		Lang *string `yaml:"lang"`
	}

	type yamlRenderConfigWrapper struct {
		Shipyard *yamlRenderConfig `yaml:"shipyard"`
	}

	var cfg yamlRenderConfigWrapper
	if err := value.Decode(&cfg); err != nil {
		return fmt.Errorf("unable to decode into yamlRenderConfigWrapper %w", err)
	}

	if cfg.Shipyard == nil {
		return nil
	}

	if cfg.Shipyard.Meta != nil {
		rc.Meta = renderMetaModeFromString(*cfg.Shipyard.Meta)
	}

	if cfg.Shipyard.Icon != nil {
		rc.Icon = strings.TrimSpace(strings.ToLower(*cfg.Shipyard.Icon))
	}

	if cfg.Shipyard.Lang != nil && *cfg.Shipyard.Lang != "" {
		rc.Lang = *cfg.Shipyard.Lang
	}

	if cfg.Shipyard.TOC != nil {
		rc.TOC = *cfg.Shipyard.TOC
	}

	return nil
}

func (rc *RenderConfig) toMetaNode() ast.Node {
	if rc.yamlNode == nil {
		return nil
	}
	switch rc.Meta {
	case markup.RenderMetaAsTable:
		return nodeToTable(rc.yamlNode)
	case markup.RenderMetaAsDetails:
		return nodeToDetails(rc.yamlNode, rc.Icon)
	default:
		return nil
	}
}
