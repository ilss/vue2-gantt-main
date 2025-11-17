<template>
  <div class="gantt-container">
    <div class="gantt-toolbar">
      <div class="toolbar-spacer"></div>
      <div class="export-group">
        <span class="toolbar-label">导出</span>
        <button class="export-btn" @click="exportChart('png')">PNG</button>
        <button class="export-btn" @click="exportChart('pdf')">PDF</button>
        <!-- <button class="export-btn" @click="exportChart('excel')">Excel</button> -->
      </div>
    </div>
    <div id="gantt_here" class="gantt-box"></div>
  </div>
</template>

<script>
export default {
  name: 'GanttDemo',

  data() {
    return {
      currentZoomLevel: 4, // 当前缩放级别，1=年级，2=月级，3=周级，4=天级，5=小时级，默认天级
      zoomLevels: [
        {
          name: '年级',
          scales: [
            {
              unit: 'year',
              step: 1,
              format: (date) => {
                return date.getFullYear() + ' 年'
              },
            },
            {
              unit: 'month',
              step: 1,
              format: (date) => {
                return date.getMonth() + 1 + ' 月'
              },
            },
          ],
          minColumnWidth: 100,
        },
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
                return date.getDate()
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
      tooltip: true, // 启用 tooltip 插件
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

    // 配置 tooltip 显示任务信息
    gantt.templates.tooltip_text = (start, end, task) => {
      const startDate = gantt.templates.tooltip_date_format(start)
      const endDate = gantt.templates.tooltip_date_format(end)
      const duration = task.duration || 0
      const progress = task.progress || 0

      let html = `<div style="padding: 8px; min-width: 200px; color: #333;">`
      html += `<div style="font-weight: bold; margin-bottom: 6px; font-size: 14px; color: #537cfa;">${
        task.text || '未命名任务'
      }</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>开始时间:</b> ${startDate}</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>结束时间:</b> ${endDate}</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>持续时间:</b> ${duration} 天</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>进度:</b> ${progress}%</div>`

      if (task.type) {
        html += `<div style="margin-bottom: 4px; color: #333;"><b>类型:</b> ${task.type}</div>`
      }

      html += `</div>`
      return html
    }

    // 配置 tooltip 日期格式
    gantt.templates.tooltip_date_format = (date) => {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    // 配置任务条显示 duration 而不是 text
    gantt.templates.task_text = (start, end, task) => {
      return (task.duration || 0) + '天'
    }

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

    // 生成 Project 数据的辅助函数
    const generateProjectData = (projectNum, dayOffset) => {
      const baseDate = new Date(2025, 3, 2) // 2025年4月2日
      baseDate.setDate(baseDate.getDate() + dayOffset)

      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year} 00:00`
      }

      const addDays = (date, days) => {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
      }

      // ID 基础值
      const projectId = projectNum * 100 + 1
      const task1Id = projectNum * 100 + 2
      const task2Id = projectNum * 100 + 3
      const task3Id = projectNum * 100 + 4
      const task4Id = projectNum * 100 + 5
      const finalMilestoneId = projectNum * 100 + 6
      const stage1Task2Id = projectNum * 100 + 7
      const stage2Task2Id = projectNum * 100 + 8
      const stage3Task2Id = projectNum * 100 + 9
      const stage4Task2Id = projectNum * 100 + 10
      const stage1Task4Id = projectNum * 100 + 11
      const stage2Task4Id = projectNum * 100 + 12
      const mediateMilestoneId = projectNum * 100 + 13

      const projectStart = baseDate
      const task1Start = addDays(projectStart, 1)
      const task2Start = addDays(projectStart, 1)
      const task3Start = projectStart
      const task4Start = addDays(projectStart, 1)
      const finalMilestoneStart = addDays(projectStart, 13)

      const stage1Task2Start = addDays(task2Start, 0)
      const stage2Task2Start = addDays(task2Start, 2)
      const stage3Task2Start = addDays(task2Start, 5)
      const stage4Task2Start = addDays(task2Start, 7)

      const stage1Task4Start = addDays(task4Start, 0)
      const stage2Task4Start = addDays(task4Start, 5)
      const mediateMilestoneStart = addDays(task4Start, 11)

      const data = [
        {
          id: projectId,
          text: `工序 #${projectNum}`,
          type: 'project',
          progress: 0,
          open: true,
          start_date: formatDate(projectStart),
          duration: 13,
          parent: 0,
        },
        {
          id: task1Id,
          text: '复合件贴合',
          start_date: formatDate(task1Start),
          duration: 5,
          parent: String(projectId),
          progress: 0,
          open: true,
        },
        {
          id: task2Id,
          text: '子口贴合',
          start_date: formatDate(task2Start),
          type: 'project',
          render: 'split',
          parent: String(projectId),
          progress: 0.5,
          open: false,
          duration: 11,
        },
        {
          id: stage1Task2Id,
          text: '子口滚压',
          start_date: formatDate(stage1Task2Start),
          duration: 1,
          parent: String(task2Id),
          progress: 0,
          open: true,
        },
        {
          id: stage2Task2Id,
          text: '子口滚压',
          start_date: formatDate(stage2Task2Start),
          duration: 2,
          parent: String(task2Id),
          progress: 0,
          open: true,
        },
        {
          id: stage3Task2Id,
          text: '子口滚压',
          start_date: formatDate(stage3Task2Start),
          duration: 1,
          parent: String(task2Id),
          progress: 0,
          open: true,
        },
        {
          id: stage4Task2Id,
          text: '子口滚压',
          start_date: formatDate(stage4Task2Start),
          duration: 4,
          parent: String(task2Id),
          progress: 0,
          open: true,
        },
        {
          id: task3Id,
          text: '胎体帘布贴合',
          start_date: formatDate(task3Start),
          duration: 6,
          parent: String(projectId),
          progress: 0,
          open: true,
        },
        {
          id: task4Id,
          text: '帘布滚压',
          type: 'project',
          render: 'split',
          parent: String(projectId),
          progress: 0,
          open: true,
          start_date: formatDate(task4Start),
          duration: 11,
        },
        {
          id: stage1Task4Id,
          text: '子口滚压',
          start_date: formatDate(stage1Task4Start),
          duration: 4,
          parent: String(task4Id),
          progress: 0,
          open: true,
        },
        {
          id: stage2Task4Id,
          text: '子口滚压',
          start_date: formatDate(stage2Task4Start),
          duration: 3,
          parent: String(task4Id),
          progress: 0,
          open: true,
        },
        {
          id: mediateMilestoneId,
          text: 'Mediate milestone',
          start_date: formatDate(mediateMilestoneStart),
          duration: 0,
          type: 'milestone',
          parent: String(task4Id),
          progress: 0,
          open: true,
        },
        // {
        //   id: finalMilestoneId,
        //   text: 'Final milestone',
        //   start_date: formatDate(finalMilestoneStart),
        //   duration: 0,
        //   type: 'milestone',
        //   parent: String(projectId),
        //   progress: 0,
        //   open: true,
        // },
      ]

      const links = [
        {
          id: `${projectNum}-1`,
          source: String(stage1Task2Id),
          target: String(stage2Task2Id),
          type: '0',
        },
        {
          id: `${projectNum}-2`,
          source: String(stage2Task2Id),
          target: String(stage3Task2Id),
          type: '0',
        },
        {
          id: `${projectNum}-3`,
          source: String(stage3Task2Id),
          target: String(stage4Task2Id),
          type: '0',
        },
        {
          id: `${projectNum}-4`,
          source: String(stage1Task4Id),
          target: String(stage2Task4Id),
          type: '0',
        },
        {
          id: `${projectNum}-5`,
          source: String(stage2Task4Id),
          target: String(mediateMilestoneId),
          type: '0',
        },
      ]

      return { data, links }
    }

    // 生成10组 Project 数据
    const allData = []
    const allLinks = []
    for (let i = 1; i <= 10; i++) {
      const dayOffset = (i - 1) * 20 // 每个 Project 间隔20天
      const projectData = generateProjectData(i, dayOffset)
      allData.push(...projectData.data)
      // allLinks.push(...projectData.links)
    }

    // 解析数据
    const ganttData = {
      data: allData,
      links: allLinks,
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
    exportChart(type) {
      if (typeof gantt === 'undefined') {
        console.warn('DHTMLX Gantt 未就绪，无法导出')
        return
      }

      const exporters = {
        png: () =>
          gantt.exportToPNG({
            name: 'gantt.png',
          }),
        pdf: () =>
          gantt.exportToPDF({
            name: 'gantt.pdf',
            locale: 'cn',
          }),
        excel: () =>
          gantt.exportToExcel({
            name: 'gantt.xlsx',
          }),
      }

      const exporter = exporters[type]
      if (exporter) {
        exporter()
      }
    },

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
              // 阻止默认行为和事件传播，执行缩放
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
              return // 按住 Ctrl/Cmd 时，处理完缩放后直接返回
            }
            // 不按住 Ctrl/Cmd 键时，不做任何处理，让事件正常传播
            // 这样 gantt 的默认 Y 轴滚动行为可以正常工作
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

          // 优先在 gantt 任务区域添加事件监听器（这是实际处理滚动的元素）
          // 如果找不到任务区域，则在主容器上添加
          const targetElement = ganttTaskArea || container

          targetElement.addEventListener('wheel', handleWheel, {
            passive: false,
            capture: false, // 不使用捕获，让事件先到达 gantt 内部元素
          })

          // 在组件销毁时移除事件监听器
          this.$once('hook:beforeDestroy', () => {
            targetElement.removeEventListener('wheel', handleWheel)
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

.gantt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 0 12px;
}

.toolbar-spacer {
  flex: 1;
}

.export-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  color: #666;
}

.export-btn {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  border-color: #4b7bf5;
  color: #4b7bf5;
}

.gantt-box {
  width: 100%;
  height: calc(100vh - 140px);
}

/* 自定义 tooltip 样式 */
.gantt_tooltip {
  background-color: #f4f4f4 !important;
  color: #333 !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3) !important;
}

/* 自定义任务条文本样式 */
.gantt_task_content {
  font-size: 12px !important;
}
</style>
