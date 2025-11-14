<template>
  <div class="gantt-container">
    <div id="gantt_here" class="gantt-box"></div>
  </div>
</template>

<script>
// import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
// import 'dhtmlx-gantt/codebase/dhtmlxgantt.js'

export default {
  name: 'GanttDemo',

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
    gantt.parse({
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
    })
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
