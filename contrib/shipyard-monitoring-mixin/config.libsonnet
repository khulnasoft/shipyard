{
  _config+:: {
    local c = self,
    dashboardNamePrefix: 'Shipyard',
    dashboardTags: ['shipyard'],
    dashboardPeriod: 'now-1h',
    dashboardTimezone: 'default',
    dashboardRefresh: '1m',

    // please see https://docs.shipyard.khulnasoft.com/administration/config-cheat-sheet#metrics-metrics
    // Show issue by repository metrics with format shipyard_issues_by_repository{repository="org/repo"} 5.
    // Requires Shipyard 1.16.0 with ENABLED_ISSUE_BY_REPOSITORY set to true.
    showIssuesByRepository: true,
    // Show graphs for issue by label metrics with format shipyard_issues_by_label{label="bug"} 2.
    // Requires Shipyard 1.16.0 with ENABLED_ISSUE_BY_LABEL set to true.
    showIssuesByLabel: true,

    // Requires Shipyard 1.16.0.
    showIssuesOpenClose: true,

    // add or remove metrics from dashboard
    shipyardStatMetrics:
      [
        {
          name: 'shipyard_organizations',
          description: 'Organizations',
        },
        {
          name: 'shipyard_teams',
          description: 'Teams',
        },
        {
          name: 'shipyard_users',
          description: 'Users',
        },
        {
          name: 'shipyard_repositories',
          description: 'Repositories',
        },
        {
          name: 'shipyard_milestones',
          description: 'Milestones',
        },
        {
          name: 'shipyard_stars',
          description: 'Stars',
        },
        {
          name: 'shipyard_releases',
          description: 'Releases',
        },
      ]
      +
      if c.showIssuesOpenClose then
        [
          {
            name: 'shipyard_issues_open',
            description: 'Issues opened',
          },
          {
            name: 'shipyard_issues_closed',
            description: 'Issues closed',
          },
        ] else
        [
          {
            name: 'shipyard_issues',
            description: 'Issues',
          },
        ],
    //set this for using label colors on graphs
    issueLabels: [
      {
        label: 'bug',
        color: '#ee0701',
      },
      {
        label: 'duplicate',
        color: '#cccccc',
      },
      {
        label: 'invalid',
        color: '#e6e6e6',
      },
      {
        label: 'enhancement',
        color: '#84b6eb',
      },
      {
        label: 'help wanted',
        color: '#128a0c',
      },
      {
        label: 'question',
        color: '#cc317c',
      },
    ],
  },
}
