// Copyright 2018 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package git

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetRefURL(t *testing.T) {
	kases := []struct {
		refURL     string
		prefixURL  string
		parentPath string
		SSHDomain  string
		expect     string
	}{
		{"git://github.com/user1/repo1", "/", "user1/repo2", "", "http://github.com/user1/repo1"},
		{"https://localhost/user1/repo1.git", "/", "user1/repo2", "", "https://localhost/user1/repo1"},
		{"http://localhost/user1/repo1.git", "/", "owner/reponame", "", "http://localhost/user1/repo1"},
		{"git@github.com:user1/repo1.git", "/", "owner/reponame", "", "http://github.com/user1/repo1"},
		{"ssh://git@git.zefie.net:2222/zefie/lge_g6_kernel_scripts.git", "/", "zefie/lge_g6_kernel", "", "http://git.zefie.net/zefie/lge_g6_kernel_scripts"},
		{"git@git.zefie.net:2222/zefie/lge_g6_kernel_scripts.git", "/", "zefie/lge_g6_kernel", "", "http://git.zefie.net/2222/zefie/lge_g6_kernel_scripts"},
		{"git@try.shipyard.io:go-shipyard/shipyard", "https://try.shipyard.io/", "go-shipyard/sdk", "", "https://try.shipyard.io/go-shipyard/shipyard"},
		{"ssh://git@try.shipyard.io:9999/go-shipyard/shipyard", "https://try.shipyard.io/", "go-shipyard/sdk", "", "https://try.shipyard.io/go-shipyard/shipyard"},
		{"git://git@try.shipyard.io:9999/go-shipyard/shipyard", "https://try.shipyard.io/", "go-shipyard/sdk", "", "https://try.shipyard.io/go-shipyard/shipyard"},
		{"ssh://git@127.0.0.1:9999/go-shipyard/shipyard", "https://127.0.0.1:3000/", "go-shipyard/sdk", "", "https://127.0.0.1:3000/go-shipyard/shipyard"},
		{"https://shipyard.khulnasoft.com:3000/user1/repo1.git", "https://127.0.0.1:3000/", "user/repo2", "", "https://shipyard.khulnasoft.com:3000/user1/repo1"},
		{"https://example.shipyard.khulnasoft.com/shipyard/user1/repo1.git", "https://example.shipyard.khulnasoft.com/shipyard/", "", "user/repo2", "https://example.shipyard.khulnasoft.com/shipyard/user1/repo1"},
		{"https://username:password@github.com/username/repository.git", "/", "username/repository2", "", "https://username:password@github.com/username/repository"},
		{"somethingbad", "https://127.0.0.1:3000/go-shipyard/shipyard", "/", "", ""},
		{"git@localhost:user/repo", "https://localhost/", "user2/repo1", "", "https://localhost/user/repo"},
		{"../path/to/repo.git/", "https://localhost/", "user/repo2", "", "https://localhost/user/path/to/repo.git"},
		{"ssh://git@ssh.shipyard.io:2222/go-shipyard/shipyard", "https://try.shipyard.io/", "go-shipyard/sdk", "ssh.shipyard.io", "https://try.shipyard.io/go-shipyard/shipyard"},
	}

	for _, kase := range kases {
		assert.EqualValues(t, kase.expect, getRefURL(kase.refURL, kase.prefixURL, kase.parentPath, kase.SSHDomain))
	}
}
