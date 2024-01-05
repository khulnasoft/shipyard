// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repository

import (
	"fmt"
	"os"
	"strings"

	repo_model "github.com/khulnasoft/shipyard/models/repo"
	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/modules/setting"
)

// env keys for git hooks need
const (
	EnvRepoName     = "SHIPYARD_REPO_NAME"
	EnvRepoUsername = "SHIPYARD_REPO_USER_NAME"
	EnvRepoID       = "SHIPYARD_REPO_ID"
	EnvRepoIsWiki   = "SHIPYARD_REPO_IS_WIKI"
	EnvPusherName   = "SHIPYARD_PUSHER_NAME"
	EnvPusherEmail  = "SHIPYARD_PUSHER_EMAIL"
	EnvPusherID     = "SHIPYARD_PUSHER_ID"
	EnvKeyID        = "SHIPYARD_KEY_ID" // public key ID
	EnvDeployKeyID  = "SHIPYARD_DEPLOY_KEY_ID"
	EnvPRID         = "SHIPYARD_PR_ID"
	EnvIsInternal   = "SHIPYARD_INTERNAL_PUSH"
	EnvAppURL       = "SHIPYARD_ROOT_URL"
	EnvActionPerm   = "SHIPYARD_ACTION_PERM"
)

// InternalPushingEnvironment returns an os environment to switch off hooks on push
// It is recommended to avoid using this unless you are pushing within a transaction
// or if you absolutely are sure that post-receive and pre-receive will do nothing
// We provide the full pushing-environment for other hook providers
func InternalPushingEnvironment(doer *user_model.User, repo *repo_model.Repository) []string {
	return append(PushingEnvironment(doer, repo),
		EnvIsInternal+"=true",
	)
}

// PushingEnvironment returns an os environment to allow hooks to work on push
func PushingEnvironment(doer *user_model.User, repo *repo_model.Repository) []string {
	return FullPushingEnvironment(doer, doer, repo, repo.Name, 0)
}

// FullPushingEnvironment returns an os environment to allow hooks to work on push
func FullPushingEnvironment(author, committer *user_model.User, repo *repo_model.Repository, repoName string, prID int64) []string {
	isWiki := "false"
	if strings.HasSuffix(repoName, ".wiki") {
		isWiki = "true"
	}

	authorSig := author.NewGitSig()
	committerSig := committer.NewGitSig()

	environ := append(os.Environ(),
		"GIT_AUTHOR_NAME="+authorSig.Name,
		"GIT_AUTHOR_EMAIL="+authorSig.Email,
		"GIT_COMMITTER_NAME="+committerSig.Name,
		"GIT_COMMITTER_EMAIL="+committerSig.Email,
		EnvRepoName+"="+repoName,
		EnvRepoUsername+"="+repo.OwnerName,
		EnvRepoIsWiki+"="+isWiki,
		EnvPusherName+"="+committer.Name,
		EnvPusherID+"="+fmt.Sprintf("%d", committer.ID),
		EnvRepoID+"="+fmt.Sprintf("%d", repo.ID),
		EnvPRID+"="+fmt.Sprintf("%d", prID),
		EnvAppURL+"="+setting.AppURL,
		"SSH_ORIGINAL_COMMAND=shipyard-internal",
	)

	if !committer.KeepEmailPrivate {
		environ = append(environ, EnvPusherEmail+"="+committer.Email)
	}

	return environ
}
