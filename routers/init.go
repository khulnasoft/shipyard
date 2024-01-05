// Copyright 2016 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package routers

import (
	"context"
	"reflect"
	"runtime"

	"github.com/khulnasoft/shipyard/models"
	asymkey_model "github.com/khulnasoft/shipyard/models/asymkey"
	authmodel "github.com/khulnasoft/shipyard/models/auth"
	"github.com/khulnasoft/shipyard/modules/cache"
	"github.com/khulnasoft/shipyard/modules/eventsource"
	"github.com/khulnasoft/shipyard/modules/git"
	"github.com/khulnasoft/shipyard/modules/highlight"
	"github.com/khulnasoft/shipyard/modules/log"
	"github.com/khulnasoft/shipyard/modules/markup"
	"github.com/khulnasoft/shipyard/modules/markup/external"
	"github.com/khulnasoft/shipyard/modules/setting"
	"github.com/khulnasoft/shipyard/modules/ssh"
	"github.com/khulnasoft/shipyard/modules/storage"
	"github.com/khulnasoft/shipyard/modules/svg"
	"github.com/khulnasoft/shipyard/modules/system"
	"github.com/khulnasoft/shipyard/modules/templates"
	"github.com/khulnasoft/shipyard/modules/translation"
	"github.com/khulnasoft/shipyard/modules/web"
	actions_router "github.com/khulnasoft/shipyard/routers/api/actions"
	packages_router "github.com/khulnasoft/shipyard/routers/api/packages"
	apiv1 "github.com/khulnasoft/shipyard/routers/api/v1"
	"github.com/khulnasoft/shipyard/routers/common"
	"github.com/khulnasoft/shipyard/routers/private"
	web_routers "github.com/khulnasoft/shipyard/routers/web"
	actions_service "github.com/khulnasoft/shipyard/services/actions"
	"github.com/khulnasoft/shipyard/services/auth"
	"github.com/khulnasoft/shipyard/services/auth/source/oauth2"
	"github.com/khulnasoft/shipyard/services/automerge"
	"github.com/khulnasoft/shipyard/services/cron"
	feed_service "github.com/khulnasoft/shipyard/services/feed"
	indexer_service "github.com/khulnasoft/shipyard/services/indexer"
	"github.com/khulnasoft/shipyard/services/mailer"
	mailer_incoming "github.com/khulnasoft/shipyard/services/mailer/incoming"
	markup_service "github.com/khulnasoft/shipyard/services/markup"
	repo_migrations "github.com/khulnasoft/shipyard/services/migrations"
	mirror_service "github.com/khulnasoft/shipyard/services/mirror"
	pull_service "github.com/khulnasoft/shipyard/services/pull"
	repo_service "github.com/khulnasoft/shipyard/services/repository"
	"github.com/khulnasoft/shipyard/services/repository/archiver"
	"github.com/khulnasoft/shipyard/services/task"
	"github.com/khulnasoft/shipyard/services/uinotification"
	"github.com/khulnasoft/shipyard/services/webhook"
)

func mustInit(fn func() error) {
	err := fn()
	if err != nil {
		ptr := reflect.ValueOf(fn).Pointer()
		fi := runtime.FuncForPC(ptr)
		log.Fatal("%s failed: %v", fi.Name(), err)
	}
}

func mustInitCtx(ctx context.Context, fn func(ctx context.Context) error) {
	err := fn(ctx)
	if err != nil {
		ptr := reflect.ValueOf(fn).Pointer()
		fi := runtime.FuncForPC(ptr)
		log.Fatal("%s(ctx) failed: %v", fi.Name(), err)
	}
}

func syncAppConfForGit(ctx context.Context) error {
	runtimeState := new(system.RuntimeState)
	if err := system.AppState.Get(ctx, runtimeState); err != nil {
		return err
	}

	updated := false
	if runtimeState.LastAppPath != setting.AppPath {
		log.Info("AppPath changed from '%s' to '%s'", runtimeState.LastAppPath, setting.AppPath)
		runtimeState.LastAppPath = setting.AppPath
		updated = true
	}
	if runtimeState.LastCustomConf != setting.CustomConf {
		log.Info("CustomConf changed from '%s' to '%s'", runtimeState.LastCustomConf, setting.CustomConf)
		runtimeState.LastCustomConf = setting.CustomConf
		updated = true
	}

	if updated {
		log.Info("re-sync repository hooks ...")
		mustInitCtx(ctx, repo_service.SyncRepositoryHooks)

		log.Info("re-write ssh public keys ...")
		mustInitCtx(ctx, asymkey_model.RewriteAllPublicKeys)

		return system.AppState.Set(ctx, runtimeState)
	}
	return nil
}

func InitWebInstallPage(ctx context.Context) {
	translation.InitLocales(ctx)
	setting.LoadSettingsForInstall()
	mustInit(svg.Init)
}

// InitWebInstalled is for global installed configuration.
func InitWebInstalled(ctx context.Context) {
	mustInitCtx(ctx, git.InitFull)
	log.Info("Git version: %s (home: %s)", git.VersionInfo(), git.HomeDir())

	// Setup i18n
	translation.InitLocales(ctx)

	setting.LoadSettings()
	mustInit(storage.Init)

	mailer.NewContext(ctx)
	mustInit(cache.Init)
	mustInit(feed_service.Init)
	mustInit(uinotification.Init)
	mustInitCtx(ctx, archiver.Init)

	highlight.NewContext()
	external.RegisterRenderers()
	markup.Init(markup_service.ProcessorHelper())

	if setting.EnableSQLite3 {
		log.Info("SQLite3 support is enabled")
	} else if setting.Database.Type.IsSQLite3() {
		log.Fatal("SQLite3 support is disabled, but it is used for database setting. Please get or build a Shipyard release with SQLite3 support.")
	}

	mustInitCtx(ctx, common.InitDBEngine)
	log.Info("ORM engine initialization successful!")
	mustInit(system.Init)
	mustInitCtx(ctx, oauth2.Init)

	mustInitCtx(ctx, models.Init)
	mustInitCtx(ctx, authmodel.Init)
	mustInitCtx(ctx, repo_service.Init)

	// Booting long running goroutines.
	mustInit(indexer_service.Init)

	mirror_service.InitSyncMirrors()
	mustInit(webhook.Init)
	mustInit(pull_service.Init)
	mustInit(automerge.Init)
	mustInit(task.Init)
	mustInit(repo_migrations.Init)
	eventsource.GetManager().Init()
	mustInitCtx(ctx, mailer_incoming.Init)

	mustInitCtx(ctx, syncAppConfForGit)

	mustInit(ssh.Init)

	auth.Init()
	mustInit(svg.Init)

	actions_service.Init()

	// Finally start up the cron
	cron.NewContext(ctx)
}

// NormalRoutes represents non install routes
func NormalRoutes() *web.Route {
	_ = templates.HTMLRenderer()
	r := web.NewRoute()
	r.Use(common.ProtocolMiddlewares()...)

	r.Mount("/", web_routers.Routes())
	r.Mount("/api/v1", apiv1.Routes())
	r.Mount("/api/internal", private.Routes())

	r.Post("/-/fetch-redirect", common.FetchRedirectDelegate)

	if setting.Packages.Enabled {
		// This implements package support for most package managers
		r.Mount("/api/packages", packages_router.CommonRoutes())
		// This implements the OCI API (Note this is not preceded by /api but is instead /v2)
		r.Mount("/v2", packages_router.ContainerRoutes())
	}

	if setting.Actions.Enabled {
		prefix := "/api/actions"
		r.Mount(prefix, actions_router.Routes(prefix))

		// TODO: Pipeline api used for runner internal communication with shipyard server. but only artifact is used for now.
		// In Github, it uses ACTIONS_RUNTIME_URL=https://pipelines.actions.githubusercontent.com/fLgcSHkPGySXeIFrg8W8OBSfeg3b5Fls1A1CwX566g8PayEGlg/
		// TODO: this prefix should be generated with a token string with runner ?
		prefix = "/api/actions_pipeline"
		r.Mount(prefix, actions_router.ArtifactsRoutes(prefix))
	}

	return r
}
