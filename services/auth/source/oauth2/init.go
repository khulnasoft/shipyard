// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package oauth2

import (
	"context"
	"encoding/gob"
	"net/http"
	"sync"

	"github.com/khulnasoft/shipyard/models/auth"
	"github.com/khulnasoft/shipyard/models/db"
	"github.com/khulnasoft/shipyard/modules/log"
	"github.com/khulnasoft/shipyard/modules/setting"
	"github.com/khulnasoft/shipyard/modules/util"

	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
)

var gothRWMutex = sync.RWMutex{}

// UsersStoreKey is the key for the store
const UsersStoreKey = "shipyard-oauth2-sessions"

// ProviderHeaderKey is the HTTP header key
const ProviderHeaderKey = "shipyard-oauth2-provider"

// Init initializes the oauth source
func Init(ctx context.Context) error {
	if err := InitSigningKey(); err != nil {
		return err
	}

	// Lock our mutex
	gothRWMutex.Lock()

	gob.Register(&sessions.Session{})

	gothic.Store = &SessionsStore{
		maxLength: int64(setting.OAuth2.MaxTokenLength),
	}

	gothic.SetState = func(req *http.Request) string {
		return uuid.New().String()
	}

	gothic.GetProviderName = func(req *http.Request) (string, error) {
		return req.Header.Get(ProviderHeaderKey), nil
	}

	// Unlock our mutex
	gothRWMutex.Unlock()

	return initOAuth2Sources(ctx)
}

// ResetOAuth2 clears existing OAuth2 providers and loads them from DB
func ResetOAuth2(ctx context.Context) error {
	ClearProviders()
	return initOAuth2Sources(ctx)
}

// initOAuth2Sources is used to load and register all active OAuth2 providers
func initOAuth2Sources(ctx context.Context) error {
	authSources, err := db.Find[auth.Source](ctx, auth.FindSourcesOptions{
		IsActive:  util.OptionalBoolTrue,
		LoginType: auth.OAuth2,
	})
	if err != nil {
		return err
	}
	for _, source := range authSources {
		oauth2Source, ok := source.Cfg.(*Source)
		if !ok {
			continue
		}
		err := oauth2Source.RegisterSource()
		if err != nil {
			log.Critical("Unable to register source: %s due to Error: %v.", source.Name, err)
		}
	}
	return nil
}
