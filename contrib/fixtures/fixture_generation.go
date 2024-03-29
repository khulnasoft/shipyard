// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

//nolint:forbidigo
package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/khulnasoft/shipyard/models"
	"github.com/khulnasoft/shipyard/models/unittest"
)

// To generate derivative fixtures, execute the following from Shipyard's repository base dir:
// go run -tags 'sqlite sqlite_unlock_notify' contrib/fixtures/fixture_generation.go [fixture...]

var (
	generators = []struct {
		gen  func(ctx context.Context) (string, error)
		name string
	}{
		{
			models.GetYamlFixturesAccess, "access",
		},
	}
	fixturesDir string
)

func main() {
	pathToShipyardRoot := "."
	fixturesDir = filepath.Join(pathToShipyardRoot, "models", "fixtures")
	if err := unittest.CreateTestEngine(unittest.FixturesOptions{
		Dir: fixturesDir,
	}); err != nil {
		fmt.Printf("CreateTestEngine: %+v", err)
		os.Exit(1)
	}
	if err := unittest.PrepareTestDatabase(); err != nil {
		fmt.Printf("PrepareTestDatabase: %+v\n", err)
		os.Exit(1)
	}
	ctx := context.Background()
	if len(os.Args) == 0 {
		for _, r := range os.Args {
			if err := generate(ctx, r); err != nil {
				fmt.Printf("generate '%s': %+v\n", r, err)
				os.Exit(1)
			}
		}
	} else {
		for _, g := range generators {
			if err := generate(ctx, g.name); err != nil {
				fmt.Printf("generate '%s': %+v\n", g.name, err)
				os.Exit(1)
			}
		}
	}
}

func generate(ctx context.Context, name string) error {
	for _, g := range generators {
		if g.name == name {
			data, err := g.gen(ctx)
			if err != nil {
				return err
			}
			path := filepath.Join(fixturesDir, name+".yml")
			if err := os.WriteFile(path, []byte(data), 0o644); err != nil {
				return fmt.Errorf("%s: %+v", path, err)
			}
			fmt.Printf("%s created.\n", path)
			return nil
		}
	}

	return fmt.Errorf("generator not found")
}
