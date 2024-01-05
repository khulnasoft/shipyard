// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package url

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseGitURLs(t *testing.T) {
	kases := []struct {
		kase     string
		expected *GitURL
	}{
		{
			kase: "git@127.0.0.1:go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "ssh",
					User:   url.User("git"),
					Host:   "127.0.0.1",
					Path:   "go-shipyard/shipyard.git",
				},
				extraMark: 1,
			},
		},
		{
			kase: "git@[fe80:14fc:cec5:c174:d88%2510]:go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "ssh",
					User:   url.User("git"),
					Host:   "[fe80:14fc:cec5:c174:d88%10]",
					Path:   "go-shipyard/shipyard.git",
				},
				extraMark: 1,
			},
		},
		{
			kase: "git@[::1]:go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "ssh",
					User:   url.User("git"),
					Host:   "[::1]",
					Path:   "go-shipyard/shipyard.git",
				},
				extraMark: 1,
			},
		},
		{
			kase: "git@github.com:go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "ssh",
					User:   url.User("git"),
					Host:   "github.com",
					Path:   "go-shipyard/shipyard.git",
				},
				extraMark: 1,
			},
		},
		{
			kase: "ssh://git@github.com/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "ssh",
					User:   url.User("git"),
					Host:   "github.com",
					Path:   "/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},
		{
			kase: "ssh://git@[::1]/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "ssh",
					User:   url.User("git"),
					Host:   "[::1]",
					Path:   "/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},
		{
			kase: "/repositories/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "file",
					Path:   "/repositories/go-shipyard/shipyard.git",
				},
				extraMark: 2,
			},
		},
		{
			kase: "file:///repositories/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "file",
					Path:   "/repositories/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},
		{
			kase: "https://github.com/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "https",
					Host:   "github.com",
					Path:   "/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},
		{
			kase: "https://git:git@github.com/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "https",
					Host:   "github.com",
					User:   url.UserPassword("git", "git"),
					Path:   "/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},
		{
			kase: "https://[fe80:14fc:cec5:c174:d88%2510]:20/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "https",
					Host:   "[fe80:14fc:cec5:c174:d88%10]:20",
					Path:   "/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},

		{
			kase: "git://github.com/go-shipyard/shipyard.git",
			expected: &GitURL{
				URL: &url.URL{
					Scheme: "git",
					Host:   "github.com",
					Path:   "/go-shipyard/shipyard.git",
				},
				extraMark: 0,
			},
		},
	}

	for _, kase := range kases {
		t.Run(kase.kase, func(t *testing.T) {
			u, err := Parse(kase.kase)
			assert.NoError(t, err)
			assert.EqualValues(t, kase.expected.extraMark, u.extraMark)
			assert.EqualValues(t, *kase.expected, *u)
		})
	}
}
