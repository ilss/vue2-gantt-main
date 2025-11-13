<template>
  <div class="gantt-container">
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
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'

export default {
  name: 'DhtmlGantt',
  data() {
    return {
      zoomLevel: 1,
      initialZoomLevel: 1, // 保存初始缩放级别
      minDate: null,
      maxDate: null,
    }
  },
  mounted() {
    this.initGantt()
  },
  beforeDestroy() {
    if (gantt) {
      gantt.destructor()
    }
  },
  methods: {
    initGantt() {
      // 配置甘特图
      gantt.config.date_format = '%Y-%m-%d'
      gantt.config.columns = [
        {
          name: 'text',
          label: '任务',
          width: 250,
          tree: true,
          template: (task) => {
            let html = task.text
            if (task.assignee) {
              html += ` <span class="assignee-text">${task.assignee}</span>`
            }
            return html
          },
        },
        {
          name: 'duration',
          label: '工时',
          width: 100,
          align: 'center',
          template: (task) => {
            return task.durationText || task.duration + '天'
          },
        },
      ]

      // 启用任务折叠功能
      gantt.config.open_tree_initially = true

      // 配置时间轴
      gantt.config.scale_unit = 'day'
      gantt.config.date_scale = '%m月%d日'
      gantt.config.subscales = [{ unit: 'day', step: 1, date: '%d' }]

      // 配置最小列宽，用于缩放（初始值，会在 setInitialZoom 中调整）
      gantt.config.min_column_width = 60

      // 配置任务条样式
      gantt.config.task_height = 30
      gantt.config.row_height = 40

      // 禁用拖动功能
      // gantt.config.drag_move = false
      // gantt.config.drag_resize = false
      // gantt.config.drag_links = false

      // 禁用编辑功能
      gantt.config.readonly = true

      // 自定义任务条模板
      gantt.templates.task_class = (start, end, task) => {
        return task.color || ''
      }

      // 自定义进度条显示
      gantt.templates.progress_text = (start, end, task) => {
        return Math.round(task.progress * 100) + '%'
      }

      // 自定义任务条内容
      gantt.templates.task_text = (start, end, task) => {
        return ''
      }

      // 初始化甘特图
      gantt.init(this.$refs.ganttContainer)

      // 加载数据
      const ganttData = this.getGanttData()
      gantt.parse(ganttData)

      // 等待 DOM 更新后计算时间范围并设置初始缩放
      this.$nextTick(() => {
        this.calculateTimeRange()
        this.setInitialZoom()

        // 添加里程碑标记
        this.addMilestone()
      })
    },

    calculateTimeRange() {
      // 从数据中计算时间范围
      const data = this.getGanttData()
      const dates = []

      data.data.forEach((task) => {
        if (task.start_date) {
          const startDate = gantt.date.str_to_date(task.start_date)
          dates.push(startDate)

          // 计算结束日期（duration 是天数）
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + (task.duration || 0))
          dates.push(endDate)
        }
      })

      if (dates.length > 0) {
        // 找到最早和最晚的日期
        this.minDate = new Date(Math.min(...dates))
        this.maxDate = new Date(Math.max(...dates))

        // 添加一些边距（前后各加几天）
        const paddingDays = 2
        this.minDate.setDate(this.minDate.getDate() - paddingDays)
        this.maxDate.setDate(this.maxDate.getDate() + paddingDays)
      }
    },

    setInitialZoom() {
      if (!this.minDate || !this.maxDate) {
        return
      }

      // 计算总天数
      const totalDays = Math.ceil(
        (this.maxDate - this.minDate) / (1000 * 60 * 60 * 24)
      )

      // 获取容器宽度（减去左侧列宽度）
      // 使用 setTimeout 确保容器已经渲染完成
      setTimeout(() => {
        // 获取甘特图容器的实际宽度
        const ganttContainer = this.$refs.ganttContainer
        let containerWidth = window.innerWidth

        if (ganttContainer) {
          // 尝试获取容器的实际宽度
          const rect = ganttContainer.getBoundingClientRect()
          containerWidth = rect.width || window.innerWidth
        }

        const leftColumnWidth = 350 // 任务列 + 工时列
        const availableWidth = Math.max(containerWidth - leftColumnWidth, 400) // 确保最小宽度

        // 计算合适的列宽，使所有数据都能显示
        // 使用更小的基础列宽，确保能够完全显示
        const idealColumnWidth = availableWidth / totalDays
        const baseColumnWidth = 60 // 使用更小的基础列宽

        // 计算初始缩放级别，确保不超过可用宽度
        // 如果计算出的缩放级别太大，则缩小到合适的大小
        let calculatedZoom = idealColumnWidth / baseColumnWidth

        // 如果计算出的缩放级别会导致超出，则进一步缩小
        // 添加一个安全系数，确保有足够的空间（留出更多边距）
        const safetyFactor = 0.85 // 85% 的安全边距，确保完全显示
        calculatedZoom = calculatedZoom * safetyFactor

        // 限制在合理范围内，确保不会太小或太大
        this.zoomLevel = Math.max(0.3, Math.min(1.2, calculatedZoom))
        this.initialZoomLevel = this.zoomLevel // 保存初始缩放级别

        // 应用缩放
        this.applyZoom()
      }, 200) // 增加延迟时间，确保 DOM 完全渲染
    },

    applyZoom() {
      // 通过调整最小列宽来实现缩放
      // 使用更小的基础列宽，确保能够完全显示
      const baseColumnWidth = 60
      gantt.config.min_column_width = baseColumnWidth * this.zoomLevel

      // dhtmlxGantt 会自动根据数据设置时间范围
      // 重新渲染以应用新的列宽设置
      gantt.render()
    },

    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel = Math.min(2, this.zoomLevel + 0.25)
        this.applyZoom()
      }
    },

    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.25)
        this.applyZoom()
      }
    },

    resetZoom() {
      // 恢复到初始缩放级别
      this.zoomLevel = this.initialZoomLevel
      this.applyZoom()
    },

    getGanttData() {
      const data = {
        data: [
          {
            id: 1,
            text: '项目abc',
            start_date: '2021-03-14',
            duration: 36,
            durationText: '5周1天',
            progress: 0.5758,
            parent: 0,
            open: true,
          },
          {
            id: 2,
            text: '顺势而为',
            start_date: '2021-03-14',
            duration: 4,
            durationText: '4天',
            progress: 0.6675,
            parent: 1,
            open: true,
            color: 'pink',
          },
          {
            id: 3,
            text: '网络舆情监测',
            start_date: '2021-03-14',
            duration: 1,
            durationText: '1天',
            progress: 1,
            parent: 2,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 4,
            text: '产业分析',
            start_date: '2021-03-15',
            duration: 1,
            durationText: '1天',
            progress: 1,
            parent: 2,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 5,
            text: '政策分析',
            start_date: '2021-03-18',
            duration: 1,
            durationText: '1天',
            progress: 0.67,
            parent: 2,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 6,
            text: '消费者调研',
            start_date: '2021-03-19',
            duration: 1,
            durationText: '1天',
            progress: 0,
            parent: 2,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 7,
            text: '确定领域和业务模式',
            start_date: '2021-03-19',
            duration: 4,
            durationText: '4天',
            progress: 0.725,
            parent: 1,
            open: true,
            assignee: '李四',
            color: 'purple',
          },
          {
            id: 8,
            text: '市场需求分析',
            start_date: '2021-03-19',
            duration: 1,
            durationText: '1天',
            progress: 1,
            parent: 7,
            assignee: '李四',
            color: 'purple',
          },
          {
            id: 9,
            text: '当前具备的能力和资源',
            start_date: '2021-03-20',
            duration: 1,
            durationText: '1天',
            progress: 1,
            parent: 7,
            assignee: '李四',
            color: 'purple',
          },
          {
            id: 10,
            text: '利润空间分析',
            start_date: '2021-03-21',
            duration: 1,
            durationText: '1天',
            progress: 0.9,
            parent: 7,
            assignee: '李四',
            color: 'purple',
          },
          {
            id: 11,
            text: '可续性分析',
            start_date: '2021-03-22',
            duration: 1,
            durationText: '1天',
            progress: 0,
            parent: 7,
            assignee: '李四',
            color: 'purple',
          },
          {
            id: 12,
            text: '打造产品和服务',
            start_date: '2021-03-20',
            duration: 9,
            durationText: '1周2天',
            progress: 0.7,
            parent: 1,
            open: true,
            assignee: '王五',
            color: 'blue',
          },
          {
            id: 13,
            text: '确定目标市场',
            start_date: '2021-03-20',
            duration: 1,
            durationText: '1天',
            progress: 1,
            parent: 12,
            assignee: '王五',
            color: 'blue',
          },
          {
            id: 14,
            text: '定义产品特点',
            start_date: '2021-03-21',
            duration: 3,
            durationText: '3天',
            progress: 1,
            parent: 12,
            assignee: '王五',
            color: 'blue',
          },
          {
            id: 15,
            text: '设计流程和体验',
            start_date: '2021-03-26',
            duration: 1,
            durationText: '1天',
            progress: 0.9,
            parent: 12,
            assignee: '王五',
            color: 'blue',
          },
          {
            id: 16,
            text: '迭代和改进',
            start_date: '2021-03-27',
            duration: 1,
            durationText: '1天',
            progress: 0,
            parent: 12,
            assignee: '王五',
            color: 'blue',
          },
          {
            id: 17,
            text: '建立信誉体系',
            start_date: '2021-03-28',
            duration: 1,
            durationText: '1天',
            progress: 0,
            parent: 12,
            assignee: '王五',
            color: 'blue',
          },
          {
            id: 18,
            text: '制定市场营销策略',
            start_date: '2021-03-22',
            duration: 7,
            durationText: '1周',
            progress: 0.36,
            parent: 1,
            open: true,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 19,
            text: '确定目标市场',
            start_date: '2021-03-22',
            duration: 1,
            durationText: '1天',
            progress: 1,
            parent: 18,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 20,
            text: '分析竞争对手',
            start_date: '2021-03-25',
            duration: 1,
            durationText: '1天',
            progress: 0.8,
            parent: 18,
            assignee: '张三',
            color: 'pink',
          },
          {
            id: 21,
            text: '制定品牌宣传策略',
            start_date: '2021-03-26',
            duration: 1,
            durationText: '1天',
            progress: 0,
            parent: 18,
            assignee: '张三',
            color: 'pink',
          },
        ],
        links: [],
      }

      return data
    },

    addMilestone() {
      // 添加里程碑标记线（2021-03-21）
      const milestoneDate = gantt.date.str_to_date('2021-03-21')
      const milestoneConfig = {
        date: milestoneDate,
        css: 'milestone-line',
        text: '里程碑1',
      }

      // 使用自定义标记
      gantt.addMarker(milestoneConfig)
    },
  },
}
</script>

<style scoped>
.gantt-container {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
}

.gantt-header {
  margin-bottom: 20px;
}

.gantt-header h2 {
  margin: 0;
  color: #2c3e50;
}

.gantt-chart {
  width: 100%;
  height: calc(100vh - 60px);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
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

/* 自定义任务条颜色 */
::v-deep .gantt_task_line.pink {
  background-color: #ffb3d9;
  border-color: #ffb3d9;
}

::v-deep .gantt_task_line.purple {
  background-color: #b19cd9;
  border-color: #b19cd9;
}

::v-deep .gantt_task_line.blue {
  background-color: #87ceeb;
  border-color: #87ceeb;
}

/* 里程碑样式 */
::v-deep .milestone-line {
  background-color: red;
  width: 2px;
  z-index: 10;
}

::v-deep .milestone-line::before {
  content: '里程碑1';
  position: absolute;
  top: -20px;
  left: -30px;
  color: red;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
}

/* 任务条进度样式 */
::v-deep .gantt_task_progress {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 折叠图标样式 */
::v-deep .gantt_tree_icon {
  cursor: pointer;
}

/* 表格样式优化 */
::v-deep .gantt_grid_scale,
::v-deep .gantt_grid_head_cell {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

::v-deep .gantt_cell {
  border-right: 1px solid #e0e0e0;
}

::v-deep .gantt_row {
  border-bottom: 1px solid #e0e0e0;
}

/* 任务名称和工时列样式 */
::v-deep .gantt_tree_content {
  padding-left: 10px;
}

/* 分配人员显示 */
::v-deep .assignee-text {
  margin-left: 8px;
  color: #666;
  font-size: 12px;
  font-weight: normal;
}
</style>
