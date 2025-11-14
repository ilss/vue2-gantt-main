<template>
  <div class="gantt-container">
    <div id="gantt_here" class="gantt-box"></div>
  </div>
</template>

<script>
export default {
  name: 'GanttDemo',

  data() {
    return {
      currentZoomLevel: 1, // 当前缩放级别，1=月级，2=周级，3=天级
      zoomLevels: [
        {
          name: '月级',
          scales: [
            {
              unit: 'month',
              step: 1,
              format: (date) => {
                return date.getMonth() + 1 + ' 月'
              },
            },
          ],
          minColumnWidth: 70,
        },
        {
          name: '周级',
          scales: [
            {
              unit: 'month',
              step: 1,
              format: (date) => {
                return date.getMonth() + 1 + ' 月'
              },
            },
            {
              unit: 'week',
              step: 1,
              format: (date) => {
                try {
                  const week = gantt.date.getWeek(date)
                  return '第' + week + '周'
                } catch (e) {
                  return date.getDate() + '日'
                }
              },
            },
          ],
          minColumnWidth: 50,
        },
        {
          name: '天级',
          scales: [
            {
              unit: 'month',
              step: 1,
              format: (date) => {
                return date.getMonth() + 1 + ' 月'
              },
            },
            {
              unit: 'day',
              step: 1,
              format: (date) => {
                return date.getDate() + '日'
              },
            },
          ],
          minColumnWidth: 30,
        },
        {
          name: '小时级',
          scales: [
            {
              unit: 'day',
              step: 1,
              format: (date) => {
                return date.getMonth() + 1 + '月' + date.getDate() + '日'
              },
            },
            {
              unit: 'hour',
              step: 1,
              format: (date) => {
                const hour = date.getHours()
                return hour + '时'
              },
            },
          ],
          minColumnWidth: 25,
        },
      ],
      monthsWithData: null,
      sortedMonths: null,
    }
  },

  mounted() {
    // 插件
    gantt.plugins({
      auto_scheduling: true,
    })

    // 配置
    gantt.config.auto_types = true
    gantt.config.auto_scheduling = {
      enabled: true,
      apply_constraints: false,
      gap_behavior: 'preserve',
    }

    // 禁用编辑功能
    gantt.config.readonly = true
    gantt.config.drag_links = false
    gantt.config.drag_timeline = false

    // 配置左侧列，只显示任务名称列（移除开始时间和添加按钮列）
    gantt.config.columns = [
      { name: 'text', label: '任务名称', tree: true, width: '*' },
    ]

    // 禁用添加按钮
    gantt.config.show_add_column = false

    // Lightbox（付费版才生效）
    gantt.locale.labels.section_split = 'Display'
    gantt.config.lightbox.project_sections = [
      {
        name: 'description',
        height: 70,
        map_to: 'text',
        type: 'textarea',
        focus: true,
      },
      {
        name: 'split',
        type: 'checkbox',
        map_to: 'render',
        options: [{ key: 'split', label: 'Split Task' }],
      },
      { name: 'time', type: 'duration', readonly: true, map_to: 'auto' },
    ]

    // 初始化
    gantt.init('gantt_here')

    // 解析数据
    const ganttData = {
      data: [
        {
          id: 11,
          text: 'Project #1',
          type: 'project',
          progress: 0,
          open: true,
          start_date: '02-04-2023 00:00',
          duration: 13,
          parent: 0,
        },
        {
          id: 12,
          text: 'Task #1',
          start_date: '03-04-2023 00:00',
          duration: 5,
          parent: '11',
          progress: 0,
          open: true,
        },
        {
          id: 13,
          text: 'Task #2',
          start_date: '03-04-2023 00:00',
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
          start_date: '03-04-2023 00:00',
          duration: 1,
          parent: '13',
          progress: 0,
          open: true,
        },
        {
          id: 18,
          text: 'Stage #2',
          start_date: '05-04-2023 00:00',
          duration: 2,
          parent: '13',
          progress: 0,
          open: true,
        },
        {
          id: 19,
          text: 'Stage #3',
          start_date: '08-04-2023 00:00',
          duration: 1,
          parent: '13',
          progress: 0,
          open: true,
        },
        {
          id: 20,
          text: 'Stage #4',
          start_date: '10-04-2023 00:00',
          duration: 4,
          parent: '13',
          progress: 0,
          open: true,
        },
        {
          id: 14,
          text: 'Task #3',
          start_date: '02-04-2023 00:00',
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
          start_date: '03-04-2023 00:00',
          duration: 11,
        },
        {
          id: 21,
          text: 'Stage #1',
          start_date: '03-04-2023 00:00',
          duration: 4,
          parent: '15',
          progress: 0,
          open: true,
        },
        {
          id: 22,
          text: 'Stage #2',
          start_date: '08-04-2023 00:00',
          duration: 3,
          parent: '15',
          progress: 0,
          open: true,
        },
        {
          id: 23,
          text: 'Mediate milestone',
          start_date: '14-04-2023 00:00',
          duration: 0,
          type: 'milestone',
          parent: '15',
          progress: 0,
          open: true,
          duration: 0,
        },
        {
          id: 16,
          text: 'Final milestone',
          start_date: '15-04-2023 00:00',
          duration: 0,
          type: 'milestone',
          parent: '11',
          progress: 0,
          open: true,
          duration: 0,
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

    gantt.parse(ganttData)

    // 计算有数据的月份
    const monthsWithData = new Set()
    gantt.eachTask((task) => {
      if (task.start_date) {
        // gantt.parse() 后，start_date 应该已经是 Date 对象
        // 如果不是，则直接使用（gantt 会处理）
        const start =
          task.start_date instanceof Date
            ? task.start_date
            : new Date(task.start_date)

        if (isNaN(start.getTime())) {
          console.warn('Invalid start_date:', task.start_date, task.id)
          return
        }

        const end = task.duration
          ? gantt.date.add(start, task.duration, 'day')
          : start

        let current = new Date(start)
        while (current <= end) {
          const monthKey =
            current.getFullYear() * 100 + (current.getMonth() + 1)
          monthsWithData.add(monthKey)
          current = gantt.date.add(current, 1, 'day')
        }
      }
    })

    // 获取有数据的月份列表并排序
    this.sortedMonths = Array.from(monthsWithData).sort()
    this.monthsWithData = monthsWithData

    // 设置开始和结束日期为有数据的月份范围
    if (this.sortedMonths.length > 0) {
      const firstMonthKey = this.sortedMonths[0]
      const lastMonthKey = this.sortedMonths[this.sortedMonths.length - 1]

      const startYear = Math.floor(firstMonthKey / 100)
      const startMonth = firstMonthKey % 100
      const endYear = Math.floor(lastMonthKey / 100)
      const endMonth = lastMonthKey % 100

      // 设置开始日期为第一个有数据的月份的第一天
      gantt.config.start_date = new Date(startYear, startMonth - 1, 1)
      // 设置结束日期为最后一个有数据的月份的最后一天
      gantt.config.end_date = new Date(endYear, endMonth, 0)
    }

    // 应用初始缩放级别
    this.applyZoomLevel()

    // 添加鼠标滚轮缩放功能
    this.setupMouseWheelZoom()
  },

  methods: {
    // 应用缩放级别
    applyZoomLevel() {
      const level = this.zoomLevels[this.currentZoomLevel - 1]
      if (!level) {
        console.warn('Invalid zoom level:', this.currentZoomLevel)
        return
      }

      // 设置最小列宽
      gantt.config.min_column_width = level.minColumnWidth

      // 设置 scale 配置，只显示有数据的月份
      gantt.config.scales = level.scales.map((scale) => {
        if (scale.unit === 'month') {
          return {
            ...scale,
            format: (date) => {
              const monthKey = date.getFullYear() * 100 + (date.getMonth() + 1)
              if (this.monthsWithData && this.monthsWithData.has(monthKey)) {
                return date.getMonth() + 1 + ' 月'
              }
              return ''
            },
          }
        }
        return scale
      })

      // 重新渲染
      gantt.render()

      // 延迟隐藏空列
      setTimeout(() => {
        this.hideEmptyColumns()
      }, 100)
    },

    // 隐藏空列
    hideEmptyColumns() {
      const scaleRow = document.querySelector('.gantt_scale_line')
      if (scaleRow) {
        const scaleCells = scaleRow.querySelectorAll('.gantt_scale_cell')
        scaleCells.forEach((cell, index) => {
          const text = cell.textContent.trim()
          if (text === '') {
            // 隐藏空的 scale cell
            cell.style.display = 'none'
            cell.style.width = '0'

            // 隐藏对应的 timeline 列
            const timelineRows = document.querySelectorAll(
              '.gantt_task_bg, .gantt_task_line'
            )
            timelineRows.forEach((row) => {
              const cells = row.querySelectorAll('.gantt_cell')
              if (cells[index]) {
                cells[index].style.display = 'none'
                cells[index].style.width = '0'
              }
            })
          }
        })
      }
    },

    // 设置鼠标滚轮缩放
    setupMouseWheelZoom() {
      // 等待 gantt 完全初始化
      this.$nextTick(() => {
        setTimeout(() => {
          // 获取 gantt 容器元素
          const container = document.getElementById('gantt_here')

          if (!container) {
            console.error('Gantt container not found!')
            return
          }

          // 查找所有可能的 gantt 元素
          const ganttContainer = container.querySelector('.gantt_container')
          const ganttTaskArea = container.querySelector('.gantt_task')
          const ganttScaleArea = container.querySelector('.gantt_scale')

          let wheelTimeout = null
          let lastZoomTime = 0
          const zoomDelay = 200 // 防抖延迟时间（毫秒）

          const handleWheel = (event) => {
            // 检查鼠标是否在 gantt 区域内
            const target = event.target
            const isInGantt = container.contains(target)

            if (!isInGantt) return

            // 按住 Ctrl 键（Mac 上是 Cmd 键）时进行缩放
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault()
              event.stopPropagation()

              const now = Date.now()
              const timeSinceLastZoom = now - lastZoomTime

              // 防抖处理，避免滚动过快
              if (wheelTimeout) {
                clearTimeout(wheelTimeout)
              }

              // 如果距离上次缩放时间太短，则延迟执行
              if (timeSinceLastZoom < zoomDelay) {
                wheelTimeout = setTimeout(() => {
                  executeZoom(event.deltaY)
                }, zoomDelay - timeSinceLastZoom)
              } else {
                // 立即执行
                executeZoom(event.deltaY)
              }
            }
          }

          const executeZoom = (deltaY) => {
            lastZoomTime = Date.now()

            if (deltaY < 0) {
              // 向上滚动，放大（缩小时间单位）
              this.zoomIn()
            } else {
              // 向下滚动，缩小（放大时间单位）
              this.zoomOut()
            }
          }

          // 添加到容器元素上（最可靠的方式）
          container.addEventListener('wheel', handleWheel, { passive: false })

          // 如果找到了 gantt 内部容器，也添加监听器
          if (ganttContainer) {
            ganttContainer.addEventListener('wheel', handleWheel, {
              passive: false,
            })
            console.log('Wheel event listener added to gantt_container')
          }

          // 添加到 gantt 任务区域
          if (ganttTaskArea) {
            ganttTaskArea.addEventListener('wheel', handleWheel, {
              passive: false,
            })
            console.log('Wheel event listener added to gantt_task')
          }

          // 添加到 gantt 时间轴区域
          if (ganttScaleArea) {
            ganttScaleArea.addEventListener('wheel', handleWheel, {
              passive: false,
            })
            console.log('Wheel event listener added to gantt_scale')
          }

          // 在组件销毁时移除事件监听器
          this.$once('hook:beforeDestroy', () => {
            container.removeEventListener('wheel', handleWheel)
            if (ganttContainer) {
              ganttContainer.removeEventListener('wheel', handleWheel)
            }
            if (ganttTaskArea) {
              ganttTaskArea.removeEventListener('wheel', handleWheel)
            }
            if (ganttScaleArea) {
              ganttScaleArea.removeEventListener('wheel', handleWheel)
            }
          })
        }, 1000) // 增加延迟时间
      })
    },

    // 放大（缩小时间单位）
    zoomIn() {
      if (this.currentZoomLevel < this.zoomLevels.length) {
        this.currentZoomLevel++
        this.applyZoomLevel()
      }
    },

    // 缩小（放大时间单位）
    zoomOut() {
      if (this.currentZoomLevel > 1) {
        this.currentZoomLevel--
        this.applyZoomLevel()
      }
    },
  },
}
</script>

<style>
.gantt-container {
  width: 100%;
  height: 100%;
}

.gantt-box {
  width: 100%;
  height: 600px;
}
</style>
