// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package cmd

import (
	"context"
	"testing"

	"github.com/khulnasoft/shipyard/modules/doctor"
	"github.com/khulnasoft/shipyard/modules/log"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v2"
)

func TestDoctorRun(t *testing.T) {
	doctor.Register(&doctor.Check{
		Title: "Test Check",
		Name:  "test-check",
		Run:   func(ctx context.Context, logger log.Logger, autofix bool) error { return nil },

		SkipDatabaseInitialization: true,
	})
	app := cli.NewApp()
	app.Commands = []*cli.Command{cmdDoctorCheck}
	err := app.Run([]string{"./shipyard", "check", "--run", "test-check"})
	assert.NoError(t, err)
	err = app.Run([]string{"./shipyard", "check", "--run", "no-such"})
	assert.ErrorContains(t, err, `unknown checks: "no-such"`)
	err = app.Run([]string{"./shipyard", "check", "--run", "test-check,no-such"})
	assert.ErrorContains(t, err, `unknown checks: "no-such"`)
}
