// Copyright 2022 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package org

import (
	"context"
	"errors"

	"github.com/khulnasoft/shipyard/models"
	"github.com/khulnasoft/shipyard/models/db"
	"github.com/khulnasoft/shipyard/models/organization"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
)

// TeamAddRepository adds new repository to team of organization.
func TeamAddRepository(ctx context.Context, t *organization.Team, repo *repo_model.Repository) (err error) {
	if repo.OwnerID != t.OrgID {
		return errors.New("repository does not belong to organization")
	} else if organization.HasTeamRepo(ctx, t.OrgID, t.ID, repo.ID) {
		return nil
	}

	return db.WithTx(ctx, func(ctx context.Context) error {
		return models.AddRepository(ctx, t, repo)
	})
}
