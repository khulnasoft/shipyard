// Copyright 2021 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package mailer

import (
	"bytes"
	"context"
	"fmt"

	"github.com/khulnasoft/shipyard/models/organization"
	repo_model "github.com/khulnasoft/shipyard/models/repo"
	user_model "github.com/khulnasoft/shipyard/models/user"
	"github.com/khulnasoft/shipyard/modules/setting"
	"github.com/khulnasoft/shipyard/modules/translation"
)

// SendRepoTransferNotifyMail triggers a notification e-mail when a pending repository transfer was created
func SendRepoTransferNotifyMail(ctx context.Context, doer, newOwner *user_model.User, repo *repo_model.Repository) error {
	if setting.MailService == nil {
		// No mail service configured
		return nil
	}

	if newOwner.IsOrganization() {
		users, err := organization.GetUsersWhoCanCreateOrgRepo(ctx, newOwner.ID)
		if err != nil {
			return err
		}

		langMap := make(map[string][]string)
		for _, user := range users {
			if !user.IsActive {
				// don't send emails to inactive users
				continue
			}
			langMap[user.Language] = append(langMap[user.Language], user.Email)
		}

		for lang, tos := range langMap {
			if err := sendRepoTransferNotifyMailPerLang(lang, newOwner, doer, tos, repo); err != nil {
				return err
			}
		}

		return nil
	}

	return sendRepoTransferNotifyMailPerLang(newOwner.Language, newOwner, doer, []string{newOwner.Email}, repo)
}

// sendRepoTransferNotifyMail triggers a notification e-mail when a pending repository transfer was created for each language
func sendRepoTransferNotifyMailPerLang(lang string, newOwner, doer *user_model.User, emails []string, repo *repo_model.Repository) error {
	var (
		locale  = translation.NewLocale(lang)
		content bytes.Buffer
	)

	destination := locale.Tr("mail.repo.transfer.to_you")
	subject := locale.Tr("mail.repo.transfer.subject_to_you", doer.DisplayName(), repo.FullName())
	if newOwner.IsOrganization() {
		destination = newOwner.DisplayName()
		subject = locale.Tr("mail.repo.transfer.subject_to", doer.DisplayName(), repo.FullName(), destination)
	}

	data := map[string]any{
		"locale":      locale,
		"Doer":        doer,
		"User":        repo.Owner,
		"Repo":        repo.FullName(),
		"Link":        repo.HTMLURL(),
		"Subject":     subject,
		"Language":    locale.Language(),
		"Destination": destination,
	}

	if err := bodyTemplates.ExecuteTemplate(&content, string(mailRepoTransferNotify), data); err != nil {
		return err
	}

	for _, to := range emails {
		msg := NewMessage(to, subject, content.String())
		msg.Info = fmt.Sprintf("UID: %d, repository pending transfer notification", newOwner.ID)

		SendAsync(msg)
	}

	return nil
}
