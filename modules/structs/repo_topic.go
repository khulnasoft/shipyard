// Copyright 2019 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package structs

import (
	"time"
)

// TopicResponse for returning topics
type TopicResponse struct {
	ID        int64     `json:"id"`
	Name      string    `json:"topic_name"`
	RepoCount int       `json:"repo_count"`
	Created   time.Time `json:"created"`
	Updated   time.Time `json:"updated"`
}

// TopicName a list of repo topic names
type TopicName struct {
	TopicNames []string `json:"topics"`
}

// RepoTopicOptions a collection of repo topic names
type RepoTopicOptions struct {
	// list of topic names
	Topics []string `json:"topics"`
}
