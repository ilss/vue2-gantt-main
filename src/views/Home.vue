<template>
  <div class="gantt-wrapper">
    <!-- 缩放控制栏 -->
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

    <GanttChart
      :key="ganttKey"
      :gantt-data="ganttData"
      :time-section="timeSection"
      :gantt-current-time="currentTime"
      :first-line-stick="true"
      :chart-max-height="800"
      :show-header="true"
      :header-data="['任务', '工时']"
    >
      <template #side-box="{ item }">
        <div class="side-wrapper">
          <div
            class="side-content"
            :style="{ paddingLeft: item.level * 20 + 'px' }"
          >
            <span
              v-if="item.hasChildren"
              class="collapse-icon"
              @click.stop="toggleTask(item.originalId)"
            >
              {{ item.collapsed ? '▶' : '▼' }}
            </span>
            <span v-else class="collapse-icon-placeholder"></span>
            <span class="task-name">{{ item.name }}</span>
            <span v-if="item.assignee" class="assignee">{{
              item.assignee
            }}</span>
          </div>
          <div class="duration-content">{{ item.duration }}</div>
        </div>
      </template>

      <template #container-box="{ item }">
        <div
          v-for="(bar, index) in item.childArray"
          :key="index"
          class="gantt-bar-item"
          :style="getBarStyle(bar, item)"
        >
          <div
            class="progress-overlay"
            :style="{ width: (bar.progress || item.progress || 0) + '%' }"
          ></div>
          <span class="progress-text"
            >{{ bar.progress || item.progress || 0 }}%</span
          >
        </div>
      </template>
    </GanttChart>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      currentTime: new Date('2021/03/21').getTime(),
      collapsedTasks: new Set(),
      zoomLevel: 1,
      ganttKey: 0,
      baseTimeSection: ['2021/03/14', '2021/04/01'],
      // 严格按照图片的配色方案
      colorMap: {
        pink: '#ffb3d9',
        purple: '#b19cd9',
        blue: '#87ceeb',
      },
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
              color: 'pink',
              level: 1,
              children: [
                {
                  id: 'task1-1',
                  name: '网络舆情监测',
                  duration: '1天',
                  progress: 100,
                  assignee: '张三',
                  color: 'pink',
                  startDate: '2021/03/14',
                  endDate: '2021/03/14',
                },
                {
                  id: 'task1-2',
                  name: '产业分析',
                  duration: '1天',
                  progress: 100,
                  assignee: '张三',
                  color: 'pink',
                  startDate: '2021/03/15',
                  endDate: '2021/03/15',
                },
                {
                  id: 'task1-3',
                  name: '政策分析',
                  duration: '1天',
                  progress: 67,
                  assignee: '张三',
                  color: 'pink',
                  startDate: '2021/03/18',
                  endDate: '2021/03/18',
                },
                {
                  id: 'task1-4',
                  name: '消费者调研',
                  duration: '1天',
                  progress: 0,
                  assignee: '张三',
                  color: 'pink',
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
              color: 'purple',
              level: 1,
              children: [
                {
                  id: 'task2-1',
                  name: '市场需求分析',
                  duration: '1天',
                  progress: 100,
                  assignee: '李四',
                  color: 'purple',
                  startDate: '2021/03/19',
                  endDate: '2021/03/19',
                },
                {
                  id: 'task2-2',
                  name: '当前具备的能力和资源',
                  duration: '1天',
                  progress: 100,
                  assignee: '李四',
                  color: 'purple',
                  startDate: '2021/03/20',
                  endDate: '2021/03/20',
                },
                {
                  id: 'task2-3',
                  name: '利润空间分析',
                  duration: '1天',
                  progress: 90,
                  assignee: '李四',
                  color: 'purple',
                  startDate: '2021/03/21',
                  endDate: '2021/03/21',
                },
                {
                  id: 'task2-4',
                  name: '可续性分析',
                  duration: '1天',
                  progress: 0,
                  assignee: '李四',
                  color: 'purple',
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
              color: 'blue',
              level: 1,
              children: [
                {
                  id: 'task3-1',
                  name: '确定目标市场',
                  duration: '1天',
                  progress: 100,
                  assignee: '王五',
                  color: 'blue',
                  startDate: '2021/03/20',
                  endDate: '2021/03/20',
                },
                {
                  id: 'task3-2',
                  name: '定义产品特点',
                  duration: '3天',
                  progress: 100,
                  assignee: '王五',
                  color: 'blue',
                  startDate: '2021/03/21',
                  endDate: '2021/03/25',
                },
                {
                  id: 'task3-3',
                  name: '设计流程和体验',
                  duration: '1天',
                  progress: 90,
                  assignee: '王五',
                  color: 'blue',
                  startDate: '2021/03/26',
                  endDate: '2021/03/26',
                },
                {
                  id: 'task3-4',
                  name: '迭代和改进',
                  duration: '1天',
                  progress: 0,
                  assignee: '王五',
                  color: 'blue',
                  startDate: '2021/03/27',
                  endDate: '2021/03/27',
                },
                {
                  id: 'task3-5',
                  name: '建立信誉体系',
                  duration: '1天',
                  progress: 0,
                  assignee: '王五',
                  color: 'blue',
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
              color: 'pink',
              level: 1,
              children: [
                {
                  id: 'task4-1',
                  name: '确定目标市场',
                  duration: '1天',
                  progress: 100,
                  assignee: '张三',
                  color: 'pink',
                  startDate: '2021/03/22',
                  endDate: '2021/03/22',
                },
                {
                  id: 'task4-2',
                  name: '分析竞争对手',
                  duration: '1天',
                  progress: 80,
                  assignee: '张三',
                  color: 'pink',
                  startDate: '2021/03/25',
                  endDate: '2021/03/25',
                },
                {
                  id: 'task4-3',
                  name: '制定品牌宣传策略',
                  duration: '1天',
                  progress: 0,
                  assignee: '张三',
                  color: 'pink',
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
  computed: {
    ganttData() {
      return this.flattenTasks(this.taskData, 0)
    },
    timeSection() {
      // 根据缩放级别调整时间范围
      const start = new Date(this.baseTimeSection[0])
      const end = new Date(this.baseTimeSection[1])
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      const centerDate = new Date(
        start.getTime() + (totalDays / 2) * 24 * 60 * 60 * 1000
      )
      const scaledDays = totalDays / this.zoomLevel
      const newStart = new Date(
        centerDate.getTime() - (scaledDays / 2) * 24 * 60 * 60 * 1000
      )
      const newEnd = new Date(
        centerDate.getTime() + (scaledDays / 2) * 24 * 60 * 60 * 1000
      )
      return [
        this.formatDateForGantt(newStart).split(' ')[0],
        this.formatDateForGantt(newEnd).split(' ')[0],
      ]
    },
  },
  methods: {
    flattenTasks(tasks, index = 0, parentCollapsed = false) {
      const result = []

      tasks.forEach((task) => {
        const hasChildren = task.children && task.children.length > 0
        const isCollapsed = this.collapsedTasks.has(task.id)
        // 如果父级折叠了，不显示子任务
        const shouldShow = !parentCollapsed

        if (shouldShow) {
          // 转换任务为 vue-gantt-chart 需要的格式
          const ganttItem = {
            name: task.name,
            duration: task.duration,
            assignee: task.assignee,
            progress: task.progress,
            color: task.color,
            level: task.level,
            hasChildren: hasChildren,
            collapsed: isCollapsed,
            originalId: task.id,
            childArray: [],
          }

          // 处理子任务的 bars
          if (hasChildren) {
            if (!isCollapsed) {
              // 未折叠：只收集直接子任务的 bars（不递归，因为子任务会单独显示）
              const childBars = []
              task.children.forEach((child) => {
                if (child.startDate && child.endDate) {
                  childBars.push({
                    start: child.startDate + ' 00:00',
                    end: child.endDate + ' 23:59',
                    progress: child.progress,
                    color: child.color,
                  })
                }
              })
              ganttItem.childArray = childBars
            } else {
              // 折叠：显示汇总的 bar（从所有子任务计算时间范围，包括嵌套的子任务）
              const allDates = []
              const collectDates = (children) => {
                children.forEach((child) => {
                  if (child.startDate && child.endDate) {
                    allDates.push(new Date(child.startDate))
                    allDates.push(new Date(child.endDate))
                  }
                  // 递归收集所有嵌套子任务的日期
                  if (child.children && child.children.length > 0) {
                    collectDates(child.children)
                  }
                })
              }
              collectDates(task.children)
              if (allDates.length > 0) {
                const minDate = new Date(Math.min(...allDates))
                const maxDate = new Date(Math.max(...allDates))
                ganttItem.childArray = [
                  {
                    start: this.formatDateForGantt(minDate),
                    end: this.formatDateForGantt(maxDate),
                    progress: task.progress,
                    color: task.color,
                  },
                ]
              }
            }
          } else if (task.startDate && task.endDate) {
            // 叶子节点，直接添加 bar
            ganttItem.childArray = [
              {
                start: task.startDate + ' 00:00',
                end: task.endDate + ' 23:59',
                progress: task.progress,
                color: task.color,
              },
            ]
          }

          result.push(ganttItem)

          // 递归处理子任务（只有在未折叠时才显示子任务行）
          if (hasChildren && !isCollapsed) {
            const childResults = this.flattenTasks(task.children, 0, false)
            result.push(...childResults)
          }
        }
      })

      return result
    },
    formatDateForGantt(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day} 00:00`
    },
    toggleTask(taskId) {
      // 使用 Vue.set 或直接操作 Set 并触发响应式更新
      const newSet = new Set(this.collapsedTasks)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      this.collapsedTasks = newSet
      // 强制重新渲染甘特图
      this.ganttKey++
    },
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel = Math.min(2, this.zoomLevel + 0.25)
        this.ganttKey++
      }
    },
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.25)
        this.ganttKey++
      }
    },
    resetZoom() {
      this.zoomLevel = 1
      this.ganttKey++
    },
    getBarStyle(bar, item) {
      // 严格按照图片配色方案设置背景色
      const colorName = bar.color || item.color
      const backgroundColor = this.colorMap[colorName] || this.colorMap.blue
      return {
        backgroundColor: backgroundColor,
        borderRadius: '4px',
      }
    },
    getColor(colorName) {
      return this.colorMap[colorName] || this.colorMap.blue
    },
  },
}
</script>

<style scoped>
.gantt-wrapper {
  width: 100%;
  height: 100vh;
  padding: 20px;
  overflow: auto;
  background: #fff;
}

/* 统一左侧侧边栏背景色和样式 */
.gantt-wrapper /deep/ .gantt-side-box,
.gantt-wrapper /deep/ .gantt-side-box > div,
.gantt-wrapper /deep/ .gantt-side-box > div > div {
  background: #fff !important;
  color: #000 !important;
}

.gantt-wrapper /deep/ .gantt-row {
  background: #fff !important;
  border-bottom: 1px solid #e0e0e0 !important;
  height: 40px !important;
  min-height: 40px !important;
  line-height: 40px !important;
}

.gantt-wrapper /deep/ .gantt-row:nth-child(even) {
  background: #fff !important;
}

.gantt-wrapper /deep/ .gantt-row:nth-child(odd) {
  background: #fff !important;
}

.gantt-wrapper /deep/ .gantt-table tr {
  background: #fff !important;
  border-bottom: 1px solid #e0e0e0 !important;
  height: 40px !important;
  min-height: 40px !important;
}

.gantt-wrapper /deep/ .gantt-table tr:nth-child(even) {
  background: #fff !important;
}

.gantt-wrapper /deep/ .gantt-table tr:nth-child(odd) {
  background: #fff !important;
}

.gantt-wrapper /deep/ .gantt-table td {
  background: #fff !important;
  color: #000 !important;
  border-bottom: 1px solid #e0e0e0 !important;
  height: 40px !important;
  min-height: 40px !important;
  vertical-align: middle !important;
  padding: 0 !important;
}

.gantt-wrapper /deep/ .gantt-side-box td {
  border-right: 1px solid #e0e0e0 !important;
  height: 40px !important;
  min-height: 40px !important;
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

.side-wrapper {
  display: flex;
  width: 100%;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #e0e0e0;
  background: #fff !important;
  height: 40px;
  min-height: 40px;
  box-sizing: border-box;
}

.side-content {
  flex: 2;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-right: 1px solid #e0e0e0;
  background: #fff !important;
  color: #000;
  height: 100%;
  box-sizing: border-box;
}

.collapse-icon {
  cursor: pointer;
  margin-right: 8px;
  user-select: none;
  font-size: 12px;
  color: #000;
  min-width: 16px;
}

.collapse-icon-placeholder {
  min-width: 16px;
  margin-right: 8px;
}

.collapse-icon:hover {
  color: #42b983;
}

.task-name {
  flex: 1;
  font-size: 14px;
  color: #000;
}

.assignee {
  margin-left: 8px;
  color: #000;
  font-size: 12px;
}

.duration-content {
  flex: 1;
  min-width: 80px;
  padding: 0 10px;
  text-align: center;
  font-size: 13px;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff !important;
  height: 100%;
  box-sizing: border-box;
}

/* 严格按照图片配色的任务条样式 */
.gantt-bar-item {
  position: relative;
  height: 24px;
  border-radius: 4px;
  margin: 2px 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.gantt-bar-item:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

/* 进度覆盖层 - 白色半透明 */
.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.3s;
  z-index: 1;
}

/* 进度文字 */
.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 2;
}

/* 严格按照图片配色的任务条背景色 */
.bar-pink {
  background-color: #ffb3d9 !important;
}

.bar-purple {
  background-color: #b19cd9 !important;
}

.bar-blue {
  background-color: #87ceeb !important;
}
</style>
