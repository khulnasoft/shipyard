// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repository

import (
	"context"

	"github.com/khulnasoft/shipyard/models/organization"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	user_model "github.com/khulnasoft/shipyard/models/user"
)

// CanUserForkRepo returns true if specified user can fork repository.
func CanUserForkRepo(ctx context.Context, user *user_model.User, repo *repo_model.Repository) (bool, error) {
	if user == nil {
		return false, nil
	}
	if repo.OwnerID != user.ID && !repo_model.HasForkedRepo(ctx, user.ID, repo.ID) {
		return true, nil
	}
	ownedOrgs, err := organization.GetOrgsCanCreateRepoByUserID(ctx, user.ID)
	if err != nil {
		return false, err
	}
	for _, org := range ownedOrgs {
		if repo.OwnerID != org.ID && !repo_model.HasForkedRepo(ctx, org.ID, repo.ID) {
			return true, nil
		}
	}
	return false, nil
}
