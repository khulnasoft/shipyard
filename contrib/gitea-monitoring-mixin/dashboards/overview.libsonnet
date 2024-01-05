local grafana = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local prometheus = grafana.prometheus;

local addIssueLabelsOverrides(labels) =
  {
    fieldConfig+: {
      overrides+: [
        {
          matcher: {
            id: 'byRegexp',
            options: label.label,
          },
          properties: [
            {
              id: 'color',
              value: {
                fixedColor: label.color,
                mode: 'fixed',
              },
            },
          ],
        }
        for label in labels
      ],
    },
  };

{

  grafanaDashboards+:: {

    local shipyardSelector = 'job=~"$job", instance=~"$instance"',
    local shipyardStatsPanel =
      grafana.statPanel.new(
        'Shipyard stats',
        datasource='$datasource',
        reducerFunction='lastNotNull',
        graphMode='none',
        colorMode='value',
      )
      .addTargets(
        [
          prometheus.target(expr='%s{%s}' % [metric.name, shipyardSelector], legendFormat=metric.description, intervalFactor=10)
          for metric in $._config.shipyardStatMetrics
        ]
      )
      + {
        fieldConfig+: {
          defaults+: {
            color: {
              fixedColor: 'blue',
              mode: 'fixed',
            },
          },
        },
      },

    local shipyardUptimePanel =
      grafana.statPanel.new(
        'Uptime',
        datasource='$datasource',
        reducerFunction='last',
        graphMode='area',
        colorMode='value',
      )
      .addTarget(prometheus.target(expr='time()-process_start_time_seconds{%s}' % shipyardSelector, intervalFactor=1))
      + {
        fieldConfig+: {
          defaults+: {
            color: {
              fixedColor: 'blue',
              mode: 'fixed',
            },
            unit: 's',
          },
        },
      },

    local shipyardMemoryPanel =
      grafana.graphPanel.new(
        'Memory usage',
        datasource='$datasource'
      )
      .addTarget(prometheus.target(expr='process_resident_memory_bytes{%s}' % shipyardSelector, intervalFactor=2))
      + {
        type: 'timeseries',
        options+: {
          tooltip: {
            mode: 'multi',
          },
          legend+: {
            displayMode: 'hidden',
          },
        },
        fieldConfig+: {
          defaults+: {
            custom+: {
              lineInterpolation: 'smooth',
              fillOpacity: 15,
            },
            color: {
              fixedColor: 'green',
              mode: 'fixed',
            },
            unit: 'decbytes',
          },
        },
      },

    local shipyardCpuPanel =
      grafana.graphPanel.new(
        'CPU usage',
        datasource='$datasource'
      )
      .addTarget(prometheus.target(expr='rate(process_cpu_seconds_total{%s}[$__rate_interval])*100' % shipyardSelector, intervalFactor=2))
      + {
        type: 'timeseries',
        options+: {
          tooltip: {
            mode: 'multi',
          },
          legend+: {
            displayMode: 'hidden',
          },
        },
        fieldConfig+: {
          defaults+: {
            custom+: {
              lineInterpolation: 'smooth',
              gradientMode: 'scheme',
              fillOpacity: 15,
              axisSoftMin: 0,
              axisSoftMax: 0,
            },
            color: {
              mode: 'continuous-GrYlRd',  // from green to red (100%)
            },
            unit: 'percent',
          },
          overrides: [
            {
              matcher: {
                id: 'byRegexp',
                options: '.+',
              },
              properties: [
                {
                  id: 'max',
                  value: 100,
                },
                {
                  id: 'min',
                  value: 0,
                },
              ],
            },
          ],
        },
      },

    local shipyardFileDescriptorsPanel =
      grafana.graphPanel.new(
        'File descriptors usage',
        datasource='$datasource',
      )
      .addTarget(prometheus.target(expr='process_open_fds{%s}' % shipyardSelector, intervalFactor=2))
      .addTarget(prometheus.target(expr='process_max_fds{%s}' % shipyardSelector, intervalFactor=2))
      .addSeriesOverride(
        {
          alias: '/process_max_fds.+/',
          color: '#F2495C',  // red
          dashes: true,
          fill: 0,
        },
      )
      + {
        type: 'timeseries',
        options+: {
          tooltip: {
            mode: 'multi',
          },
          legend+: {
            displayMode: 'hidden',
          },
        },
        fieldConfig+: {
          defaults+: {
            custom+: {
              lineInterpolation: 'smooth',
              gradientMode: 'scheme',
              fillOpacity: 0,
            },
            color: {
              fixedColor: 'green',
              mode: 'fixed',
            },
            unit: '',
          },
          overrides: [
            {
              matcher: {
                id: 'byFrameRefID',
                options: 'B',
              },
              properties: [
                {
                  id: 'custom.lineStyle',
                  value: {
                    fill: 'dash',
                    dash: [
                      10,
                      10,
                    ],
                  },
                },
                {
                  id: 'color',
                  value: {
                    mode: 'fixed',
                    fixedColor: 'red',
                  },
                },
              ],
            },
          ],
        },
      },

    local shipyardChangesPanelPrototype =
      grafana.graphPanel.new(
        '',
        datasource='$datasource',
        interval='$agg_interval',
        maxDataPoints=10000,
      )
      + {
        type: 'timeseries',
        options+: {
          tooltip: {
            mode: 'multi',
          },
          legend+: {
            calcs+: [
              'sum',
            ],
          },
        },
        fieldConfig+: {
          defaults+: {
            noValue: '0',
            custom+: {
              drawStyle: 'bars',
              barAlignment: -1,
              fillOpacity: 50,
              gradientMode: 'hue',
              pointSize: 1,
              lineWidth: 0,
              stacking: {
                group: 'A',
                mode: 'normal',
              },
            },
          },
        },
      },

    local shipyardChangesPanelAll =
      shipyardChangesPanelPrototype
      .addTarget(prometheus.target(expr='changes(process_start_time_seconds{%s}[$__interval]) > 0' % [shipyardSelector], legendFormat='Restarts', intervalFactor=1))
      .addTargets(
        [
          prometheus.target(expr='floor(delta(%s{%s}[$__interval])) > 0' % [metric.name, shipyardSelector], legendFormat=metric.description, intervalFactor=1)
          for metric in $._config.shipyardStatMetrics
        ]
      ) + { id: 200 },  // some unique number, beyond the maximum number of panels in the dashboard,

    local shipyardChangesPanelTotal =
      grafana.statPanel.new(
        'Changes',
        datasource='-- Dashboard --',
        reducerFunction='sum',
        graphMode='none',
        textMode='value_and_name',
        colorMode='value',
      )
      + {
        targets+: [
          {
            panelId: shipyardChangesPanelAll.id,
            refId: 'A',
          },
        ],
      }
      + {
        fieldConfig+: {
          defaults+: {
            color: {
              mode: 'palette-classic',
            },
          },
        },
      },

    local shipyardChangesByRepositories =
      shipyardChangesPanelPrototype
      .addTarget(prometheus.target(expr='floor(increase(shipyard_issues_by_repository{%s}[$__interval])) > 0' % [shipyardSelector], legendFormat='{{ repository }}', intervalFactor=1))
      + { id: 210 },  // some unique number, beyond the maximum number of panels in the dashboard,

    local shipyardChangesByRepositoriesTotal =
      grafana.statPanel.new(
        'Issues by repository',
        datasource='-- Dashboard --',
        reducerFunction='sum',
        graphMode='none',
        textMode='value_and_name',
        colorMode='value',
      )
      + {
        id: 211,
        targets+: [
          {
            panelId: shipyardChangesByRepositories.id,
            refId: 'A',
          },
        ],
      }
      + {
        fieldConfig+: {
          defaults+: {
            color: {
              mode: 'palette-classic',
            },
          },
        },
      },

    local shipyardChangesByLabel =
      shipyardChangesPanelPrototype
      .addTarget(prometheus.target(expr='floor(increase(shipyard_issues_by_label{%s}[$__interval])) > 0' % [shipyardSelector], legendFormat='{{ label }}', intervalFactor=1))
      + addIssueLabelsOverrides($._config.issueLabels)
      + { id: 220 },  // some unique number, beyond the maximum number of panels in the dashboard,

    local shipyardChangesByLabelTotal =
      grafana.statPanel.new(
        'Issues by labels',
        datasource='-- Dashboard --',
        reducerFunction='sum',
        graphMode='none',
        textMode='value_and_name',
        colorMode='value',
      )
      + addIssueLabelsOverrides($._config.issueLabels)
      + {
        id: 221,
        targets+: [
          {
            panelId: shipyardChangesByLabel.id,
            refId: 'A',
          },
        ],
      }
      + {
        fieldConfig+: {
          defaults+: {
            color: {
              mode: 'palette-classic',
            },
          },
        },
      },

    'shipyard-overview.json':
      grafana.dashboard.new(
        '%s Overview' % $._config.dashboardNamePrefix,
        time_from='%s' % $._config.dashboardPeriod,
        editable=false,
        tags=($._config.dashboardTags),
        timezone='%s' % $._config.dashboardTimezone,
        refresh='%s' % $._config.dashboardRefresh,
        graphTooltip='shared_crosshair',
        uid='shipyard-overview'
      )
      .addTemplate(
        {
          current: {
            text: 'Prometheus',
            value: 'Prometheus',
          },
          hide: 0,
          label: 'Data Source',
          name: 'datasource',
          options: [],
          query: 'prometheus',
          refresh: 1,
          regex: '',
          type: 'datasource',
        },
      )
      .addTemplate(
        {
          hide: 0,
          label: 'job',
          name: 'job',
          options: [],
          datasource: '$datasource',
          query: 'label_values(shipyard_organizations, job)',
          refresh: 1,
          regex: '',
          type: 'query',
          multi: true,
          allValue: '.+'
        },
      )
      .addTemplate(
        {
          hide: 0,
          label: 'instance',
          name: 'instance',
          options: [],
          datasource: '$datasource',
          query: 'label_values(shipyard_organizations{job="$job"}, instance)',
          refresh: 1,
          regex: '',
          type: 'query',
          multi: true,
          allValue: '.+'
        },
      )
      .addTemplate(
        {
          hide: 0,
          label: 'aggregation interval',
          name: 'agg_interval',
          auto_min: '1m',
          auto: true,
          query: '1m,10m,1h,1d,7d',
          type: 'interval',
        },
      )
      .addPanel(grafana.row.new(title='General'), gridPos={ x: 0, y: 0, w: 0, h: 0 },)
      .addPanel(shipyardStatsPanel, gridPos={ x: 0, y: 0, w: 16, h: 4 })
      .addPanel(shipyardUptimePanel, gridPos={ x: 16, y: 0, w: 8, h: 4 })
      .addPanel(shipyardMemoryPanel, gridPos={ x: 0, y: 4, w: 8, h: 6 })
      .addPanel(shipyardCpuPanel, gridPos={ x: 8, y: 4, w: 8, h: 6 })
      .addPanel(shipyardFileDescriptorsPanel, gridPos={ x: 16, y: 4, w: 8, h: 6 })
      .addPanel(grafana.row.new(title='Changes', collapse=false), gridPos={ x: 0, y: 10, w: 24, h: 8 })
      .addPanel(shipyardChangesPanelTotal, gridPos={ x: 0, y: 12, w: 6, h: 8 })
      +  // use patching instead of .addPanel() to keep static ids
      {
        panels+: std.flattenArrays([
          [
            shipyardChangesPanelAll { gridPos: { x: 6, y: 12, w: 18, h: 8 } },
          ],
          if $._config.showIssuesByRepository then
            [
              shipyardChangesByRepositoriesTotal { gridPos: { x: 0, y: 20, w: 6, h: 8 } },
              shipyardChangesByRepositories { gridPos: { x: 6, y: 20, w: 18, h: 8 } },
            ] else [],
          if $._config.showIssuesByLabel then
            [
              shipyardChangesByLabelTotal { gridPos: { x: 0, y: 28, w: 6, h: 8 } },
              shipyardChangesByLabel { gridPos: { x: 6, y: 28, w: 18, h: 8 } },
            ] else [],
        ]),
      },
  },
}
