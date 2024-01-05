// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

//nolint:forbidigo
package base

import (
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"
	"github.com/khulnasoft/shipyard/modules/base"
	"github.com/khulnasoft/shipyard/modules/git"
	"github.com/khulnasoft/shipyard/modules/log"
	"github.com/khulnasoft/shipyard/modules/setting"
	"github.com/khulnasoft/shipyard/modules/testlogger"

	"github.com/stretchr/testify/assert"
	"xorm.io/xorm"
)

// FIXME: this file shouldn't be in a normal package, it should only be compiled for tests

// PrepareTestEnv prepares the test environment and reset the database. The skip parameter should usually be 0.
// Provide models to be sync'd with the database - in particular any models you expect fixtures to be loaded from.
//
// fixtures in `models/migrations/fixtures/<TestName>` will be loaded automatically
func PrepareTestEnv(t *testing.T, skip int, syncModels ...any) (*xorm.Engine, func()) {
	t.Helper()
	ourSkip := 2
	ourSkip += skip
	deferFn := testlogger.PrintCurrentTest(t, ourSkip)
	assert.NoError(t, os.RemoveAll(setting.RepoRootPath))
	assert.NoError(t, unittest.CopyDir(path.Join(filepath.Dir(setting.AppPath), "tests/shipyard-repositories-meta"), setting.RepoRootPath))
	ownerDirs, err := os.ReadDir(setting.RepoRootPath)
	if err != nil {
		assert.NoError(t, err, "unable to read the new repo root: %v\n", err)
	}
	for _, ownerDir := range ownerDirs {
		if !ownerDir.Type().IsDir() {
			continue
		}
		repoDirs, err := os.ReadDir(filepath.Join(setting.RepoRootPath, ownerDir.Name()))
		if err != nil {
			assert.NoError(t, err, "unable to read the new repo root: %v\n", err)
		}
		for _, repoDir := range repoDirs {
			_ = os.MkdirAll(filepath.Join(setting.RepoRootPath, ownerDir.Name(), repoDir.Name(), "objects", "pack"), 0o755)
			_ = os.MkdirAll(filepath.Join(setting.RepoRootPath, ownerDir.Name(), repoDir.Name(), "objects", "info"), 0o755)
			_ = os.MkdirAll(filepath.Join(setting.RepoRootPath, ownerDir.Name(), repoDir.Name(), "refs", "heads"), 0o755)
			_ = os.MkdirAll(filepath.Join(setting.RepoRootPath, ownerDir.Name(), repoDir.Name(), "refs", "tag"), 0o755)
		}
	}

	if err := deleteDB(); err != nil {
		t.Errorf("unable to reset database: %v", err)
		return nil, deferFn
	}

	x, err := newXORMEngine()
	assert.NoError(t, err)
	if x != nil {
		oldDefer := deferFn
		deferFn = func() {
			oldDefer()
			if err := x.Close(); err != nil {
				t.Errorf("error during close: %v", err)
			}
			if err := deleteDB(); err != nil {
				t.Errorf("unable to reset database: %v", err)
			}
		}
	}
	if err != nil {
		return x, deferFn
	}

	if len(syncModels) > 0 {
		if err := x.Sync(syncModels...); err != nil {
			t.Errorf("error during sync: %v", err)
			return x, deferFn
		}
	}

	fixturesDir := filepath.Join(filepath.Dir(setting.AppPath), "models", "migrations", "fixtures", t.Name())

	if _, err := os.Stat(fixturesDir); err == nil {
		t.Logf("initializing fixtures from: %s", fixturesDir)
		if err := unittest.InitFixtures(
			unittest.FixturesOptions{
				Dir: fixturesDir,
			}, x); err != nil {
			t.Errorf("error whilst initializing fixtures from %s: %v", fixturesDir, err)
			return x, deferFn
		}
		if err := unittest.LoadFixtures(x); err != nil {
			t.Errorf("error whilst loading fixtures from %s: %v", fixturesDir, err)
			return x, deferFn
		}
	} else if !os.IsNotExist(err) {
		t.Errorf("unexpected error whilst checking for existence of fixtures: %v", err)
	} else {
		t.Logf("no fixtures found in: %s", fixturesDir)
	}

	return x, deferFn
}

func MainTest(m *testing.M) {
	log.RegisterEventWriter("test", testlogger.NewTestLoggerWriter)

	shipyardRoot := base.SetupShipyardRoot()
	if shipyardRoot == "" {
		fmt.Println("Environment variable $SHIPYARD_ROOT not set")
		os.Exit(1)
	}
	shipyardBinary := "shipyard"
	if runtime.GOOS == "windows" {
		shipyardBinary += ".exe"
	}
	setting.AppPath = path.Join(shipyardRoot, shipyardBinary)
	if _, err := os.Stat(setting.AppPath); err != nil {
		fmt.Printf("Could not find shipyard binary at %s\n", setting.AppPath)
		os.Exit(1)
	}

	shipyardConf := os.Getenv("SHIPYARD_CONF")
	if shipyardConf == "" {
		shipyardConf = path.Join(filepath.Dir(setting.AppPath), "tests/sqlite.ini")
		fmt.Printf("Environment variable $SHIPYARD_CONF not set - defaulting to %s\n", shipyardConf)
	}

	if !path.IsAbs(shipyardConf) {
		setting.CustomConf = path.Join(shipyardRoot, shipyardConf)
	} else {
		setting.CustomConf = shipyardConf
	}

	tmpDataPath, err := os.MkdirTemp("", "data")
	if err != nil {
		fmt.Printf("Unable to create temporary data path %v\n", err)
		os.Exit(1)
	}

	setting.CustomPath = filepath.Join(setting.AppWorkPath, "custom")
	setting.AppDataPath = tmpDataPath

	unittest.InitSettings()
	if err = git.InitFull(context.Background()); err != nil {
		fmt.Printf("Unable to InitFull: %v\n", err)
		os.Exit(1)
	}
	setting.LoadDBSetting()
	setting.InitLoggersForTest()

	exitStatus := m.Run()

	if err := removeAllWithRetry(setting.RepoRootPath); err != nil {
		fmt.Fprintf(os.Stderr, "os.RemoveAll: %v\n", err)
	}
	if err := removeAllWithRetry(tmpDataPath); err != nil {
		fmt.Fprintf(os.Stderr, "os.RemoveAll: %v\n", err)
	}
	os.Exit(exitStatus)
}
