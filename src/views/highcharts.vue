<template>
  <div class="highcharts-gantt-wrapper">
    <div class="zoom-controls">
      <button @click="zoomOut" :disabled="zoomLevel <= 0.5" class="zoom-btn">
        −
      </button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <button @click="zoomIn" :disabled="zoomLevel >= 2" class="zoom-btn">
        +
      </button>
      <button @click="resetZoom" class="zoom-btn reset-btn">重置</button>
    </div>

    <div ref="ganttContainer" class="gantt-chart"></div>
  </div>
</template>

<script>
import Highcharts from 'highcharts'
import Gantt from 'highcharts/modules/gantt'

// 启用 Gantt 模块
Gantt(Highcharts)

export default {
  name: 'HighchartsGantt',
  data() {
    return {
      chart: null,
      zoomLevel: 1,
      collapsedTasks: new Set(), // 存储折叠的任务ID
      baseTimeSection: ['2021/03/14', '2021/04/01'],
      taskData: [
        {
          id: 'project',
          name: '项目abc',
          duration: '5周1天',
          progress: 57.58,
          assignee: '',
          level: 0,
          children: [
            {
              id: 'task1',
              name: '顺势而为',
              duration: '4天',
              progress: 66.75,
              assignee: '',
              color: '#ffb3d9',
              level: 1,
              children: [
                {
                  id: 'task1-1',
                  name: '网络舆情监测',
                  duration: '1天',
                  progress: 100,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/14',
                  endDate: '2021/03/14',
                },
                {
                  id: 'task1-2',
                  name: '产业分析',
                  duration: '1天',
                  progress: 100,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/15',
                  endDate: '2021/03/15',
                },
                {
                  id: 'task1-3',
                  name: '政策分析',
                  duration: '1天',
                  progress: 67,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/18',
                  endDate: '2021/03/18',
                },
                {
                  id: 'task1-4',
                  name: '消费者调研',
                  duration: '1天',
                  progress: 0,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/19',
                  endDate: '2021/03/19',
                },
              ],
            },
            {
              id: 'task2',
              name: '确定领域和业务模式',
              duration: '4天',
              progress: 72.5,
              assignee: '李四',
              color: '#b19cd9',
              level: 1,
              children: [
                {
                  id: 'task2-1',
                  name: '市场需求分析',
                  duration: '1天',
                  progress: 100,
                  assignee: '李四',
                  color: '#b19cd9',
                  startDate: '2021/03/19',
                  endDate: '2021/03/19',
                },
                {
                  id: 'task2-2',
                  name: '当前具备的能力和资源',
                  duration: '1天',
                  progress: 100,
                  assignee: '李四',
                  color: '#b19cd9',
                  startDate: '2021/03/20',
                  endDate: '2021/03/20',
                },
                {
                  id: 'task2-3',
                  name: '利润空间分析',
                  duration: '1天',
                  progress: 90,
                  assignee: '李四',
                  color: '#b19cd9',
                  startDate: '2021/03/21',
                  endDate: '2021/03/21',
                },
                {
                  id: 'task2-4',
                  name: '可续性分析',
                  duration: '1天',
                  progress: 0,
                  assignee: '李四',
                  color: '#b19cd9',
                  startDate: '2021/03/22',
                  endDate: '2021/03/22',
                },
              ],
            },
            {
              id: 'task3',
              name: '打造产品和服务',
              duration: '1周2天',
              progress: 70,
              assignee: '王五',
              color: '#87ceeb',
              level: 1,
              children: [
                {
                  id: 'task3-1',
                  name: '确定目标市场',
                  duration: '1天',
                  progress: 100,
                  assignee: '王五',
                  color: '#87ceeb',
                  startDate: '2021/03/20',
                  endDate: '2021/03/20',
                },
                {
                  id: 'task3-2',
                  name: '定义产品特点',
                  duration: '3天',
                  progress: 100,
                  assignee: '王五',
                  color: '#87ceeb',
                  startDate: '2021/03/21',
                  endDate: '2021/03/25',
                },
                {
                  id: 'task3-3',
                  name: '设计流程和体验',
                  duration: '1天',
                  progress: 90,
                  assignee: '王五',
                  color: '#87ceeb',
                  startDate: '2021/03/26',
                  endDate: '2021/03/26',
                },
                {
                  id: 'task3-4',
                  name: '迭代和改进',
                  duration: '1天',
                  progress: 0,
                  assignee: '王五',
                  color: '#87ceeb',
                  startDate: '2021/03/27',
                  endDate: '2021/03/27',
                },
                {
                  id: 'task3-5',
                  name: '建立信誉体系',
                  duration: '1天',
                  progress: 0,
                  assignee: '王五',
                  color: '#87ceeb',
                  startDate: '2021/03/28',
                  endDate: '2021/03/28',
                },
              ],
            },
            {
              id: 'task4',
              name: '制定市场营销策略',
              duration: '1周',
              progress: 36,
              assignee: '张三',
              color: '#ffb3d9',
              level: 1,
              children: [
                {
                  id: 'task4-1',
                  name: '确定目标市场',
                  duration: '1天',
                  progress: 100,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/22',
                  endDate: '2021/03/22',
                },
                {
                  id: 'task4-2',
                  name: '分析竞争对手',
                  duration: '1天',
                  progress: 80,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/25',
                  endDate: '2021/03/25',
                },
                {
                  id: 'task4-3',
                  name: '制定品牌宣传策略',
                  duration: '1天',
                  progress: 0,
                  assignee: '张三',
                  color: '#ffb3d9',
                  startDate: '2021/03/26',
                  endDate: '2021/03/26',
                },
              ],
            },
          ],
        },
      ],
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (this.chart) {
      // 移除事件监听器
      if (this._clickHandler) {
        this.chart.container.removeEventListener('click', this._clickHandler)
      }
      this.chart.destroy()
      this.chart = null
    }
  },
  methods: {
    toggleTask(taskId) {
      // 切换任务的折叠状态
      const newSet = new Set(this.collapsedTasks)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      this.collapsedTasks = newSet
      // 重新初始化图表
      this.initChart()
    },
    getTaskLevel(taskId, flatData) {
      // 计算任务的层级深度
      let level = 0
      let currentTask = flatData.find((t) => t.id === taskId)

      while (currentTask && currentTask.parent) {
        level++
        currentTask = flatData.find((t) => t.id === currentTask.parent)
      }

      return level
    },
    hasTaskChildren(taskId) {
      // 检查任务是否有子任务（在原始数据中检查）
      const checkTask = (tasks) => {
        for (const task of tasks) {
          if (task.id === taskId) {
            return task.children && task.children.length > 0
          }
          if (task.children && task.children.length > 0) {
            const found = checkTask(task.children)
            if (found !== null) return found
          }
        }
        return null
      }
      return checkTask(this.taskData) || false
    },
    initChart() {
      // 先销毁旧图表和事件监听器
      if (this.chart) {
        if (this._clickHandler) {
          this.chart.container.removeEventListener('click', this._clickHandler)
          this._clickHandler = null
        }
        this.chart.destroy()
        this.chart = null
      }

      const flatData = this.flattenTasks()
      const categories = flatData.map((task) => task.name)
      const collapsedTasks = this.collapsedTasks // 保存引用以便在闭包中使用
      const vueInstance = this // 保存 Vue 实例引用

      this.chart = Highcharts.ganttChart(this.$refs.ganttContainer, {
        title: {
          text: '',
        },
        xAxis: {
          min: this.getZoomedMinDate(),
          max: this.getZoomedMaxDate(),
          currentDateIndicator: {
            enabled: true,
            color: '#ff0000',
            label: {
              format: '{text}',
              style: {
                color: '#ff0000',
              },
            },
          },
          plotLines: [
            {
              value: Date.UTC(2021, 2, 21), // 2021-03-21 里程碑
              color: '#ff0000',
              width: 2,
              label: {
                text: '里程碑1',
                style: {
                  color: '#ff0000',
                  fontWeight: 'bold',
                },
                align: 'right',
                x: -5,
              },
            },
          ],
        },
        yAxis: {
          type: 'category',
          grid: {
            enabled: true,
          },
          uniqueNames: true,
          categories: categories,
          labels: {
            align: 'left',
            formatter: function () {
              const task = flatData[this.pos]
              if (!task) return this.value

              // 检查是否有子任务（从原始数据中检查，而不是从 flatData）
              const hasChildren = vueInstance.hasTaskChildren(task.id)
              const isCollapsed = collapsedTasks.has(task.id)

              // 计算层级深度
              let level = 0
              let currentTask = task
              while (currentTask && currentTask.parent) {
                level++
                currentTask = flatData.find((t) => t.id === currentTask.parent)
              }

              // 添加缩进和折叠图标
              const indent = '  '.repeat(level)
              let icon = ''

              // 如果有子任务，添加折叠图标
              if (hasChildren) {
                icon = isCollapsed ? '▶' : '▼'
              } else {
                icon = '  '
              }

              return icon + indent + this.value
            },
            useHTML: true,
            style: {
              cursor: 'pointer',
              textAlign: 'left',
            },
          },
        },
        tooltip: {
          pointFormatter: function () {
            const point = this
            const progress = point.completed ? point.completed.amount : 0
            const assignee = point.assignee || '未分配'
            const startDate = Highcharts.dateFormat('%Y-%m-%d', point.start)
            const endDate = Highcharts.dateFormat('%Y-%m-%d', point.end)

            return (
              `<span style="font-size: 10px">${point.name}</span><br/>` +
              `<span style="color:${point.color}">●</span> 进度: <b>${progress}%</b><br/>` +
              `<span style="color:${point.color}">●</span> 负责人: <b>${assignee}</b><br/>` +
              `<span style="color:${point.color}">●</span> 开始: <b>${startDate}</b><br/>` +
              `<span style="color:${point.color}">●</span> 结束: <b>${endDate}</b>`
            )
          },
        },
        series: [
          {
            name: '任务',
            data: flatData,
            // 确保进度条显示
            point: {
              events: {},
            },
          },
        ],
        plotOptions: {
          gantt: {
            dataLabels: {
              enabled: true,
              formatter: function () {
                const progress = this.point.completed
                  ? this.point.completed.amount
                  : 0
                return progress + '%'
              },
              style: {
                color: '#fff',
                textOutline: '1px contrast',
                fontWeight: 'bold',
                fontSize: '11px',
              },
            },
          },
        },
        credits: {
          enabled: false,
        },
        lang: {
          noData: '暂无数据',
        },
      })

      // 添加点击事件处理 - 点击 Y 轴标签时折叠/展开任务
      const chartInstance = this.chart

      // 使用原生 DOM 事件监听器
      const clickHandler = (e) => {
        const yAxis = chartInstance.yAxis[0]
        if (!yAxis || !yAxis.labelGroup) return

        // 获取点击位置
        const rect = chartInstance.container.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        // 检查是否点击在 Y 轴标签区域（左侧）
        if (clickX < chartInstance.plotLeft && clickX > 0) {
          // 计算点击的是哪个标签（通过 Y 坐标）
          // 减去 plotTop 得到相对于图表绘图区域的 Y 坐标
          const plotY = clickY - chartInstance.plotTop
          const labelHeight = chartInstance.plotHeight / categories.length
          const clickedIndex = Math.floor(plotY / labelHeight)

          if (clickedIndex >= 0 && clickedIndex < flatData.length) {
            const task = flatData[clickedIndex]
            if (task) {
              // 检查任务是否有子任务（在原始数据中检查）
              const hasChildren = vueInstance.hasTaskChildren(task.id)
              if (hasChildren) {
                vueInstance.toggleTask(task.id)
              }
            }
          }
        }
      }

      // 绑定点击事件
      chartInstance.container.addEventListener('click', clickHandler)

      // 保存事件处理器以便后续清理
      this._clickHandler = clickHandler
    },
    flattenTasks() {
      const result = []
      let yIndex = 0 // Y 轴索引，用于确保每个任务在不同行

      // 递归构建扁平化的任务数据
      const processTask = (task, parentId = null, parentCollapsed = false) => {
        const hasChildren = task.children && task.children.length > 0
        const isCollapsed = this.collapsedTasks.has(task.id)
        const shouldShow = !parentCollapsed // 如果父级折叠了，不显示子任务

        // 如果是父任务，需要计算时间范围
        if (hasChildren) {
          const allDates = []
          const collectDates = (children) => {
            children.forEach((child) => {
              if (child.startDate && child.endDate) {
                allDates.push(new Date(child.startDate))
                allDates.push(new Date(child.endDate))
              }
              if (child.children && child.children.length > 0) {
                collectDates(child.children)
              }
            })
          }
          collectDates(task.children)

          if (allDates.length > 0) {
            const minDate = new Date(Math.min(...allDates))
            const maxDate = new Date(Math.max(...allDates))

            // 添加父任务（只有在应该显示时才添加）
            if (shouldShow) {
              result.push({
                name: task.name + (task.assignee ? ` (${task.assignee})` : ''),
                id: task.id,
                parent: parentId,
                y: yIndex++, // 为每个任务分配唯一的 Y 轴位置
                start: Date.UTC(
                  minDate.getFullYear(),
                  minDate.getMonth(),
                  minDate.getDate()
                ),
                end: Date.UTC(
                  maxDate.getFullYear(),
                  maxDate.getMonth(),
                  maxDate.getDate()
                ),
                completed: {
                  amount: task.progress || 0,
                },
                assignee: task.assignee || '',
                color: task.color || '#87ceeb',
                hasChildren: true,
              })

              // 递归处理子任务（只有在未折叠时才处理）
              if (!isCollapsed) {
                task.children.forEach((child) => {
                  processTask(child, task.id, false)
                })
              }
            }
          }
        } else if (task.startDate && task.endDate) {
          // 叶子节点（只有在应该显示时才添加）
          if (shouldShow) {
            const startDate = new Date(task.startDate)
            const endDate = new Date(task.endDate)

            result.push({
              name: task.name + (task.assignee ? ` (${task.assignee})` : ''),
              id: task.id,
              parent: parentId,
              y: yIndex++, // 为每个任务分配唯一的 Y 轴位置
              start: Date.UTC(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate()
              ),
              end: Date.UTC(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate()
              ),
              completed: {
                amount: task.progress || 0,
              },
              assignee: task.assignee || '',
              color: task.color || '#87ceeb',
              hasChildren: false,
            })
          }
        }
      }

      // 处理根任务
      this.taskData.forEach((task) => {
        processTask(task, null, false)
      })

      return result
    },
    getZoomedMinDate() {
      // 根据缩放级别计算最小日期
      const baseStart = Date.UTC(2021, 2, 14) // 2021-03-14
      const baseEnd = Date.UTC(2021, 3, 1) // 2021-04-01
      const baseRange = baseEnd - baseStart
      const center = baseStart + baseRange / 2
      const zoomedRange = baseRange / this.zoomLevel
      return center - zoomedRange / 2
    },
    getZoomedMaxDate() {
      // 根据缩放级别计算最大日期
      const baseStart = Date.UTC(2021, 2, 14) // 2021-03-14
      const baseEnd = Date.UTC(2021, 3, 1) // 2021-04-01
      const baseRange = baseEnd - baseStart
      const center = baseStart + baseRange / 2
      const zoomedRange = baseRange / this.zoomLevel
      return center + zoomedRange / 2
    },
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel = Math.min(2, this.zoomLevel + 0.25)
        // 重新初始化图表以应用缩放
        this.initChart()
      }
    },
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.25)
        // 重新初始化图表以应用缩放
        this.initChart()
      }
    },
    resetZoom() {
      this.zoomLevel = 1
      // 重新初始化图表以应用缩放
      this.initChart()
    },
  },
}
</script>

<style scoped>
.highcharts-gantt-wrapper {
  width: 100%;
  /* height: 100vh; */
  /* overflow: auto; */
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.zoom-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
  min-width: 36px;
}

.zoom-btn:hover:not(:disabled) {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  margin-left: 10px;
  font-size: 12px;
  font-weight: normal;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
  font-weight: bold;
  color: #666;
}

.gantt-chart {
  width: 100%;
  /* height: calc(100vh - 120px); */
  overflow: auto;
}

/* 确保 Y 轴标签左对齐 */
:deep(.highcharts-yaxis-labels text) {
  text-anchor: start !important;
}

:deep(.highcharts-yaxis-labels) {
  text-align: left !important;
  left: 10px !important;
}

/* 确保进度条可见 */
:deep(.highcharts-gantt-series .highcharts-point) {
  stroke-width: 0;
}

/* 进度条覆盖层样式 - 白色半透明，确保可见 */
:deep(.highcharts-gantt-series .highcharts-point-completed),
:deep(.highcharts-gantt-series path[fill-opacity]),
:deep(.highcharts-gantt-series .highcharts-point[fill-opacity]) {
  fill: rgba(255, 255, 255, 0.5) !important;
  fill-opacity: 0.5 !important;
  opacity: 1 !important;
  stroke: rgba(255, 255, 255, 0.6) !important;
  stroke-width: 1px !important;
  visibility: visible !important;
  display: block !important;
}

/* 确保所有进度相关的元素都可见 */
:deep(.highcharts-gantt-series .highcharts-point) {
  position: relative;
}

:deep(.highcharts-gantt-series .highcharts-point-completed) {
  pointer-events: none;
  z-index: 2;
}
</style>
