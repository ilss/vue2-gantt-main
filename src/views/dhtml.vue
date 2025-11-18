<template>
  <div class="gantt-container">
    <div class="gantt-toolbar">
      <div class="toolbar-spacer"></div>
      <div class="export-group">
        <span class="toolbar-label">导出</span>
        <!-- <button class="export-btn" @click="exportChart('png')">PNG</button> -->
        <button class="export-btn" @click="exportChart('pdf')">PDF</button>
        <!-- <button class="export-btn" @click="exportChart('excel')">Excel</button> -->
      </div>
    </div>
    <div id="gantt_here" class="gantt-box"></div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { ganttDataObject } from '../data'

export default {
  name: 'GanttDemo',

  data() {
    return {
      currentZoomLevel: 5, // 当前缩放级别，1=年级，2=月级，3=周级，4=天级，5=小时级，6=分钟级，默认小时级
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
        {
          name: '分钟级',
          scales: [
            {
              unit: 'hour',
              step: 1,
              format: (date) => {
                return (
                  date.getMonth() +
                  1 +
                  '月' +
                  date.getDate() +
                  '日 ' +
                  date.getHours() +
                  '时'
                )
              },
            },
            {
              unit: 'minute',
              step: 1, // 每1分钟一个刻度
              format: (date) => {
                const minutes = date.getMinutes()
                return minutes
              },
            },
          ],
          minColumnWidth: 25, // 1分钟刻度时，栅格最小宽度25px
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

    // 设置持续时间单位为分钟（内部使用分钟，但数据源是秒级）
    gantt.config.duration_unit = 'minute'

    // 禁用日期四舍五入，确保小 duration 值能正确显示
    gantt.config.round_dnd_dates = false
    gantt.config.work_time = false // 禁用工作时间，允许显示任意时间

    // 设置最小任务条宽度（像素），确保小 duration 任务也能显示
    gantt.config.min_task_bar_width = 1

    // 设置最小 duration（分钟），允许非常小的值
    gantt.config.min_duration = 0.0001 // 约 0.006 秒

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
      // 使用保存的原始秒值，如果没有则从分钟转换回秒
      const durationInSeconds =
        task._originalDurationSeconds !== undefined
          ? task._originalDurationSeconds
          : (task.duration || 0) * 60
      const progress = task.progress || 0

      // 格式化持续时间显示（秒）
      const formatDuration = (seconds) => {
        if (seconds < 1) {
          return seconds.toFixed(3) + ' 秒'
        } else if (seconds < 60) {
          return seconds.toFixed(2) + ' 秒'
        } else {
          const mins = Math.floor(seconds / 60)
          const secs = (seconds % 60).toFixed(2)
          return mins + ' 分 ' + secs + ' 秒'
        }
      }

      let html = `<div style="padding: 8px; min-width: 200px; color: #333;">`
      html += `<div style="font-weight: bold; margin-bottom: 6px; font-size: 14px; color: #537cfa;">${
        task.text || '未命名任务'
      }</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>开始时间:</b> ${startDate}</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>结束时间:</b> ${endDate}</div>`
      html += `<div style="margin-bottom: 4px; color: #333;"><b>持续时间:</b> ${formatDuration(
        durationInSeconds
      )}</div>`
      // html += `<div style="margin-bottom: 4px; color: #333;"><b>进度:</b> ${progress}%</div>`

      // if (task.type) {
      //   html += `<div style="margin-bottom: 4px; color: #333;"><b>类型:</b> ${task.type}</div>`
      // }

      html += `</div>`
      return html
    }

    // 配置 tooltip 日期格式（支持秒级显示）
    gantt.templates.tooltip_date_format = (date) => {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      const milliseconds = String(d.getMilliseconds()).padStart(3, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
    }

    // 配置任务条显示 duration（使用保存的原始秒值）
    gantt.templates.task_text = (start, end, task) => {
      // 使用保存的原始秒值，如果没有则从分钟转换回秒
      const durationInSeconds =
        task._originalDurationSeconds !== undefined
          ? task._originalDurationSeconds
          : (task.duration || 0) * 60

      // 格式化持续时间显示（秒）
      if (durationInSeconds < 1) {
        return durationInSeconds.toFixed(3) + '秒'
      } else if (durationInSeconds < 60) {
        return durationInSeconds.toFixed(2) + '秒'
      } else {
        const mins = Math.floor(durationInSeconds / 60)
        const secs = (durationInSeconds % 60).toFixed(2)
        return mins + '分' + secs + '秒'
      }
    }

    // 自定义任务条宽度，确保小 duration 任务也能显示
    gantt.templates.task_width = (start, end, task) => {
      const duration = task.duration || 0
      // 如果 duration 小于 0.01 分钟（约 0.6 秒），强制返回最小宽度
      if (duration > 0 && duration < 0.01) {
        // 根据当前缩放级别计算最小宽度
        // 在分钟级缩放时，1 分钟对应一个刻度，小 duration 至少显示 2 像素
        return 2
      }
      // 使用默认计算
      return null
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

    // 监听渲染事件，确保小 duration 任务条始终可见
    gantt.attachEvent('onAfterTaskDisplay', () => {
      setTimeout(() => {
        gantt.eachTask((task) => {
          if (
            task._originalDurationSeconds !== undefined &&
            task._originalDurationSeconds < 1
          ) {
            const taskNode = gantt.getTaskNode(task.id)
            if (taskNode) {
              const taskElement = taskNode.querySelector('.gantt_task_line')
              if (taskElement) {
                const computedWidth =
                  parseFloat(window.getComputedStyle(taskElement).width) || 0
                if (computedWidth < 2) {
                  taskElement.style.minWidth = '2px'
                  taskElement.style.width = '2px'
                }
              }
            }
          }
        })
      }, 50)
    })

    // 生成随机持续时间（1-3分钟）
    const getRandomDuration = () => {
      return Math.floor(Math.random() * 3) + 1 // 1-3分钟
    }

    // 生成 Project 数据的辅助函数
    const generateProjectData = (projectNum, hourOffset) => {
      const baseDate = new Date(2025, 3, 2, 0, 0, 0) // 2025年4月2日 00:00
      baseDate.setHours(baseDate.getHours() + hourOffset)

      const formatDate = (date) => {
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
        // const day = String(date.getDate()).padStart(2, '0')
        // const month = String(date.getMonth() + 1).padStart(2, '0')
        // const year = date.getFullYear()
        // const hours = String(date.getHours()).padStart(2, '0')
        // const minutes = String(date.getMinutes()).padStart(2, '0')
        // return `${day}-${month}-${year} ${hours}:${minutes}`
      }

      const addMinutes = (date, minutes) => {
        const result = new Date(date)
        result.setMinutes(result.getMinutes() + minutes)
        return result
      }

      // ID 基础值
      const projectId = projectNum * 100 + 1
      const task1Id = projectNum * 100 + 2
      const task2Id = projectNum * 100 + 3
      const task3Id = projectNum * 100 + 4
      const task4Id = projectNum * 100 + 5
      // const finalMilestoneId = projectNum * 100 + 6

      const projectStart = baseDate
      const task1Start = addMinutes(projectStart, 5)
      const task2Start = addMinutes(projectStart, 5)
      const task3Start = projectStart
      const task4Start = addMinutes(projectStart, 5)

      // 计算子口贴合（task2）的10个子任务
      const task2SubTasks = []
      let task2SubTaskId = projectNum * 100 + 7
      let task2CurrentStart = task2Start
      for (let i = 0; i < 10; i++) {
        task2SubTasks.push({
          id: task2SubTaskId + i,
          start: new Date(task2CurrentStart),
        })
        task2CurrentStart = addMinutes(task2CurrentStart, 4) // 每个间隔4分钟
      }

      // 计算帘布滚压（task4）的10个子任务
      const task4SubTasks = []
      let task4SubTaskId = projectNum * 100 + 17
      let task4CurrentStart = task4Start
      for (let i = 0; i < 10; i++) {
        task4SubTasks.push({
          id: task4SubTaskId + i,
          start: new Date(task4CurrentStart),
        })
        task4CurrentStart = addMinutes(task4CurrentStart, 4) // 每个间隔4分钟
      }

      // 计算项目总持续时间（取最长任务的结束时间）
      const task2End = task2SubTasks[task2SubTasks.length - 1].start
      const task2LastDuration = getRandomDuration()
      const task2LastEnd = addMinutes(task2End, task2LastDuration)

      const task4End = task4SubTasks[task4SubTasks.length - 1].start
      const task4LastDuration = getRandomDuration()
      const task4LastEnd = addMinutes(task4End, task4LastDuration)

      const projectEnd = new Date(
        Math.max(
          addMinutes(task1Start, getRandomDuration()).getTime(),
          task2LastEnd.getTime(),
          addMinutes(task3Start, getRandomDuration()).getTime(),
          task4LastEnd.getTime()
        )
      )
      const projectDuration = Math.ceil(
        (projectEnd - projectStart) / (1000 * 60)
      ) // 转换为分钟

      const data = [
        {
          id: projectId,
          text: `工序 #${projectNum}`,
          type: 'project',
          progress: 0,
          open: true,
          start_date: formatDate(projectStart),
          duration: projectDuration,
          parent: 0,
        },
        {
          id: task1Id,
          text: '复合件贴合',
          start_date: formatDate(task1Start),
          duration: getRandomDuration(),
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
          duration: Math.ceil((task2LastEnd - task2Start) / (1000 * 60)),
        },
        ...task2SubTasks.map((subTask, index) => ({
          id: subTask.id,
          text: '子口滚压',
          start_date: formatDate(subTask.start),
          duration: getRandomDuration(),
          parent: String(task2Id),
          progress: 0,
          open: true,
        })),
        {
          id: task3Id,
          text: '胎体帘布贴合',
          start_date: formatDate(task3Start),
          duration: getRandomDuration(),
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
          duration: Math.ceil((task4LastEnd - task4Start) / (1000 * 60)),
        },
        ...task4SubTasks.map((subTask, index) => ({
          id: subTask.id,
          text: '子口滚压',
          start_date: formatDate(subTask.start),
          duration: getRandomDuration(),
          parent: String(task4Id),
          progress: 0,
          open: true,
        })),
      ]

      // 清空 links 数据
      const links = []

      return { data, links }
    }

    // 生成10组 Project 数据
    const allData = []
    for (let i = 1; i <= 10; i++) {
      const hourOffset = (i - 1) * 1 // 每个 Project 间隔1小时
      const projectData = generateProjectData(i, hourOffset)
      allData.push(...projectData.data)
    }

    // 解析数据
    // const ganttData = {
    //   data: allData,
    //   links: [], // 清空 links 数据
    // }

    // 递归遍历所有 start_date 和 end_date，支持秒级和毫秒级精度
    const convertDates = (items) => {
      if (!Array.isArray(items)) return

      const parseDate = (dateStr) => {
        if (!dateStr) return null

        // 如果已经是 Date 对象，直接返回
        if (dateStr instanceof Date) return dateStr

        // 处理格式：'2025-11-07 11:25:41:693' 或 '2025-11-07 11:25:41.693'
        if (typeof dateStr === 'string') {
          // 替换最后一个冒号为点，以支持标准格式
          let normalizedDate = dateStr.replace(
            /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}):(\d+)$/,
            '$1.$2'
          )

          // 如果格式是 'YYYY-MM-DD HH:mm:ss:SSS'，转换为 'YYYY-MM-DD HH:mm:ss.SSS'
          if (
            normalizedDate.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\d{3}$/)
          ) {
            normalizedDate = normalizedDate.replace(
              /(\d{2}:\d{2}:\d{2}):(\d{3})$/,
              '$1.$2'
            )
          }

          const date = new Date(normalizedDate)
          // 如果解析失败，尝试使用 dayjs
          if (isNaN(date.getTime())) {
            return dayjs(dateStr).toDate()
          }
          return date
        }

        return new Date(dateStr)
      }

      items.forEach((item) => {
        if (item.start_date) {
          item.start_date = parseDate(item.start_date)
        }
        if (item.end_date) {
          item.end_date = parseDate(item.end_date)
        }

        // 递归处理嵌套的 $inlineSplit 数组
        if (item.$inlineSplit && Array.isArray(item.$inlineSplit)) {
          convertDates(item.$inlineSplit)
        }
      })
    }

    convertDates(ganttDataObject)
    console.log(allData)

    // 将秒级 duration 转换为分钟（gantt 内部使用分钟单位）
    // 但我们需要保存原始秒值用于显示
    const convertDurationToMinutes = (items) => {
      if (!Array.isArray(items)) return

      items.forEach((item) => {
        // 如果 duration 存在且是数字，保存原始秒值，然后转换为分钟
        if (item.duration !== undefined && typeof item.duration === 'number') {
          const originalSeconds = item.duration
          item._originalDurationSeconds = originalSeconds // 保存原始秒值
          const minutesValue = originalSeconds / 60 // 秒转分钟
          item.duration = minutesValue

          // 调试：打印小于 1 秒的 duration
          if (originalSeconds < 1) {
            console.log(
              `任务 ${item.id}: 原始秒值=${originalSeconds}, 转换后分钟值=${minutesValue}`
            )
          }
        }

        // 递归处理嵌套的 $inlineSplit 数组
        if (item.$inlineSplit && Array.isArray(item.$inlineSplit)) {
          convertDurationToMinutes(item.$inlineSplit)
        }
      })
    }

    convertDurationToMinutes(ganttDataObject)

    const ganttData = {
      data: ganttDataObject,
      links: [], // 清空 links 数据
    }

    gantt.parse(ganttData)

    // 解析后验证：确保所有任务的 duration 都正确设置（特别是小于 1 秒的任务）
    let hasSmallDurationTasks = false
    gantt.eachTask((task) => {
      if (
        task._originalDurationSeconds !== undefined &&
        task._originalDurationSeconds < 1
      ) {
        hasSmallDurationTasks = true
        // 如果原始秒值小于 1，确保 duration 不为 0
        const expectedMinutes = task._originalDurationSeconds / 60
        if (
          task.duration === 0 ||
          Math.abs(task.duration - expectedMinutes) > 0.0001
        ) {
          task.duration = expectedMinutes
          console.log(
            `修复任务 ${task.id} 的 duration: ${task.duration} 分钟 (原始: ${task._originalDurationSeconds} 秒)`
          )
        }
      }
    })

    // 如果有小 duration 任务，强制刷新渲染并设置最小宽度
    if (hasSmallDurationTasks) {
      gantt.render()

      // 等待渲染完成后，强制设置小任务条的最小宽度
      this.$nextTick(() => {
        setTimeout(() => {
          gantt.eachTask((task) => {
            if (
              task._originalDurationSeconds !== undefined &&
              task._originalDurationSeconds < 1
            ) {
              // 尝试多种选择器来找到任务条元素
              let taskElement = document.querySelector(
                `.gantt_task_line[task_id="${task.id}"]`
              )
              if (!taskElement) {
                taskElement = document.querySelector(
                  `div[task_id="${task.id}"] .gantt_task_line`
                )
              }
              if (!taskElement) {
                // 使用 gantt 的 API 获取任务条元素
                const taskNode = gantt.getTaskNode(task.id)
                if (taskNode) {
                  taskElement = taskNode.querySelector('.gantt_task_line')
                }
              }

              if (taskElement) {
                const currentWidth = parseFloat(taskElement.style.width) || 0
                const computedWidth =
                  parseFloat(window.getComputedStyle(taskElement).width) || 0
                if (currentWidth < 2 || computedWidth < 2) {
                  taskElement.style.minWidth = '2px'
                  taskElement.style.width = '2px'
                  console.log(
                    `强制设置任务 ${task.id} 的宽度为 2px (当前: ${currentWidth}px, 计算: ${computedWidth}px)`
                  )
                }
              } else {
                console.warn(`未找到任务 ${task.id} 的任务条元素`)
              }
            }
          })
        }, 200)
      })
    }

    // 计算实际数据的开始和结束时间
    let minStartDate = null
    let maxEndDate = null
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
          ? gantt.date.add(start, task.duration, 'minute')
          : start

        // 记录最早开始时间和最晚结束时间
        if (!minStartDate || start < minStartDate) {
          minStartDate = new Date(start)
        }
        if (!maxEndDate || end > maxEndDate) {
          maxEndDate = new Date(end)
        }

        // 记录有数据的月份（用于月份过滤）
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

    // 设置开始和结束日期为实际数据的范围（只显示有数据的小时）
    if (minStartDate && maxEndDate) {
      // 设置开始日期为最早任务的开始时间（向前扩展1小时以便显示）
      const startDate = new Date(minStartDate)
      startDate.setHours(startDate.getHours() - 1, 0, 0, 0) // 向前扩展1小时，分钟设为0

      // 设置结束日期为最晚任务的结束时间（向后扩展1小时以便显示）
      const endDate = new Date(maxEndDate)
      endDate.setHours(endDate.getHours() + 1, 59, 59, 999) // 向后扩展1小时，分钟设为59

      gantt.config.start_date = startDate
      gantt.config.end_date = endDate
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
        pdf: () => {
          // 保存当前配置
          const originalStaticBackground = gantt.config.static_background

          // 确保当前的时间轴配置已应用（在设置static_background之前）
          this.applyZoomLevel()

          // 等待配置应用完成
          this.$nextTick(() => {
            setTimeout(() => {
              // 启用static_background以确保PDF导出时时间轴格式正确
              gantt.config.static_background = true

              // 重新渲染以确保配置生效
              gantt.render()

              // 再次等待渲染完成
              setTimeout(() => {
                // 再次渲染确保时间轴格式正确
                gantt.render()

                // 最后一次等待确保DOM完全更新
                setTimeout(() => {
                  try {
                    // 导出PDF，使用raw模式确保使用当前的HTML内容
                    const exportResult = gantt.exportToPDF({
                      name: 'gantt.pdf',
                      locale: 'cn',
                      raw: true, // 使用raw模式，直接渲染当前HTML内容，确保时间轴格式正确
                    })

                    // 如果返回Promise，处理then/catch
                    if (
                      exportResult &&
                      typeof exportResult.then === 'function'
                    ) {
                      exportResult
                        .then(() => {
                          // 恢复原始配置
                          gantt.config.static_background =
                            originalStaticBackground
                          // 重新渲染以恢复原始状态
                          gantt.render()
                        })
                        .catch((error) => {
                          console.error('PDF导出失败:', error)
                          // 恢复原始配置
                          gantt.config.static_background =
                            originalStaticBackground
                          gantt.render()
                        })
                    } else {
                      // 如果不返回Promise，延迟恢复配置
                      setTimeout(() => {
                        gantt.config.static_background =
                          originalStaticBackground
                        gantt.render()
                      }, 1000)
                    }
                  } catch (error) {
                    console.error('PDF导出失败:', error)
                    // 恢复原始配置
                    gantt.config.static_background = originalStaticBackground
                    gantt.render()
                  }
                }, 500) // 增加延迟确保DOM完全更新
              }, 300)
            }, 200)
          })
        },
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

      // 延迟刷新任务条位置，确保缩放后所有任务正确显示
      this.$nextTick(() => {
        setTimeout(() => {
          // 获取当前滚动位置
          const scrollState = gantt.getScrollState()

          // 强制刷新数据，重新计算任务条位置
          if (gantt.refreshData) {
            gantt.refreshData()
          }
          // 强制更新视图
          if (gantt.updateView) {
            gantt.updateView()
          }
          // 重新渲染以确保所有任务条正确显示
          gantt.render()

          // 恢复滚动位置并强制刷新
          if (scrollState) {
            gantt.scrollTo(scrollState.x, scrollState.y)
          }

          // 再次延迟确保 DOM 更新完成后再隐藏空列和最终渲染
          setTimeout(() => {
            // 再次渲染确保所有任务条正确显示
            gantt.render()
            this.hideEmptyColumns()
          }, 100)
        }, 100)
      })
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
          const ganttTaskArea = container.querySelector('.gantt_task')

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
      } else {
        // 已达到最大缩放级别（分钟级）
        console.log('已达到最大缩放级别：分钟级')
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

/* 确保小 duration 任务条可见 */
.gantt_task_line {
  min-width: 2px !important;
}

.gantt_task_bar {
  min-width: 2px !important;
}

/* 对于非常小的任务条，使用特殊样式 */
.gantt_task_line[style*='width: 0'],
.gantt_task_line[style*='width:1px'],
.gantt_task_line[style*='width: 1px'] {
  min-width: 2px !important;
  width: 2px !important;
}
</style>
