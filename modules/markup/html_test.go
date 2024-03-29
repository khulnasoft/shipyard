// Copyright 2017 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package markup_test

import (
	"context"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/khulnasoft/shipyard/models/unittest"
	"github.com/khulnasoft/shipyard/modules/emoji"
	"github.com/khulnasoft/shipyard/modules/git"
	"github.com/khulnasoft/shipyard/modules/log"
	"github.com/khulnasoft/shipyard/modules/markup"
	"github.com/khulnasoft/shipyard/modules/markup/markdown"
	"github.com/khulnasoft/shipyard/modules/setting"
	"github.com/khulnasoft/shipyard/modules/util"

	"github.com/stretchr/testify/assert"
)

var localMetas = map[string]string{
	"user":     "gogits",
	"repo":     "gogs",
	"repoPath": "../../tests/shipyard-repositories-meta/user13/repo11.git/",
}

func TestMain(m *testing.M) {
	unittest.InitSettings()
	if err := git.InitSimple(context.Background()); err != nil {
		log.Fatal("git init failed, err: %v", err)
	}
	os.Exit(m.Run())
}

func TestRender_Commits(t *testing.T) {
	setting.AppURL = markup.TestAppURL
	test := func(input, expected string) {
		buffer, err := markup.RenderString(&markup.RenderContext{
			Ctx:          git.DefaultContext,
			RelativePath: ".md",
			URLPrefix:    markup.TestRepoURL,
			Metas:        localMetas,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(buffer))
	}

	sha := "65f1bf27bc3bf70f64657658635e66094edbcb4d"
	repo := markup.TestRepoURL
	commit := util.URLJoin(repo, "commit", sha)
	tree := util.URLJoin(repo, "tree", sha, "src")

	file := util.URLJoin(repo, "commit", sha, "example.txt")
	fileWithExtra := file + ":"
	fileWithHash := file + "#L2"
	fileWithHasExtra := file + "#L2:"
	commitCompare := util.URLJoin(repo, "compare", sha+"..."+sha)
	commitCompareWithHash := commitCompare + "#L2"

	test(sha, `<p><a href="`+commit+`" rel="nofollow"><code>65f1bf27bc</code></a></p>`)
	test(sha[:7], `<p><a href="`+commit[:len(commit)-(40-7)]+`" rel="nofollow"><code>65f1bf2</code></a></p>`)
	test(sha[:39], `<p><a href="`+commit[:len(commit)-(40-39)]+`" rel="nofollow"><code>65f1bf27bc</code></a></p>`)
	test(commit, `<p><a href="`+commit+`" rel="nofollow"><code>65f1bf27bc</code></a></p>`)
	test(tree, `<p><a href="`+tree+`" rel="nofollow"><code>65f1bf27bc/src</code></a></p>`)

	test(file, `<p><a href="`+file+`" rel="nofollow"><code>65f1bf27bc/example.txt</code></a></p>`)
	test(fileWithExtra, `<p><a href="`+file+`" rel="nofollow"><code>65f1bf27bc/example.txt</code></a>:</p>`)
	test(fileWithHash, `<p><a href="`+fileWithHash+`" rel="nofollow"><code>65f1bf27bc/example.txt (L2)</code></a></p>`)
	test(fileWithHasExtra, `<p><a href="`+fileWithHash+`" rel="nofollow"><code>65f1bf27bc/example.txt (L2)</code></a>:</p>`)
	test(commitCompare, `<p><a href="`+commitCompare+`" rel="nofollow"><code>65f1bf27bc...65f1bf27bc</code></a></p>`)
	test(commitCompareWithHash, `<p><a href="`+commitCompareWithHash+`" rel="nofollow"><code>65f1bf27bc...65f1bf27bc (L2)</code></a></p>`)

	test("commit "+sha, `<p>commit <a href="`+commit+`" rel="nofollow"><code>65f1bf27bc</code></a></p>`)
	test("/home/shipyard/"+sha, "<p>/home/shipyard/"+sha+"</p>")
	test("deadbeef", `<p>deadbeef</p>`)
	test("d27ace93", `<p>d27ace93</p>`)
	test(sha[:14]+".x", `<p>`+sha[:14]+`.x</p>`)

	expected14 := `<a href="` + commit[:len(commit)-(40-14)] + `" rel="nofollow"><code>` + sha[:10] + `</code></a>`
	test(sha[:14]+".", `<p>`+expected14+`.</p>`)
	test(sha[:14]+",", `<p>`+expected14+`,</p>`)
	test("["+sha[:14]+"]", `<p>[`+expected14+`]</p>`)
}

func TestRender_CrossReferences(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	test := func(input, expected string) {
		buffer, err := markup.RenderString(&markup.RenderContext{
			Ctx:          git.DefaultContext,
			RelativePath: "a.md",
			URLPrefix:    setting.AppSubURL,
			Metas:        localMetas,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(buffer))
	}

	test(
		"gogits/gogs#12345",
		`<p><a href="`+util.URLJoin(markup.TestAppURL, "gogits", "gogs", "issues", "12345")+`" class="ref-issue" rel="nofollow">gogits/gogs#12345</a></p>`)
	test(
		"go-shipyard/shipyard#12345",
		`<p><a href="`+util.URLJoin(markup.TestAppURL, "go-shipyard", "shipyard", "issues", "12345")+`" class="ref-issue" rel="nofollow">go-shipyard/shipyard#12345</a></p>`)
	test(
		"/home/shipyard/go-shipyard/shipyard#12345",
		`<p>/home/shipyard/go-shipyard/shipyard#12345</p>`)
	test(
		util.URLJoin(markup.TestAppURL, "goshipyard", "shipyard", "issues", "12345"),
		`<p><a href="`+util.URLJoin(markup.TestAppURL, "goshipyard", "shipyard", "issues", "12345")+`" class="ref-issue" rel="nofollow">goshipyard/shipyard#12345</a></p>`)
	test(
		util.URLJoin(markup.TestAppURL, "go-shipyard", "shipyard", "issues", "12345"),
		`<p><a href="`+util.URLJoin(markup.TestAppURL, "go-shipyard", "shipyard", "issues", "12345")+`" class="ref-issue" rel="nofollow">go-shipyard/shipyard#12345</a></p>`)
	test(
		util.URLJoin(markup.TestAppURL, "goshipyard", "some-repo-name", "issues", "12345"),
		`<p><a href="`+util.URLJoin(markup.TestAppURL, "goshipyard", "some-repo-name", "issues", "12345")+`" class="ref-issue" rel="nofollow">goshipyard/some-repo-name#12345</a></p>`)
}

func TestMisc_IsSameDomain(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	sha := "b6dd6210eaebc915fd5be5579c58cce4da2e2579"
	commit := util.URLJoin(markup.TestRepoURL, "commit", sha)

	assert.True(t, markup.IsSameDomain(commit))
	assert.False(t, markup.IsSameDomain("http://google.com/ncr"))
	assert.False(t, markup.IsSameDomain("favicon.ico"))
}

func TestRender_links(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	test := func(input, expected string) {
		buffer, err := markup.RenderString(&markup.RenderContext{
			Ctx:          git.DefaultContext,
			RelativePath: "a.md",
			URLPrefix:    markup.TestRepoURL,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(buffer))
	}
	// Text that should be turned into URL

	defaultCustom := setting.Markdown.CustomURLSchemes
	setting.Markdown.CustomURLSchemes = []string{"ftp", "magnet"}
	markup.InitializeSanitizer()
	markup.CustomLinkURLSchemes(setting.Markdown.CustomURLSchemes)

	test(
		"https://www.example.com",
		`<p><a href="https://www.example.com" rel="nofollow">https://www.example.com</a></p>`)
	test(
		"http://www.example.com",
		`<p><a href="http://www.example.com" rel="nofollow">http://www.example.com</a></p>`)
	test(
		"https://example.com",
		`<p><a href="https://example.com" rel="nofollow">https://example.com</a></p>`)
	test(
		"http://example.com",
		`<p><a href="http://example.com" rel="nofollow">http://example.com</a></p>`)
	test(
		"http://foo.com/blah_blah",
		`<p><a href="http://foo.com/blah_blah" rel="nofollow">http://foo.com/blah_blah</a></p>`)
	test(
		"http://foo.com/blah_blah/",
		`<p><a href="http://foo.com/blah_blah/" rel="nofollow">http://foo.com/blah_blah/</a></p>`)
	test(
		"http://www.example.com/wpstyle/?p=364",
		`<p><a href="http://www.example.com/wpstyle/?p=364" rel="nofollow">http://www.example.com/wpstyle/?p=364</a></p>`)
	test(
		"https://www.example.com/foo/?bar=baz&inga=42&quux",
		`<p><a href="https://www.example.com/foo/?bar=baz&amp;inga=42&amp;quux" rel="nofollow">https://www.example.com/foo/?bar=baz&amp;inga=42&amp;quux</a></p>`)
	test(
		"http://142.42.1.1/",
		`<p><a href="http://142.42.1.1/" rel="nofollow">http://142.42.1.1/</a></p>`)
	test(
		"https://github.com/go-shipyard/shipyard/?p=aaa/bbb.html#ccc-ddd",
		`<p><a href="https://github.com/go-shipyard/shipyard/?p=aaa/bbb.html#ccc-ddd" rel="nofollow">https://github.com/go-shipyard/shipyard/?p=aaa/bbb.html#ccc-ddd</a></p>`)
	test(
		"https://en.wikipedia.org/wiki/URL_(disambiguation)",
		`<p><a href="https://en.wikipedia.org/wiki/URL_(disambiguation)" rel="nofollow">https://en.wikipedia.org/wiki/URL_(disambiguation)</a></p>`)
	test(
		"https://foo_bar.example.com/",
		`<p><a href="https://foo_bar.example.com/" rel="nofollow">https://foo_bar.example.com/</a></p>`)
	test(
		"https://stackoverflow.com/questions/2896191/what-is-go-used-fore",
		`<p><a href="https://stackoverflow.com/questions/2896191/what-is-go-used-fore" rel="nofollow">https://stackoverflow.com/questions/2896191/what-is-go-used-fore</a></p>`)
	test(
		"https://username:password@shipyard.khulnasoft.com",
		`<p><a href="https://username:password@shipyard.khulnasoft.com" rel="nofollow">https://username:password@shipyard.khulnasoft.com</a></p>`)
	test(
		"ftp://shipyard.khulnasoft.com/file.txt",
		`<p><a href="ftp://shipyard.khulnasoft.com/file.txt" rel="nofollow">ftp://shipyard.khulnasoft.com/file.txt</a></p>`)
	test(
		"magnet:?xt=urn:btih:5dee65101db281ac9c46344cd6b175cdcadabcde&dn=download",
		`<p><a href="magnet:?xt=urn:btih:5dee65101db281ac9c46344cd6b175cdcadabcde&amp;dn=download" rel="nofollow">magnet:?xt=urn:btih:5dee65101db281ac9c46344cd6b175cdcadabcde&amp;dn=download</a></p>`)

	// Test that should *not* be turned into URL
	test(
		"www.example.com",
		`<p>www.example.com</p>`)
	test(
		"example.com",
		`<p>example.com</p>`)
	test(
		"test.example.com",
		`<p>test.example.com</p>`)
	test(
		"http://",
		`<p>http://</p>`)
	test(
		"https://",
		`<p>https://</p>`)
	test(
		"://",
		`<p>://</p>`)
	test(
		"www",
		`<p>www</p>`)
	test(
		"ftps://shipyard.khulnasoft.com",
		`<p>ftps://shipyard.khulnasoft.com</p>`)

	// Restore previous settings
	setting.Markdown.CustomURLSchemes = defaultCustom
	markup.InitializeSanitizer()
	markup.CustomLinkURLSchemes(setting.Markdown.CustomURLSchemes)
}

func TestRender_email(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	test := func(input, expected string) {
		res, err := markup.RenderString(&markup.RenderContext{
			Ctx:          git.DefaultContext,
			RelativePath: "a.md",
			URLPrefix:    markup.TestRepoURL,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(res))
	}
	// Text that should be turned into email link

	test(
		"info@shipyard.khulnasoft.com",
		`<p><a href="mailto:info@shipyard.khulnasoft.com" rel="nofollow">info@shipyard.khulnasoft.com</a></p>`)
	test(
		"(info@shipyard.khulnasoft.com)",
		`<p>(<a href="mailto:info@shipyard.khulnasoft.com" rel="nofollow">info@shipyard.khulnasoft.com</a>)</p>`)
	test(
		"[info@shipyard.khulnasoft.com]",
		`<p>[<a href="mailto:info@shipyard.khulnasoft.com" rel="nofollow">info@shipyard.khulnasoft.com</a>]</p>`)
	test(
		"info@shipyard.khulnasoft.com.",
		`<p><a href="mailto:info@shipyard.khulnasoft.com" rel="nofollow">info@shipyard.khulnasoft.com</a>.</p>`)
	test(
		"firstname+lastname@shipyard.khulnasoft.com",
		`<p><a href="mailto:firstname+lastname@shipyard.khulnasoft.com" rel="nofollow">firstname+lastname@shipyard.khulnasoft.com</a></p>`)
	test(
		"send email to info@shipyard.co.uk.",
		`<p>send email to <a href="mailto:info@shipyard.co.uk" rel="nofollow">info@shipyard.co.uk</a>.</p>`)

	test(
		`j.doe@example.com,
	j.doe@example.com.
	j.doe@example.com;
	j.doe@example.com?
	j.doe@example.com!`,
		`<p><a href="mailto:j.doe@example.com" rel="nofollow">j.doe@example.com</a>,<br/>
<a href="mailto:j.doe@example.com" rel="nofollow">j.doe@example.com</a>.<br/>
<a href="mailto:j.doe@example.com" rel="nofollow">j.doe@example.com</a>;<br/>
<a href="mailto:j.doe@example.com" rel="nofollow">j.doe@example.com</a>?<br/>
<a href="mailto:j.doe@example.com" rel="nofollow">j.doe@example.com</a>!</p>`)

	// Test that should *not* be turned into email links
	test(
		"\"info@shipyard.khulnasoft.com\"",
		`<p>&#34;info@shipyard.khulnasoft.com&#34;</p>`)
	test(
		"/home/shipyard/mailstore/info@shipyard.khulnasoft.com",
		`<p>/home/shipyard/mailstore/info@shipyard.khulnasoft.com</p>`)
	test(
		"git@try.shipyard.io:go-shipyard/shipyard.git",
		`<p>git@try.shipyard.io:go-shipyard/shipyard.git</p>`)
	test(
		"shipyard@3",
		`<p>shipyard@3</p>`)
	test(
		"shipyard@gmail.c",
		`<p>shipyard@gmail.c</p>`)
	test(
		"email@domain@domain.com",
		`<p>email@domain@domain.com</p>`)
	test(
		"email@domain..com",
		`<p>email@domain..com</p>`)
}

func TestRender_emoji(t *testing.T) {
	setting.AppURL = markup.TestAppURL
	setting.StaticURLPrefix = markup.TestAppURL

	test := func(input, expected string) {
		expected = strings.ReplaceAll(expected, "&", "&amp;")
		buffer, err := markup.RenderString(&markup.RenderContext{
			Ctx:          git.DefaultContext,
			RelativePath: "a.md",
			URLPrefix:    markup.TestRepoURL,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(buffer))
	}

	// Make sure we can successfully match every emoji in our dataset with regex
	for i := range emoji.GemojiData {
		test(
			emoji.GemojiData[i].Emoji,
			`<p><span class="emoji" aria-label="`+emoji.GemojiData[i].Description+`">`+emoji.GemojiData[i].Emoji+`</span></p>`)
	}
	for i := range emoji.GemojiData {
		test(
			":"+emoji.GemojiData[i].Aliases[0]+":",
			`<p><span class="emoji" aria-label="`+emoji.GemojiData[i].Description+`">`+emoji.GemojiData[i].Emoji+`</span></p>`)
	}

	// Text that should be turned into or recognized as emoji
	test(
		":shipyard:",
		`<p><span class="emoji" aria-label="shipyard"><img alt=":shipyard:" src="`+setting.StaticURLPrefix+`/assets/img/emoji/shipyard.png"/></span></p>`)
	test(
		":custom-emoji:",
		`<p>:custom-emoji:</p>`)
	setting.UI.CustomEmojisMap["custom-emoji"] = ":custom-emoji:"
	test(
		":custom-emoji:",
		`<p><span class="emoji" aria-label="custom-emoji"><img alt=":custom-emoji:" src="`+setting.StaticURLPrefix+`/assets/img/emoji/custom-emoji.png"/></span></p>`)
	test(
		"这是字符:1::+1: some🐊 \U0001f44d:custom-emoji: :shipyard:",
		`<p>这是字符:1:<span class="emoji" aria-label="thumbs up">👍</span> some<span class="emoji" aria-label="crocodile">🐊</span> `+
			`<span class="emoji" aria-label="thumbs up">👍</span><span class="emoji" aria-label="custom-emoji"><img alt=":custom-emoji:" src="`+setting.StaticURLPrefix+`/assets/img/emoji/custom-emoji.png"/></span> `+
			`<span class="emoji" aria-label="shipyard"><img alt=":shipyard:" src="`+setting.StaticURLPrefix+`/assets/img/emoji/shipyard.png"/></span></p>`)
	test(
		"Some text with 😄 in the middle",
		`<p>Some text with <span class="emoji" aria-label="grinning face with smiling eyes">😄</span> in the middle</p>`)
	test(
		"Some text with :smile: in the middle",
		`<p>Some text with <span class="emoji" aria-label="grinning face with smiling eyes">😄</span> in the middle</p>`)
	test(
		"Some text with 😄😄 2 emoji next to each other",
		`<p>Some text with <span class="emoji" aria-label="grinning face with smiling eyes">😄</span><span class="emoji" aria-label="grinning face with smiling eyes">😄</span> 2 emoji next to each other</p>`)
	test(
		"😎🤪🔐🤑❓",
		`<p><span class="emoji" aria-label="smiling face with sunglasses">😎</span><span class="emoji" aria-label="zany face">🤪</span><span class="emoji" aria-label="locked with key">🔐</span><span class="emoji" aria-label="money-mouth face">🤑</span><span class="emoji" aria-label="red question mark">❓</span></p>`)

	// should match nothing
	test(
		"2001:0db8:85a3:0000:0000:8a2e:0370:7334",
		`<p>2001:0db8:85a3:0000:0000:8a2e:0370:7334</p>`)
	test(
		":not exist:",
		`<p>:not exist:</p>`)
}

func TestRender_ShortLinks(t *testing.T) {
	setting.AppURL = markup.TestAppURL
	tree := util.URLJoin(markup.TestRepoURL, "src", "master")

	test := func(input, expected, expectedWiki string) {
		buffer, err := markdown.RenderString(&markup.RenderContext{
			Ctx:       git.DefaultContext,
			URLPrefix: tree,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(buffer))
		buffer, err = markdown.RenderString(&markup.RenderContext{
			Ctx:       git.DefaultContext,
			URLPrefix: markup.TestRepoURL,
			Metas:     localMetas,
			IsWiki:    true,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expectedWiki), strings.TrimSpace(buffer))
	}

	rawtree := util.URLJoin(markup.TestRepoURL, "raw", "master")
	url := util.URLJoin(tree, "Link")
	otherURL := util.URLJoin(tree, "Other-Link")
	encodedURL := util.URLJoin(tree, "Link%3F")
	imgurl := util.URLJoin(rawtree, "Link.jpg")
	otherImgurl := util.URLJoin(rawtree, "Link+Other.jpg")
	encodedImgurl := util.URLJoin(rawtree, "Link+%23.jpg")
	notencodedImgurl := util.URLJoin(rawtree, "some", "path", "Link+#.jpg")
	urlWiki := util.URLJoin(markup.TestRepoURL, "wiki", "Link")
	otherURLWiki := util.URLJoin(markup.TestRepoURL, "wiki", "Other-Link")
	encodedURLWiki := util.URLJoin(markup.TestRepoURL, "wiki", "Link%3F")
	imgurlWiki := util.URLJoin(markup.TestRepoURL, "wiki", "raw", "Link.jpg")
	otherImgurlWiki := util.URLJoin(markup.TestRepoURL, "wiki", "raw", "Link+Other.jpg")
	encodedImgurlWiki := util.URLJoin(markup.TestRepoURL, "wiki", "raw", "Link+%23.jpg")
	notencodedImgurlWiki := util.URLJoin(markup.TestRepoURL, "wiki", "raw", "some", "path", "Link+#.jpg")
	favicon := "http://google.com/favicon.ico"

	test(
		"[[Link]]",
		`<p><a href="`+url+`" rel="nofollow">Link</a></p>`,
		`<p><a href="`+urlWiki+`" rel="nofollow">Link</a></p>`)
	test(
		"[[Link.jpg]]",
		`<p><a href="`+imgurl+`" rel="nofollow"><img src="`+imgurl+`" title="Link.jpg" alt="Link.jpg"/></a></p>`,
		`<p><a href="`+imgurlWiki+`" rel="nofollow"><img src="`+imgurlWiki+`" title="Link.jpg" alt="Link.jpg"/></a></p>`)
	test(
		"[["+favicon+"]]",
		`<p><a href="`+favicon+`" rel="nofollow"><img src="`+favicon+`" title="favicon.ico" alt="`+favicon+`"/></a></p>`,
		`<p><a href="`+favicon+`" rel="nofollow"><img src="`+favicon+`" title="favicon.ico" alt="`+favicon+`"/></a></p>`)
	test(
		"[[Name|Link]]",
		`<p><a href="`+url+`" rel="nofollow">Name</a></p>`,
		`<p><a href="`+urlWiki+`" rel="nofollow">Name</a></p>`)
	test(
		"[[Name|Link.jpg]]",
		`<p><a href="`+imgurl+`" rel="nofollow"><img src="`+imgurl+`" title="Name" alt="Name"/></a></p>`,
		`<p><a href="`+imgurlWiki+`" rel="nofollow"><img src="`+imgurlWiki+`" title="Name" alt="Name"/></a></p>`)
	test(
		"[[Name|Link.jpg|alt=AltName]]",
		`<p><a href="`+imgurl+`" rel="nofollow"><img src="`+imgurl+`" title="AltName" alt="AltName"/></a></p>`,
		`<p><a href="`+imgurlWiki+`" rel="nofollow"><img src="`+imgurlWiki+`" title="AltName" alt="AltName"/></a></p>`)
	test(
		"[[Name|Link.jpg|title=Title]]",
		`<p><a href="`+imgurl+`" rel="nofollow"><img src="`+imgurl+`" title="Title" alt="Title"/></a></p>`,
		`<p><a href="`+imgurlWiki+`" rel="nofollow"><img src="`+imgurlWiki+`" title="Title" alt="Title"/></a></p>`)
	test(
		"[[Name|Link.jpg|alt=AltName|title=Title]]",
		`<p><a href="`+imgurl+`" rel="nofollow"><img src="`+imgurl+`" title="Title" alt="AltName"/></a></p>`,
		`<p><a href="`+imgurlWiki+`" rel="nofollow"><img src="`+imgurlWiki+`" title="Title" alt="AltName"/></a></p>`)
	test(
		"[[Name|Link.jpg|alt=\"AltName\"|title='Title']]",
		`<p><a href="`+imgurl+`" rel="nofollow"><img src="`+imgurl+`" title="Title" alt="AltName"/></a></p>`,
		`<p><a href="`+imgurlWiki+`" rel="nofollow"><img src="`+imgurlWiki+`" title="Title" alt="AltName"/></a></p>`)
	test(
		"[[Name|Link Other.jpg|alt=\"AltName\"|title='Title']]",
		`<p><a href="`+otherImgurl+`" rel="nofollow"><img src="`+otherImgurl+`" title="Title" alt="AltName"/></a></p>`,
		`<p><a href="`+otherImgurlWiki+`" rel="nofollow"><img src="`+otherImgurlWiki+`" title="Title" alt="AltName"/></a></p>`)
	test(
		"[[Link]] [[Other Link]]",
		`<p><a href="`+url+`" rel="nofollow">Link</a> <a href="`+otherURL+`" rel="nofollow">Other Link</a></p>`,
		`<p><a href="`+urlWiki+`" rel="nofollow">Link</a> <a href="`+otherURLWiki+`" rel="nofollow">Other Link</a></p>`)
	test(
		"[[Link?]]",
		`<p><a href="`+encodedURL+`" rel="nofollow">Link?</a></p>`,
		`<p><a href="`+encodedURLWiki+`" rel="nofollow">Link?</a></p>`)
	test(
		"[[Link]] [[Other Link]] [[Link?]]",
		`<p><a href="`+url+`" rel="nofollow">Link</a> <a href="`+otherURL+`" rel="nofollow">Other Link</a> <a href="`+encodedURL+`" rel="nofollow">Link?</a></p>`,
		`<p><a href="`+urlWiki+`" rel="nofollow">Link</a> <a href="`+otherURLWiki+`" rel="nofollow">Other Link</a> <a href="`+encodedURLWiki+`" rel="nofollow">Link?</a></p>`)
	test(
		"[[Link #.jpg]]",
		`<p><a href="`+encodedImgurl+`" rel="nofollow"><img src="`+encodedImgurl+`" title="Link #.jpg" alt="Link #.jpg"/></a></p>`,
		`<p><a href="`+encodedImgurlWiki+`" rel="nofollow"><img src="`+encodedImgurlWiki+`" title="Link #.jpg" alt="Link #.jpg"/></a></p>`)
	test(
		"[[Name|Link #.jpg|alt=\"AltName\"|title='Title']]",
		`<p><a href="`+encodedImgurl+`" rel="nofollow"><img src="`+encodedImgurl+`" title="Title" alt="AltName"/></a></p>`,
		`<p><a href="`+encodedImgurlWiki+`" rel="nofollow"><img src="`+encodedImgurlWiki+`" title="Title" alt="AltName"/></a></p>`)
	test(
		"[[some/path/Link #.jpg]]",
		`<p><a href="`+notencodedImgurl+`" rel="nofollow"><img src="`+notencodedImgurl+`" title="Link #.jpg" alt="some/path/Link #.jpg"/></a></p>`,
		`<p><a href="`+notencodedImgurlWiki+`" rel="nofollow"><img src="`+notencodedImgurlWiki+`" title="Link #.jpg" alt="some/path/Link #.jpg"/></a></p>`)
	test(
		"<p><a href=\"https://example.org\">[[foobar]]</a></p>",
		`<p><a href="https://example.org" rel="nofollow">[[foobar]]</a></p>`,
		`<p><a href="https://example.org" rel="nofollow">[[foobar]]</a></p>`)
}

func TestRender_RelativeImages(t *testing.T) {
	setting.AppURL = markup.TestAppURL
	tree := util.URLJoin(markup.TestRepoURL, "src", "master")

	test := func(input, expected, expectedWiki string) {
		buffer, err := markdown.RenderString(&markup.RenderContext{
			Ctx:       git.DefaultContext,
			URLPrefix: tree,
			Metas:     localMetas,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(buffer))
		buffer, err = markdown.RenderString(&markup.RenderContext{
			Ctx:       git.DefaultContext,
			URLPrefix: markup.TestRepoURL,
			Metas:     localMetas,
			IsWiki:    true,
		}, input)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expectedWiki), strings.TrimSpace(buffer))
	}

	rawwiki := util.URLJoin(markup.TestRepoURL, "wiki", "raw")
	mediatree := util.URLJoin(markup.TestRepoURL, "media", "master")

	test(
		`<img src="Link">`,
		`<img src="`+util.URLJoin(mediatree, "Link")+`"/>`,
		`<img src="`+util.URLJoin(rawwiki, "Link")+`"/>`)

	test(
		`<img src="./icon.png">`,
		`<img src="`+util.URLJoin(mediatree, "icon.png")+`"/>`,
		`<img src="`+util.URLJoin(rawwiki, "icon.png")+`"/>`)
}

func Test_ParseClusterFuzz(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	localMetas := map[string]string{
		"user": "go-shipyard",
		"repo": "shipyard",
	}

	data := "<A><maTH><tr><MN><bodY ÿ><temPlate></template><tH><tr></A><tH><d<bodY "

	var res strings.Builder
	err := markup.PostProcess(&markup.RenderContext{
		Ctx:       git.DefaultContext,
		URLPrefix: "https://example.com",
		Metas:     localMetas,
	}, strings.NewReader(data), &res)
	assert.NoError(t, err)
	assert.NotContains(t, res.String(), "<html")

	data = "<!DOCTYPE html>\n<A><maTH><tr><MN><bodY ÿ><temPlate></template><tH><tr></A><tH><d<bodY "

	res.Reset()
	err = markup.PostProcess(&markup.RenderContext{
		Ctx:       git.DefaultContext,
		URLPrefix: "https://example.com",
		Metas:     localMetas,
	}, strings.NewReader(data), &res)

	assert.NoError(t, err)
	assert.NotContains(t, res.String(), "<html")
}

func TestPostProcess_RenderDocument(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	localMetas := map[string]string{
		"user": "go-shipyard",
		"repo": "shipyard",
		"mode": "document",
	}

	test := func(input, expected string) {
		var res strings.Builder
		err := markup.PostProcess(&markup.RenderContext{
			Ctx:       git.DefaultContext,
			URLPrefix: "https://example.com",
			Metas:     localMetas,
		}, strings.NewReader(input), &res)
		assert.NoError(t, err)
		assert.Equal(t, strings.TrimSpace(expected), strings.TrimSpace(res.String()))
	}

	// Issue index shouldn't be post processing in a document.
	test(
		"#1",
		"#1")

	// But cross-referenced issue index should work.
	test(
		"go-shipyard/shipyard#12345",
		`<a href="`+util.URLJoin(markup.TestAppURL, "go-shipyard", "shipyard", "issues", "12345")+`" class="ref-issue">go-shipyard/shipyard#12345</a>`)

	// Test that other post processing still works.
	test(
		":shipyard:",
		`<span class="emoji" aria-label="shipyard"><img alt=":shipyard:" src="`+setting.StaticURLPrefix+`/assets/img/emoji/shipyard.png"/></span>`)
	test(
		"Some text with 😄 in the middle",
		`Some text with <span class="emoji" aria-label="grinning face with smiling eyes">😄</span> in the middle`)
	test("http://localhost:3000/person/repo/issues/4#issuecomment-1234",
		`<a href="http://localhost:3000/person/repo/issues/4#issuecomment-1234" class="ref-issue">person/repo#4 (comment)</a>`)
}

func TestIssue16020(t *testing.T) {
	setting.AppURL = markup.TestAppURL

	localMetas := map[string]string{
		"user": "go-shipyard",
		"repo": "shipyard",
	}

	data := `<img src="data:image/png;base64,i//V"/>`

	var res strings.Builder
	err := markup.PostProcess(&markup.RenderContext{
		Ctx:       git.DefaultContext,
		URLPrefix: "https://example.com",
		Metas:     localMetas,
	}, strings.NewReader(data), &res)
	assert.NoError(t, err)
	assert.Equal(t, data, res.String())
}

func BenchmarkEmojiPostprocess(b *testing.B) {
	data := "🥰 "
	for len(data) < 1<<16 {
		data += data
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		var res strings.Builder
		err := markup.PostProcess(&markup.RenderContext{
			Ctx:       git.DefaultContext,
			URLPrefix: "https://example.com",
			Metas:     localMetas,
		}, strings.NewReader(data), &res)
		assert.NoError(b, err)
	}
}

func TestFuzz(t *testing.T) {
	s := "t/l/issues/8#/../../a"
	renderContext := markup.RenderContext{
		Ctx:       git.DefaultContext,
		URLPrefix: "https://example.com/go-shipyard/shipyard",
		Metas: map[string]string{
			"user": "go-shipyard",
			"repo": "shipyard",
		},
	}

	err := markup.PostProcess(&renderContext, strings.NewReader(s), io.Discard)

	assert.NoError(t, err)
}

func TestIssue18471(t *testing.T) {
	data := `http://domain/org/repo/compare/783b039...da951ce`

	var res strings.Builder
	err := markup.PostProcess(&markup.RenderContext{
		Ctx:       git.DefaultContext,
		URLPrefix: "https://example.com",
		Metas:     localMetas,
	}, strings.NewReader(data), &res)

	assert.NoError(t, err)
	assert.Equal(t, "<a href=\"http://domain/org/repo/compare/783b039...da951ce\" class=\"compare\"><code class=\"nohighlight\">783b039...da951ce</code></a>", res.String())
}
