<template>
  <div class="gantt-container">
    <div class="gantt-wrapper">
      <!-- 左侧任务栏 -->
      <div class="task-sidebar" ref="taskSidebar">
        <div class="task-sidebar-header">
          <div class="task-header-cell">任务名称</div>
        </div>
        <div class="task-sidebar-body" ref="taskSidebarBody">
          <div
            v-for="task in flattenedTasks"
            :key="task.id"
            class="task-row"
            :style="{ height: barHeight + 'px' }"
          >
            <div
              class="task-cell"
              :style="{ paddingLeft: task.level * 20 + 10 + 'px' }"
            >
              <span
                v-if="task.hasChildren"
                class="collapse-icon"
                @click="toggleTask(task.id)"
              >
                {{ task.expanded ? '▼' : '▶' }}
              </span>
              <span v-else class="collapse-icon-placeholder"></span>
              <span class="task-name">{{ task.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧甘特图 -->
      <div class="gantt-chart-wrapper" ref="ganttChartWrapper">
        <div id="gantt_here" class="gantt-box" ref="ganttBox"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Gantt from 'frappe-gantt'

export default {
  name: 'FrappeGanttDemo',

  data() {
    return {
      gantt: null,
      currentZoomLevel: 2, // 当前缩放级别，0=Quarter Day, 1=Half Day, 2=Day, 3=Week, 4=Month
      zoomLevels: [
        { name: '小时级', mode: 'Quarter Day' },
        { name: '半天级', mode: 'Half Day' },
        { name: '天级', mode: 'Day' },
        { name: '周级', mode: 'Week' },
        { name: '月级', mode: 'Month' },
      ],
      tasks: [],
      taskLookup: null,
      taskNodeMap: null,
      taskTree: [], // 任务树结构
      flattenedTasks: [], // 扁平化的任务列表（用于显示）
      visibleTaskIds: [],
      expandedTasks: new Set(), // 展开的任务ID集合
      barHeight: 30, // 任务条高度，需要与 Frappe Gantt 的 bar_height 一致
      sidebarWidth: 250, // 左侧任务栏宽度
    }
  },

  mounted() {
    this.initGantt()
    this.setupMouseWheelZoom()
  },

  beforeDestroy() {
    if (this.gantt) {
      // 移除事件监听器
      const container = document.getElementById('gantt_here')
      if (container && this.handleWheel) {
        container.removeEventListener('wheel', this.handleWheel)
      }

      // 清理 MutationObserver
      if (this._dragObserver) {
        this._dragObserver.disconnect()
      }
    }
  },

  methods: {
    // 初始化甘特图
    initGantt() {
      // 转换数据格式
      const ganttData = {
        data: [
          {
            id: 11,
            text: 'Project #1',
            type: 'project',
            progress: 0,
            open: true,
            start_date: '02-04-2025 00:00',
            duration: 13,
            parent: 0,
          },
          {
            id: 12,
            text: 'Task #1',
            start_date: '03-04-2025 00:00',
            duration: 5,
            parent: '11',
            progress: 0,
            open: true,
          },
          {
            id: 13,
            text: 'Task #2',
            start_date: '03-04-2025 00:00',
            type: 'project',
            render: 'split',
            parent: '11',
            progress: 0.5,
            open: false,
            duration: 11,
          },
          {
            id: 17,
            text: 'Stage #1',
            start_date: '03-04-2025 00:00',
            duration: 1,
            parent: '13',
            progress: 0,
            open: true,
          },
          {
            id: 18,
            text: 'Stage #2',
            start_date: '05-04-2025 00:00',
            duration: 2,
            parent: '13',
            progress: 0,
            open: true,
          },
          {
            id: 19,
            text: 'Stage #3',
            start_date: '08-04-2025 00:00',
            duration: 1,
            parent: '13',
            progress: 0,
            open: true,
          },
          {
            id: 20,
            text: 'Stage #4',
            start_date: '10-04-2025 00:00',
            duration: 4,
            parent: '13',
            progress: 0,
            open: true,
          },
          {
            id: 14,
            text: 'Task #3',
            start_date: '02-04-2025 00:00',
            duration: 6,
            parent: '11',
            progress: 0,
            open: true,
          },
          {
            id: 15,
            text: 'Task #4',
            type: 'project',
            render: 'split',
            parent: '11',
            progress: 0,
            open: true,
            start_date: '03-04-2025 00:00',
            duration: 11,
          },
          {
            id: 21,
            text: 'Stage #1',
            start_date: '03-04-2025 00:00',
            duration: 4,
            parent: '15',
            progress: 0,
            open: true,
          },
          {
            id: 22,
            text: 'Stage #2',
            start_date: '08-04-2025 00:00',
            duration: 3,
            parent: '15',
            progress: 0,
            open: true,
          },
          {
            id: 23,
            text: 'Mediate milestone',
            start_date: '14-04-2025 00:00',
            duration: 0,
            type: 'milestone',
            parent: '15',
            progress: 0,
            open: true,
          },
          {
            id: 16,
            text: 'Final milestone',
            start_date: '15-04-2025 00:00',
            duration: 0,
            type: 'milestone',
            parent: '11',
            progress: 0,
            open: true,
          },
        ],
        links: [
          { id: '1', source: '17', target: '18', type: '0' },
          { id: '2', source: '18', target: '19', type: '0' },
          { id: '3', source: '19', target: '20', type: '0' },
          { id: '4', source: '21', target: '22', type: '0' },
          { id: '5', source: '22', target: '23', type: '0' },
        ],
      }

      // 构建任务树结构
      this.buildTaskTree(ganttData)

      // 转换为 Frappe Gantt 格式
      const { tasks, lookup } = this.convertToFrappeFormat(ganttData)
      this.tasks = tasks
      this.taskLookup = lookup

      // 生成初始可见任务
      this.flattenTasks()

      // 计算日期范围
      const dateRange = this.calculateDateRange(this.tasks)
      const initialTasks = this.getVisibleChartTasks()

      // 初始化 Frappe Gantt
      this.gantt = new Gantt('#gantt_here', initialTasks, {
        view_mode: this.zoomLevels[this.currentZoomLevel].mode,
        bar_height: this.barHeight,
        bar_corner_radius: 4,
        arrow_curve: 5,
        padding: 18,
        date_format: 'YYYY-MM-DD',
        custom_popup_html: (task) => {
          return this.getTooltipHtml(task)
        },
      })

      // 禁用拖拽（只读模式）
      this.disableDrag()

      // 设置日期范围
      if (dateRange.start && dateRange.end) {
        this.gantt.change_view_mode(this.zoomLevels[this.currentZoomLevel].mode)
      }

      // 设置同步滚动
      this.setupSyncScroll()

      // 等待甘特图渲染完成后，确保左侧列表与右侧对齐
      this.$nextTick(() => {
        setTimeout(() => {
          this.alignTaskRows()
        }, 300)
      })
    },

    // 构建任务树结构
    buildTaskTree(ganttData) {
      const taskMap = new Map()
      const rootTasks = []

      // 第一遍：创建所有任务节点
      ganttData.data.forEach((task) => {
        const taskNode = {
          id: String(task.id),
          name: task.text,
          type: task.type || 'task',
          parent: task.parent ? String(task.parent) : null,
          children: [],
          level: 0,
          expanded: task.open !== false, // 默认展开
        }
        taskMap.set(String(task.id), taskNode)
      })

      // 第二遍：构建树结构
      taskMap.forEach((taskNode) => {
        if (taskNode.parent && taskNode.parent !== '0') {
          const parent = taskMap.get(taskNode.parent)
          if (parent) {
            parent.children.push(taskNode)
            taskNode.level = parent.level + 1
          } else {
            rootTasks.push(taskNode)
          }
        } else {
          rootTasks.push(taskNode)
        }
      })

      // 计算所有节点的层级
      const calculateLevels = (nodes, level = 0) => {
        nodes.forEach((node) => {
          node.level = level
          if (node.children.length > 0) {
            calculateLevels(node.children, level + 1)
          }
        })
      }
      calculateLevels(rootTasks)

      this.taskTree = rootTasks
      this.taskNodeMap = taskMap
      this.expandedTasks = this.buildInitialExpandedSet(rootTasks)
    },

    buildInitialExpandedSet(nodes) {
      const expanded = new Set()
      const traverse = (list) => {
        list.forEach((node) => {
          const hasChildren = node.children && node.children.length > 0
          if (hasChildren && node.expanded !== false) {
            expanded.add(node.id)
          }
          if (hasChildren) {
            traverse(node.children)
          }
        })
      }
      traverse(nodes)
      return expanded
    },

    // 扁平化任务树（用于显示并同步可见任务）
    flattenTasks() {
      if (!this.taskTree || !this.taskTree.length) {
        this.flattenedTasks = []
        this.visibleTaskIds = []
        return
      }

      const flattened = []
      const visibleIds = []
      const traverse = (nodes, level = 0) => {
        nodes.forEach((node) => {
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = hasChildren
            ? this.expandedTasks.has(node.id)
            : false

          flattened.push({
            id: node.id,
            name: node.name,
            level,
            hasChildren,
            expanded: isExpanded,
            type: node.type,
          })

          visibleIds.push(node.id)

          if (hasChildren && isExpanded) {
            traverse(node.children, level + 1)
          }
        })
      }

      traverse(this.taskTree)

      this.flattenedTasks = flattened
      this.visibleTaskIds = visibleIds

      if (this.gantt) {
        this.refreshGanttTasks()
      }
    },

    // 切换任务展开/折叠
    toggleTask(taskId) {
      const node =
        (this.taskNodeMap && this.taskNodeMap.get(taskId)) || null
      if (!node || !node.children || node.children.length === 0) {
        return
      }

      const nextSet = new Set(this.expandedTasks)
      if (nextSet.has(taskId)) {
        nextSet.delete(taskId)
      } else {
        nextSet.add(taskId)
      }

      this.expandedTasks = nextSet
      this.flattenTasks()
    },

    // 设置同步滚动
    setupSyncScroll() {
      this.$nextTick(() => {
        setTimeout(() => {
          const taskSidebarBody = this.$refs.taskSidebarBody
          const ganttBox = this.$refs.ganttBox

          if (!taskSidebarBody || !ganttBox) return

          // 查找 Frappe Gantt 的滚动容器
          const ganttContainer = ganttBox.querySelector('.gantt-container')
          const ganttScrollContainer = ganttContainer || ganttBox

          let isScrolling = false

          // 左侧滚动时同步右侧
          taskSidebarBody.addEventListener('scroll', () => {
            if (!isScrolling) {
              isScrolling = true
              ganttScrollContainer.scrollTop = taskSidebarBody.scrollTop
              setTimeout(() => {
                isScrolling = false
              }, 10)
            }
          })

          // 右侧滚动时同步左侧
          ganttScrollContainer.addEventListener('scroll', () => {
            if (!isScrolling) {
              isScrolling = true
              taskSidebarBody.scrollTop = ganttScrollContainer.scrollTop
              setTimeout(() => {
                isScrolling = false
              }, 10)
            }
          })
        }, 500)
      })
    },

    // 转换数据格式为 Frappe Gantt 格式
    convertToFrappeFormat(ganttData) {
      const tasks = []
      const taskMap = Object.create(null)

      // 第一遍：创建所有任务
      ganttData.data.forEach((task) => {
        const startDate = this.parseDate(task.start_date)
        const endDate = task.duration
          ? this.addDays(startDate, task.duration)
          : startDate

        // 里程碑任务 duration 为 0，需要特殊处理
        // Frappe Gantt 需要 end 日期至少比 start 大一天
        const isMilestone = task.type === 'milestone' || task.duration === 0
        const finalEndDate = isMilestone ? this.addDays(startDate, 1) : endDate

        // 根据任务类型设置不同的样式类
        let customClass = ''
        if (task.type === 'milestone') {
          customClass = 'milestone'
        } else if (task.type === 'project') {
          customClass = 'project'
        }

        const frappeTask = {
          id: String(task.id),
          name: task.text,
          start: this.formatDateForFrappe(startDate),
          end: this.formatDateForFrappe(finalEndDate),
          progress: (task.progress || 0) * 100, // Frappe 使用 0-100
          dependencies: [],
          custom_class: customClass,
        }

        taskMap[frappeTask.id] = frappeTask
        tasks.push(frappeTask)
      })

      // 第二遍：处理依赖关系
      if (ganttData.links) {
        ganttData.links.forEach((link) => {
          const sourceTask = taskMap[String(link.source)]
          const targetTask = taskMap[String(link.target)]
          if (sourceTask && targetTask) {
            targetTask.dependencies.push(String(link.source))
          }
        })
      }

      return { tasks, lookup: taskMap }
    },

    // 解析日期字符串
    parseDate(dateStr) {
      // 支持格式: "02-04-2025 00:00" 或 "2025-04-02"
      if (!dateStr) return new Date()

      // 尝试解析 DD-MM-YYYY 格式
      const parts = dateStr.split(' ')
      const datePart = parts[0]
      const dateMatch = datePart.match(/(\d{2})-(\d{2})-(\d{4})/)

      if (dateMatch) {
        const day = parseInt(dateMatch[1], 10)
        const month = parseInt(dateMatch[2], 10) - 1 // 月份从 0 开始
        const year = parseInt(dateMatch[3], 10)
        return new Date(year, month, day)
      }

      // 尝试解析标准格式
      return new Date(dateStr)
    },

    // 添加天数
    addDays(date, days) {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    },

    // 格式化日期为 Frappe Gantt 格式 (YYYY-MM-DD)
    formatDateForFrappe(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 计算日期范围
    calculateDateRange(tasks) {
      if (!tasks || tasks.length === 0) {
        return { start: null, end: null }
      }

      let minDate = null
      let maxDate = null

      tasks.forEach((task) => {
        const start = new Date(task.start)
        const end = new Date(task.end)

        if (!minDate || start < minDate) {
          minDate = start
        }
        if (!maxDate || end > maxDate) {
          maxDate = end
        }
      })

      return { start: minDate, end: maxDate }
    },

    // 生成 Tooltip HTML
    getTooltipHtml(task) {
      // Frappe Gantt 的 task 对象包含 _start, _end, progress, name 等属性
      const startDate = task._start
        ? new Date(task._start)
        : new Date(task.start)
      const endDate = task._end ? new Date(task._end) : new Date(task.end)
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      const progress = task.progress || 0

      const formatDateTime = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
      }

      let html = `<div style="padding: 8px; min-width: 200px; color: #333;">`
      html += `<div style="font-weight: bold; margin-bottom: 6px; font-size: 14px; color: #537cfa;">${
        task.name || '未命名任务'
      }</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>开始时间:</b> ${formatDateTime(
        startDate
      )}</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>结束时间:</b> ${formatDateTime(
        endDate
      )}</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>持续时间:</b> ${duration} 天</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>进度:</b> ${progress.toFixed(
        1
      )}%</div>`

      if (task.custom_class === 'milestone') {
        html += `<div style="margin-bottom: 4px; color: #333;"><b>类型:</b> 里程碑</div>`
      }

      html += `</div>`
      return html
    },

    // 禁用拖拽功能（只读模式）
    disableDrag() {
      this.$nextTick(() => {
        const container = document.getElementById('gantt_here')
        if (container) {
          // 禁用所有 bar 的拖拽
          const bars = container.querySelectorAll('.bar-wrapper, .bar')
          bars.forEach((bar) => {
            bar.style.pointerEvents = 'none'
            bar.style.cursor = 'default'
          })

          // 监听新添加的 bar（如果甘特图重新渲染）
          const observer = new MutationObserver(() => {
            const newBars = container.querySelectorAll('.bar-wrapper, .bar')
            newBars.forEach((bar) => {
              bar.style.pointerEvents = 'none'
              bar.style.cursor = 'default'
            })
          })

          observer.observe(container, {
            childList: true,
            subtree: true,
          })

          // 保存 observer 以便在组件销毁时清理
          this._dragObserver = observer
        }
      })
    },

    // 设置鼠标滚轮缩放
    setupMouseWheelZoom() {
      this.$nextTick(() => {
        setTimeout(() => {
          const container = document.getElementById('gantt_here')

          if (!container) {
            console.error('Gantt container not found!')
            return
          }

          let wheelTimeout = null
          let lastZoomTime = 0
          const zoomDelay = 200 // 防抖延迟时间（毫秒）

          this.handleWheel = (event) => {
            const target = event.target
            const isInGantt = container.contains(target)

            if (!isInGantt) return

            // 按住 Ctrl 键（Mac 上是 Cmd 键）时进行缩放
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault()
              event.stopPropagation()

              const now = Date.now()
              const timeSinceLastZoom = now - lastZoomTime

              // 防抖处理
              if (wheelTimeout) {
                clearTimeout(wheelTimeout)
              }

              if (timeSinceLastZoom < zoomDelay) {
                wheelTimeout = setTimeout(() => {
                  this.executeZoom(event.deltaY)
                }, zoomDelay - timeSinceLastZoom)
              } else {
                this.executeZoom(event.deltaY)
              }
            }
          }

          container.addEventListener('wheel', this.handleWheel, {
            passive: false,
          })
        }, 500)
      })
    },

    // 执行缩放
    executeZoom(deltaY) {
      if (deltaY < 0) {
        // 向上滚动，放大（缩小时间单位）
        this.zoomIn()
      } else {
        // 向下滚动，缩小（放大时间单位）
        this.zoomOut()
      }
    },

    // 放大（缩小时间单位）
    zoomIn() {
      if (this.currentZoomLevel < this.zoomLevels.length - 1) {
        this.currentZoomLevel++
        this.applyZoomLevel()
      }
    },

    // 缩小（放大时间单位）
    zoomOut() {
      if (this.currentZoomLevel > 0) {
        this.currentZoomLevel--
        this.applyZoomLevel()
      }
    },

    getVisibleChartTasks() {
      const ids =
        this.visibleTaskIds && this.visibleTaskIds.length > 0
          ? this.visibleTaskIds
          : this.tasks.map((task) => task.id)

      return ids
        .map((id) => (this.taskLookup ? this.taskLookup[id] : null))
        .filter(Boolean)
        .map((task) => this.cloneTaskForChart(task))
    },

    cloneTaskForChart(task) {
      if (!task) return null
      const dependencies = Array.isArray(task.dependencies)
        ? [...task.dependencies]
        : []
      return {
        ...task,
        dependencies,
      }
    },

    refreshGanttTasks() {
      if (!this.gantt) return
      const visibleTasks = this.getVisibleChartTasks()
      this.gantt.refresh(visibleTasks)
      this.$nextTick(() => {
        setTimeout(() => {
          this.alignTaskRows()
        }, 100)
      })
    },

    // 对齐任务行（确保左侧与右侧行高一致）
    alignTaskRows() {
      // Frappe Gantt 的 bar_height + padding 决定了每行的高度
      // 这里确保左侧任务列表的行高与右侧一致
      const ganttBox = this.$refs.ganttBox
      if (ganttBox) {
        const ganttBars = ganttBox.querySelectorAll('.bar-wrapper')
        if (ganttBars.length > 0) {
          // 获取第一个 bar 的实际高度
          const firstBar = ganttBars[0]
          const computedStyle = window.getComputedStyle(firstBar)
          const barHeight = parseInt(computedStyle.height) || this.barHeight
          // 更新 barHeight 以确保一致性
          this.barHeight = barHeight
        }
      }
    },

    // 应用缩放级别
    applyZoomLevel() {
      if (!this.gantt) return

      const level = this.zoomLevels[this.currentZoomLevel]
      if (!level) {
        console.warn('Invalid zoom level:', this.currentZoomLevel)
        return
      }

      this.gantt.change_view_mode(level.mode)
      // 重新设置同步滚动和对齐
      this.$nextTick(() => {
        setTimeout(() => {
          this.setupSyncScroll()
          this.alignTaskRows()
        }, 300)
      })
    },
  },
}
</script>

<style scoped>
.gantt-container {
  width: 100%;
  height: 100%;
  background: #fff;
}

.gantt-wrapper {
  display: flex;
  width: 99%;
  border: 1px solid #e0e0e0;
  background: #fff;
}

/* 左侧任务栏 */
.task-sidebar {
  width: 250px;
  min-width: 250px;
  border-right: 1px solid #e0e0e0;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-sidebar-header {
  height: 40px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.task-header-cell {
  flex: 1;
}

.task-sidebar-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.task-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  min-height: 30px;
  background: #fff;
}

.task-row:hover {
  background: #f9f9f9;
}

.task-cell {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 100%;
  font-size: 13px;
  color: #333;
}

.collapse-icon {
  cursor: pointer;
  margin-right: 8px;
  user-select: none;
  font-size: 12px;
  color: #666;
  min-width: 16px;
  display: inline-block;
  text-align: center;
}

.collapse-icon:hover {
  color: #42b983;
}

.collapse-icon-placeholder {
  min-width: 16px;
  margin-right: 8px;
  display: inline-block;
}

.task-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧甘特图 */
.gantt-chart-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.gantt-box {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* Frappe Gantt 样式覆盖 */
.gantt-container /deep/ .gantt-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

.gantt-container /deep/ .bar {
  cursor: default;
  fill: #4a90e2 !important; /* 默认蓝色背景 */
  stroke: #2e5c8a !important; /* 边框颜色 */
  stroke-width: 1px !important;
}

.gantt-container /deep/ .bar-progress {
  fill: rgba(255, 255, 255, 0.3);
}

.gantt-container /deep/ .bar-invalid {
  fill: transparent;
  stroke: #d0d0d0;
  stroke-width: 1;
  stroke-dasharray: 5;
}

.gantt-container /deep/ .bar-label {
  fill: #fff;
  font-weight: bold;
  font-size: 12px;
  text-anchor: middle;
}

.gantt-container /deep/ .bar-label.big {
  fill: #555;
  text-anchor: start;
}

.gantt-container /deep/ .today-highlight {
  fill: #ff0000;
  opacity: 0.2;
}

/* 里程碑样式 */
.gantt-container /deep/ .bar.milestone {
  fill: #ff9800 !important;
  stroke: #f57c00 !important;
  stroke-width: 2px !important;
}

/* 项目类型任务 - 绿色背景 */
.gantt-container /deep/ .bar.project {
  fill: #5cb85c !important; /* 绿色 */
  stroke: #449d44 !important;
  stroke-width: 1px !important;
}

/* 确保所有任务条都有背景色 */
.gantt-container /deep/ .bar-wrapper .bar {
  fill: #4a90e2 !important; /* 默认蓝色 */
  stroke: #2e5c8a !important;
  stroke-width: 1px !important;
}

/* 任务条悬停效果 */
.gantt-container /deep/ .bar-wrapper:hover .bar {
  opacity: 0.85;
}

.gantt-container /deep/ .bar-wrapper:hover .bar:not(.milestone):not(.project) {
  fill: #357abd !important; /* 悬停时更深的蓝色 */
}

.gantt-container /deep/ .bar-wrapper:hover .bar.project {
  fill: #449d44 !important; /* 悬停时更深的绿色 */
}

.gantt-container /deep/ .bar.milestone .bar-progress {
  fill: transparent;
}

/* Tooltip 样式 */
.gantt-container /deep/ .popup-wrapper {
  background-color: #f4f4f4 !important;
  color: #333 !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3) !important;
  padding: 0 !important;
}
</style>
