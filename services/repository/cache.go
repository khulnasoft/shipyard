// Copyright 2020 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repository

import (
	"context"

	repo_model "github.com/khulnasoft/shipyard/models/repo"
	"github.com/khulnasoft/shipyard/modules/cache"
	"github.com/khulnasoft/shipyard/modules/git"
)

// CacheRef cachhe last commit information of the branch or the tag
func CacheRef(ctx context.Context, repo *repo_model.Repository, gitRepo *git.Repository, fullRefName git.RefName) error {
	commit, err := gitRepo.GetCommit(fullRefName.String())
	if err != nil {
		return err
	}

	if gitRepo.LastCommitCache == nil {
		commitsCount, err := cache.GetInt64(repo.GetCommitsCountCacheKey(fullRefName.ShortName(), true), commit.CommitsCount)
		if err != nil {
			return err
		}
		gitRepo.LastCommitCache = git.NewLastCommitCache(commitsCount, repo.FullName(), gitRepo, cache.GetCache())
	}

	return commit.CacheCommit(ctx)
}
