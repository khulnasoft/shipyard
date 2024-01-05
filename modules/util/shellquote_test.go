// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package util

import "testing"

func TestShellEscape(t *testing.T) {
	tests := []struct {
		name     string
		toEscape string
		want     string
	}{
		{
			"Simplest case - nothing to escape",
			"a/b/c/d",
			"a/b/c/d",
		}, {
			"Prefixed tilde - with normal stuff - should not escape",
			"~/src/go/shipyard/shipyard",
			"~/src/go/shipyard/shipyard",
		}, {
			"Typical windows path with spaces - should get doublequote escaped",
			`C:\Program Files\Shipyard v1.13 - I like lots of spaces\shipyard`,
			`"C:\\Program Files\\Shipyard v1.13 - I like lots of spaces\\shipyard"`,
		}, {
			"Forward-slashed windows path with spaces - should get doublequote escaped",
			"C:/Program Files/Shipyard v1.13 - I like lots of spaces/shipyard",
			`"C:/Program Files/Shipyard v1.13 - I like lots of spaces/shipyard"`,
		}, {
			"Prefixed tilde - but then a space filled path",
			"~git/Shipyard v1.13/shipyard",
			`~git/"Shipyard v1.13/shipyard"`,
		}, {
			"Bangs are unfortunately not predictable so need to be singlequoted",
			"C:/Program Files/Shipyard!/shipyard",
			`'C:/Program Files/Shipyard!/shipyard'`,
		}, {
			"Newlines are just irritating",
			"/home/git/Shipyard\n\nWHY-WOULD-YOU-DO-THIS\n\nShipyard/shipyard",
			"'/home/git/Shipyard\n\nWHY-WOULD-YOU-DO-THIS\n\nShipyard/shipyard'",
		}, {
			"Similarly we should nicely handle multiple single quotes if we have to single-quote",
			"'!''!'''!''!'!'",
			`\''!'\'\''!'\'\'\''!'\'\''!'\''!'\'`,
		}, {
			"Double quote < ...",
			"~/<shipyard",
			"~/\"<shipyard\"",
		}, {
			"Double quote > ...",
			"~/shipyard>",
			"~/\"shipyard>\"",
		}, {
			"Double quote and escape $ ...",
			"~/$shipyard",
			"~/\"\\$shipyard\"",
		}, {
			"Double quote {...",
			"~/{shipyard",
			"~/\"{shipyard\"",
		}, {
			"Double quote }...",
			"~/shipyard}",
			"~/\"shipyard}\"",
		}, {
			"Double quote ()...",
			"~/(shipyard)",
			"~/\"(shipyard)\"",
		}, {
			"Double quote and escape `...",
			"~/shipyard`",
			"~/\"shipyard\\`\"",
		}, {
			"Double quotes can handle a number of things without having to escape them but not everything ...",
			"~/<shipyard> ${shipyard} `shipyard` [shipyard] (shipyard) \"shipyard\" \\shipyard\\ 'shipyard'",
			"~/\"<shipyard> \\${shipyard} \\`shipyard\\` [shipyard] (shipyard) \\\"shipyard\\\" \\\\shipyard\\\\ 'shipyard'\"",
		}, {
			"Single quotes don't need to escape except for '...",
			"~/<shipyard> ${shipyard} `shipyard` (shipyard) !shipyard! \"shipyard\" \\shipyard\\ 'shipyard'",
			"~/'<shipyard> ${shipyard} `shipyard` (shipyard) !shipyard! \"shipyard\" \\shipyard\\ '\\''shipyard'\\'",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ShellEscape(tt.toEscape); got != tt.want {
				t.Errorf("ShellEscape(%q):\nGot:    %s\nWanted: %s", tt.toEscape, got, tt.want)
			}
		})
	}
}
