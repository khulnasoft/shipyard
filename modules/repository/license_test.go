// Copyright 2023 The Shipyard Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package repository

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_getLicense(t *testing.T) {
	type args struct {
		name   string
		values *LicenseValues
	}
	tests := []struct {
		name    string
		args    args
		want    string
		wantErr assert.ErrorAssertionFunc
	}{
		{
			name: "regular",
			args: args{
				name:   "MIT",
				values: &LicenseValues{Owner: "Shipyard", Year: "2023"},
			},
			want: `MIT License

Copyright (c) 2023 Shipyard

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`,
			wantErr: assert.NoError,
		},
		{
			name: "license not found",
			args: args{
				name: "notfound",
			},
			wantErr: assert.Error,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := GetLicense(tt.args.name, tt.args.values)
			if !tt.wantErr(t, err, fmt.Sprintf("GetLicense(%v, %v)", tt.args.name, tt.args.values)) {
				return
			}
			assert.Equalf(t, tt.want, string(got), "GetLicense(%v, %v)", tt.args.name, tt.args.values)
		})
	}
}

func Test_fillLicensePlaceholder(t *testing.T) {
	type args struct {
		name   string
		values *LicenseValues
		origin string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "owner",
			args: args{
				name:   "regular",
				values: &LicenseValues{Year: "2023", Owner: "Shipyard", Email: "teabot@shipyard.io", Repo: "shipyard"},
				origin: `
<name of author>
<owner>
[NAME]
[name of copyright owner]
[name of copyright holder]
<COPYRIGHT HOLDERS>
<copyright holders>
<AUTHOR>
<author's name or designee>
[one or more legally recognised persons or entities offering the Work under the terms and conditions of this Licence]
`,
			},
			want: `
Shipyard
Shipyard
Shipyard
Shipyard
Shipyard
Shipyard
Shipyard
Shipyard
Shipyard
Shipyard
`,
		},
		{
			name: "email",
			args: args{
				name:   "regular",
				values: &LicenseValues{Year: "2023", Owner: "Shipyard", Email: "teabot@shipyard.io", Repo: "shipyard"},
				origin: `
[EMAIL]
`,
			},
			want: `
teabot@shipyard.io
`,
		},
		{
			name: "repo",
			args: args{
				name:   "regular",
				values: &LicenseValues{Year: "2023", Owner: "Shipyard", Email: "teabot@shipyard.io", Repo: "shipyard"},
				origin: `
<program>
<one line to give the program's name and a brief idea of what it does.>
`,
			},
			want: `
shipyard
shipyard
`,
		},
		{
			name: "year",
			args: args{
				name:   "regular",
				values: &LicenseValues{Year: "2023", Owner: "Shipyard", Email: "teabot@shipyard.io", Repo: "shipyard"},
				origin: `
<year>
[YEAR]
{YEAR}
[yyyy]
[Year]
[year]
`,
			},
			want: `
2023
2023
2023
2023
2023
2023
`,
		},
		{
			name: "0BSD",
			args: args{
				name:   "0BSD",
				values: &LicenseValues{Year: "2023", Owner: "Shipyard", Email: "teabot@shipyard.io", Repo: "shipyard"},
				origin: `
Copyright (C) YEAR by AUTHOR EMAIL

...

... THE AUTHOR BE LIABLE FOR ...
`,
			},
			want: `
Copyright (C) 2023 by Shipyard teabot@shipyard.io

...

... THE AUTHOR BE LIABLE FOR ...
`,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equalf(t, tt.want, string(fillLicensePlaceholder(tt.args.name, tt.args.values, []byte(tt.args.origin))), "fillLicensePlaceholder(%v, %v, %v)", tt.args.name, tt.args.values, tt.args.origin)
		})
	}
}
