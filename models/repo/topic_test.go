// Copyright 2018 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repo_test

import (
	"testing"

	"github.com/khulnasoft/shipyard/models/db"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	"github.com/khulnasoft/shipyard/models/unittest"

	"github.com/stretchr/testify/assert"
)

func TestAddTopic(t *testing.T) {
	totalNrOfTopics := 6
	repo1NrOfTopics := 3

	assert.NoError(t, unittest.PrepareTestDatabase())

	topics, _, err := repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{})
	assert.NoError(t, err)
	assert.Len(t, topics, totalNrOfTopics)

	topics, total, err := repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{
		ListOptions: db.ListOptions{Page: 1, PageSize: 2},
	})
	assert.NoError(t, err)
	assert.Len(t, topics, 2)
	assert.EqualValues(t, 6, total)

	topics, _, err = repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{
		RepoID: 1,
	})
	assert.NoError(t, err)
	assert.Len(t, topics, repo1NrOfTopics)

	assert.NoError(t, repo_model.SaveTopics(db.DefaultContext, 2, "golang"))
	repo2NrOfTopics := 1
	topics, _, err = repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{})
	assert.NoError(t, err)
	assert.Len(t, topics, totalNrOfTopics)

	topics, _, err = repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{
		RepoID: 2,
	})
	assert.NoError(t, err)
	assert.Len(t, topics, repo2NrOfTopics)

	assert.NoError(t, repo_model.SaveTopics(db.DefaultContext, 2, "golang", "shipyard"))
	repo2NrOfTopics = 2
	totalNrOfTopics++
	topic, err := repo_model.GetTopicByName(db.DefaultContext, "shipyard")
	assert.NoError(t, err)
	assert.EqualValues(t, 1, topic.RepoCount)

	topics, _, err = repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{})
	assert.NoError(t, err)
	assert.Len(t, topics, totalNrOfTopics)

	topics, _, err = repo_model.FindTopics(db.DefaultContext, &repo_model.FindTopicOptions{
		RepoID: 2,
	})
	assert.NoError(t, err)
	assert.Len(t, topics, repo2NrOfTopics)
}

func TestTopicValidator(t *testing.T) {
	assert.True(t, repo_model.ValidateTopic("12345"))
	assert.True(t, repo_model.ValidateTopic("2-test"))
	assert.True(t, repo_model.ValidateTopic("foo.bar"))
	assert.True(t, repo_model.ValidateTopic("test-3"))
	assert.True(t, repo_model.ValidateTopic("first"))
	assert.True(t, repo_model.ValidateTopic("second-test-topic"))
	assert.True(t, repo_model.ValidateTopic("third-project-topic-with-max-length"))

	assert.False(t, repo_model.ValidateTopic("$fourth-test,topic"))
	assert.False(t, repo_model.ValidateTopic("-fifth-test-topic"))
	assert.False(t, repo_model.ValidateTopic("sixth-go-project-topic-with-excess-length"))
	assert.False(t, repo_model.ValidateTopic(".foo"))
}
