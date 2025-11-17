<template>
  <div class="highcharts-gantt">
    <div class="gantt-toolbar">
      <label class="toolbar-label">时间粒度</label>
      <select v-model="currentView" @change="applyView">
        <option v-for="option in viewOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <button class="toolbar-btn" @click="collapseAll">全部折叠</button>
      <button class="toolbar-btn" @click="expandAll">全部展开</button>
    </div>
    <div ref="chartContainer" class="gantt-chart"></div>
  </div>
</template>

<script>
import Highcharts from 'highcharts'
import GanttModule from 'highcharts/modules/gantt'
import ExportingModule from 'highcharts/modules/exporting'
import AccessibilityModule from 'highcharts/modules/accessibility'

GanttModule(Highcharts)
ExportingModule(Highcharts)
AccessibilityModule(Highcharts)

const VIEW_OPTIONS = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]

const SAMPLE_TASKS = [
  {
    id: 'project',
    name: 'Project #1',
    start: Date.UTC(2025, 3, 1),
    end: Date.UTC(2025, 3, 14),
    collapsed: false,
    color: '#1abc9c',
  },
  {
    id: 'task-1',
    parent: 'project',
    name: 'Task #1',
    start: Date.UTC(2025, 3, 2),
    end: Date.UTC(2025, 3, 7),
    color: '#4b7bf5',
  },
  {
    id: 'task-2',
    parent: 'project',
    name: 'Task #2',
    start: Date.UTC(2025, 3, 3),
    end: Date.UTC(2025, 3, 12),
    color: '#4b7bf5',
  },
  {
    id: 'stage-1',
    parent: 'task-2',
    name: 'Stage #1',
    start: Date.UTC(2025, 3, 3),
    end: Date.UTC(2025, 3, 5),
    color: '#4b7bf5',
  },
  {
    id: 'stage-2',
    parent: 'task-2',
    name: 'Stage #2',
    start: Date.UTC(2025, 3, 5),
    end: Date.UTC(2025, 3, 7),
    dependency: 'stage-1',
    color: '#4b7bf5',
  },
  {
    id: 'stage-3',
    parent: 'task-2',
    name: 'Stage #3',
    start: Date.UTC(2025, 3, 7),
    end: Date.UTC(2025, 3, 9),
    dependency: 'stage-2',
    color: '#4b7bf5',
  },
  {
    id: 'stage-4',
    parent: 'task-2',
    name: 'Stage #4',
    start: Date.UTC(2025, 3, 9),
    end: Date.UTC(2025, 3, 12),
    dependency: 'stage-3',
    color: '#4b7bf5',
  },
  {
    id: 'task-3',
    parent: 'project',
    name: 'Task #3',
    start: Date.UTC(2025, 3, 2),
    end: Date.UTC(2025, 3, 9),
    color: '#4b7bf5',
  },
  {
    id: 'task-4',
    parent: 'project',
    name: 'Task #4',
    start: Date.UTC(2025, 3, 3),
    end: Date.UTC(2025, 3, 13),
    color: '#4b7bf5',
  },
  {
    id: 'task-4-stage-1',
    parent: 'task-4',
    name: 'Stage #1',
    start: Date.UTC(2025, 3, 3),
    end: Date.UTC(2025, 3, 7),
    color: '#a4d4ae',
  },
  {
    id: 'task-4-stage-2',
    parent: 'task-4',
    name: 'Stage #2',
    start: Date.UTC(2025, 3, 8),
    end: Date.UTC(2025, 3, 13),
    dependency: 'task-4-stage-1',
    color: '#a4d4ae',
  },
  {
    id: 'milestone',
    parent: null,
    name: 'Final milestone',
    start: Date.UTC(2025, 3, 14),
    end: Date.UTC(2025, 3, 14),
    milestone: true,
    color: '#be4bd2',
    marker: {
      symbol:
        'M 0 6 L 6 0 L 12 6 L 6 12 Z', // diamond
      radius: 6,
      lineWidth: 0,
      fillColor: '#be4bd2',
    },
  },
]

const buildTaskCopy = (desiredCollapse) => {
  const hasChildren = {}
  SAMPLE_TASKS.forEach((task) => {
    if (task.parent) {
      hasChildren[task.parent] = true
    }
  })

  return SAMPLE_TASKS.map((task) => {
    const copy = { ...task }
    if (hasChildren[task.id] !== undefined) {
      copy.collapsed = desiredCollapse
    }
    return copy
  })
}

export default {
  name: 'HighchartsGanttDemo',
  data() {
    return {
      chart: null,
      currentView: VIEW_OPTIONS[1].value,
      viewOptions: VIEW_OPTIONS,
    }
  },
  mounted() {
    this.renderChart()
  },
  beforeDestroy() {
    this.destroyChart()
  },
  methods: {
    renderChart() {
      this.destroyChart()
      this.chart = Highcharts.ganttChart(this.$refs.chartContainer, {
        chart: {
          spacing: [10, 10, 10, 10],
        },
        title: {
          text: '',
        },
        tooltip: {
          pointFormatter() {
            const start = Highcharts.dateFormat('%Y-%m-%d', this.start)
            const end = Highcharts.dateFormat('%Y-%m-%d', this.end)
            return `
              <span style="font-size: 11px;">${this.name}</span><br/>
              <span style="color:${this.color}">●</span> 开始：<b>${start}</b><br/>
              <span style="color:${this.color}">●</span> 结束：<b>${end}</b>
            `
          },
        },
        yAxis: {
          type: 'treegrid',
          grid: {
            enabled: true,
          },
          title: {
            text: '任务名称',
            style: {
              fontSize: '13px',
            },
          },
          min: 0,
          scrollbar: {
            enabled: false,
          },
        },
        xAxis: {
          currentDateIndicator: true,
          min: Date.UTC(2025, 2, 31),
          max: Date.UTC(2025, 3, 21),
          grid: {
            enabled: true,
          },
          customLabelFormat: '%m月%e日',
          labels: {
            formatter() {
              const format =
                this.axis.options.customLabelFormat || '%m月%e日'
              return Highcharts.dateFormat(format, this.value)
            },
          },
        },
        navigator: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        series: [
          {
            name: 'Tasks',
            data: buildTaskCopy(false),
            dataLabels: {
              enabled: false,
            },
            tooltip: {
              pointFormat: '{point.name}',
            },
          },
        ],
        plotOptions: {
          series: {
            animation: false,
          },
        },
        lang: {
          accessibility: {
            axis: {
              xAxisDescription: '时间轴',
              yAxisDescription: '任务树',
            },
          },
        },
      })

      this.applyView()
    },
    destroyChart() {
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
    },
    applyView() {
      if (!this.chart) return
      const unit = this.currentView
      const xAxis = this.chart.xAxis[0]
      if (!xAxis) return

      let tickInterval
      let labelFormat
      if (unit === 'day') {
        tickInterval = 24 * 36e5
        labelFormat = '%m月%e日'
      } else if (unit === 'week') {
        tickInterval = 7 * 24 * 36e5
        labelFormat = '%m月%e日'
      } else {
        tickInterval = 30 * 24 * 36e5
        labelFormat = '%Y年%m月'
      }

      xAxis.update(
        {
          tickInterval,
          customLabelFormat: labelFormat,
        },
        false
      )

      this.chart.redraw()
    },
    collapseAll() {
      if (!this.chart) return
      this.chart.series[0].setData(buildTaskCopy(true), false)
      this.chart.redraw()
    },
    expandAll() {
      if (!this.chart) return
      this.chart.series[0].setData(buildTaskCopy(false), false)
      this.chart.redraw()
    },
  },
}
</script>

<style scoped>
.highcharts-gantt {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.gantt-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-label {
  font-size: 13px;
  color: #666;
}

.gantt-toolbar select,
.toolbar-btn {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.toolbar-btn:hover,
.gantt-toolbar select:focus {
  border-color: #4b7bf5;
  color: #4b7bf5;
  outline: none;
}

.gantt-chart {
  height: calc(100vh - 150px);
  min-height: 400px;
}
</style>
