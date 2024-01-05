// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package integration

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"testing"

	"github.com/khulnasoft/shipyard/modules/git"
	"github.com/khulnasoft/shipyard/modules/util"
	"github.com/khulnasoft/shipyard/tests"

	"github.com/stretchr/testify/assert"
)

func assertFileExist(t *testing.T, p string) {
	exist, err := util.IsExist(p)
	assert.NoError(t, err)
	assert.True(t, exist)
}

func assertFileEqual(t *testing.T, p string, content []byte) {
	bs, err := os.ReadFile(p)
	assert.NoError(t, err)
	assert.EqualValues(t, content, bs)
}

func TestRepoCloneWiki(t *testing.T) {
	onShipyardRun(t, func(t *testing.T, u *url.URL) {
		defer tests.PrepareTestEnv(t)()

		dstPath := t.TempDir()

		r := fmt.Sprintf("%suser2/repo1.wiki.git", u.String())
		u, _ = url.Parse(r)
		u.User = url.UserPassword("user2", userPassword)
		t.Run("Clone", func(t *testing.T) {
			assert.NoError(t, git.CloneWithArgs(context.Background(), git.AllowLFSFiltersArgs(), u.String(), dstPath, git.CloneRepoOptions{}))
			assertFileEqual(t, filepath.Join(dstPath, "Home.md"), []byte("# Home page\n\nThis is the home page!\n"))
			assertFileExist(t, filepath.Join(dstPath, "Page-With-Image.md"))
			assertFileExist(t, filepath.Join(dstPath, "Page-With-Spaced-Name.md"))
			assertFileExist(t, filepath.Join(dstPath, "images"))
			assertFileExist(t, filepath.Join(dstPath, "jpeg.jpg"))
		})
	})
}
