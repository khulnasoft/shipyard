// Copyright 2021 The Shipyard Authors. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

package integration

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"testing"

	auth_model "github.com/khulnasoft/shipyard/models/auth"
	issues_model "github.com/khulnasoft/shipyard/models/issues"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	"github.com/khulnasoft/shipyard/models/unittest"
	user_model "github.com/khulnasoft/shipyard/models/user"
	api "github.com/khulnasoft/shipyard/modules/structs"
	"github.com/khulnasoft/shipyard/tests"

	"github.com/stretchr/testify/assert"
)

func TestAPIGetIssueAttachment(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	attachment := unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: 1})
	repo := unittest.AssertExistsAndLoadBean(t, &repo_model.Repository{ID: attachment.RepoID})
	issue := unittest.AssertExistsAndLoadBean(t, &issues_model.Issue{RepoID: attachment.IssueID})
	repoOwner := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: repo.OwnerID})

	session := loginUser(t, repoOwner.Name)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeReadIssue)

	req := NewRequest(t, "GET", fmt.Sprintf("/api/v1/repos/%s/%s/issues/%d/assets/%d", repoOwner.Name, repo.Name, issue.Index, attachment.ID)).
		AddTokenAuth(token)
	resp := session.MakeRequest(t, req, http.StatusOK)
	apiAttachment := new(api.Attachment)
	DecodeJSON(t, resp, &apiAttachment)

	unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: apiAttachment.ID, IssueID: issue.ID})
}

func TestAPIListIssueAttachments(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	attachment := unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: 1})
	repo := unittest.AssertExistsAndLoadBean(t, &repo_model.Repository{ID: attachment.RepoID})
	issue := unittest.AssertExistsAndLoadBean(t, &issues_model.Issue{RepoID: attachment.IssueID})
	repoOwner := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: repo.OwnerID})

	session := loginUser(t, repoOwner.Name)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeReadIssue)

	req := NewRequest(t, "GET", fmt.Sprintf("/api/v1/repos/%s/%s/issues/%d/assets", repoOwner.Name, repo.Name, issue.Index)).
		AddTokenAuth(token)
	resp := session.MakeRequest(t, req, http.StatusOK)
	apiAttachment := new([]api.Attachment)
	DecodeJSON(t, resp, &apiAttachment)

	unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: (*apiAttachment)[0].ID, IssueID: issue.ID})
}

func TestAPICreateIssueAttachment(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	repo := unittest.AssertExistsAndLoadBean(t, &repo_model.Repository{ID: 1})
	issue := unittest.AssertExistsAndLoadBean(t, &issues_model.Issue{RepoID: repo.ID})
	repoOwner := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: repo.OwnerID})

	session := loginUser(t, repoOwner.Name)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeWriteIssue)

	filename := "image.png"
	buff := generateImg()
	body := &bytes.Buffer{}

	// Setup multi-part
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("attachment", filename)
	assert.NoError(t, err)
	_, err = io.Copy(part, &buff)
	assert.NoError(t, err)
	err = writer.Close()
	assert.NoError(t, err)

	req := NewRequestWithBody(t, "POST", fmt.Sprintf("/api/v1/repos/%s/%s/issues/%d/assets", repoOwner.Name, repo.Name, issue.Index), body).
		AddTokenAuth(token)
	req.Header.Add("Content-Type", writer.FormDataContentType())
	resp := session.MakeRequest(t, req, http.StatusCreated)

	apiAttachment := new(api.Attachment)
	DecodeJSON(t, resp, &apiAttachment)

	unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: apiAttachment.ID, IssueID: issue.ID})
}

func TestAPIEditIssueAttachment(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	const newAttachmentName = "newAttachmentName"

	attachment := unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: 1})
	repo := unittest.AssertExistsAndLoadBean(t, &repo_model.Repository{ID: attachment.RepoID})
	issue := unittest.AssertExistsAndLoadBean(t, &issues_model.Issue{RepoID: attachment.IssueID})
	repoOwner := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: repo.OwnerID})

	session := loginUser(t, repoOwner.Name)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeWriteIssue)
	urlStr := fmt.Sprintf("/api/v1/repos/%s/%s/issues/%d/assets/%d",
		repoOwner.Name, repo.Name, issue.Index, attachment.ID)
	req := NewRequestWithValues(t, "PATCH", urlStr, map[string]string{
		"name": newAttachmentName,
	}).AddTokenAuth(token)
	resp := session.MakeRequest(t, req, http.StatusCreated)
	apiAttachment := new(api.Attachment)
	DecodeJSON(t, resp, &apiAttachment)

	unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: apiAttachment.ID, IssueID: issue.ID, Name: apiAttachment.Name})
}

func TestAPIDeleteIssueAttachment(t *testing.T) {
	defer tests.PrepareTestEnv(t)()

	attachment := unittest.AssertExistsAndLoadBean(t, &repo_model.Attachment{ID: 1})
	repo := unittest.AssertExistsAndLoadBean(t, &repo_model.Repository{ID: attachment.RepoID})
	issue := unittest.AssertExistsAndLoadBean(t, &issues_model.Issue{RepoID: attachment.IssueID})
	repoOwner := unittest.AssertExistsAndLoadBean(t, &user_model.User{ID: repo.OwnerID})

	session := loginUser(t, repoOwner.Name)
	token := getTokenForLoggedInUser(t, session, auth_model.AccessTokenScopeWriteIssue)

	req := NewRequest(t, "DELETE", fmt.Sprintf("/api/v1/repos/%s/%s/issues/%d/assets/%d", repoOwner.Name, repo.Name, issue.Index, attachment.ID)).
		AddTokenAuth(token)
	session.MakeRequest(t, req, http.StatusNoContent)

	unittest.AssertNotExistsBean(t, &repo_model.Attachment{ID: attachment.ID, IssueID: issue.ID})
}
