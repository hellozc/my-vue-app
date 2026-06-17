<template>
  <div v-loading="loading" class="home">
    <el-row :gutter="20">
      <!-- 左侧 -->
      <el-col :span="8">
        <el-card shadow="hover" class="user-card">
          <div class="user-info">
            <el-avatar :size="80" :src="userInfo.avatar" />
            <div class="user-detail">
              <p class="name">{{ userInfo.name }}</p>
              <p class="role">{{ userInfo.role }}</p>
            </div>
          </div>
          <el-divider />
          <div class="login-info">
            <p>上次登录时间：<span>{{ userInfo.lastLoginTime }}</span></p>
            <p>上次登录地点：<span>{{ userInfo.lastLoginAddress }}</span></p>
          </div>
        </el-card>

        <el-card shadow="hover" class="table-card">
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="name" label="课程" />
            <el-table-column prop="todayBuy" label="今日购买" />
            <el-table-column prop="monthBuy" label="本月购买" />
            <el-table-column prop="totalBuy" label="总购买" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧 -->
      <el-col :span="16">
        <div class="stat-cards">
          <el-card
            v-for="(item, index) in countData"
            :key="index"
            shadow="hover"
            class="stat-card"
          >
            <div class="stat-content" :style="{ backgroundColor: item.color }">
              <el-icon class="stat-icon"><component :is="item.icon" /></el-icon>
              <div class="stat-text">
                <p class="value">¥ {{ item.value }}</p>
                <p class="label">{{ item.name }}</p>
              </div>
            </div>
          </el-card>
        </div>

        <el-card shadow="hover" class="chart-card">
          <div ref="lineChartRef" class="chart"></div>
        </el-card>

        <el-row :gutter="20" class="bottom-charts">
          <el-col :span="12">
            <el-card shadow="hover" class="chart-card">
              <div ref="barChartRef" class="chart"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover" class="chart-card">
              <div ref="pieChartRef" class="chart"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getHomeData } from '@/api/home'

const loading = ref(false)
const userInfo = ref({})
const tableData = ref([])
const countData = ref([])

const lineChartRef = ref(null)
const barChartRef = ref(null)
const pieChartRef = ref(null)
let charts = []

const chartAxis = {
  axisLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.25)' } },
  axisLabel: { color: 'rgba(255, 255, 255, 0.5)' },
  splitLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.08)' } },
}

const chartLegend = {
  textStyle: { color: 'rgba(255, 255, 255, 0.65)' },
  top: 0,
}

const disposeCharts = () => {
  charts.forEach((chart) => chart.dispose())
  charts = []
}

const initLineChart = (lineChart) => {
  if (!lineChartRef.value || !lineChart) return
  const chart = echarts.init(lineChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { ...chartLegend, data: lineChart.legend },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: lineChart.xAxis,
      ...chartAxis,
    },
    yAxis: { type: 'value', max: 8000, ...chartAxis },
    series: lineChart.series,
  })
  charts.push(chart)
}

const initBarChart = (barChart) => {
  if (!barChartRef.value || !barChart) return
  const chart = echarts.init(barChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { ...chartLegend, data: barChart.legend },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: barChart.xAxis, ...chartAxis },
    yAxis: { type: 'value', ...chartAxis },
    series: barChart.series,
  })
  charts.push(chart)
}

const initPieChart = (pieChart) => {
  if (!pieChartRef.value || !pieChart) return
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: 'rgba(255, 255, 255, 0.65)' },
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['55%', '50%'],
        data: pieChart.data,
        label: { color: 'rgba(255, 255, 255, 0.75)' },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(99, 102, 241, 0.5)',
          },
        },
      },
    ],
  })
  charts.push(chart)
}

const initCharts = (data) => {
  disposeCharts()
  initLineChart(data.lineChart)
  initBarChart(data.barChart)
  initPieChart(data.pieChart)
}

const handleResize = () => {
  charts.forEach((chart) => chart.resize())
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getHomeData()
    userInfo.value = data.userInfo
    tableData.value = data.tableData
    countData.value = data.countData
    await nextTick()
    initCharts(data)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})
</script>

<style scoped lang="scss">
.home {
  .user-card {
    margin-bottom: 20px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .name {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 4px;
        color: rgba(255, 255, 255, 0.95);
      }

      .role {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.45);
        margin: 0;
      }
    }

    .login-info {
      p {
        margin: 8px 0;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);

        span {
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }
  }

  .table-card {
    margin-bottom: 20px;
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      overflow: hidden;
      border-radius: 8px;

      :deep(.el-card__body) {
        padding: 0;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-radius: 4px;
        color: #fff;

        .stat-icon {
          font-size: 36px;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
        }

        .stat-text {
          .value {
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 4px;
          }

          .label {
            font-size: 13px;
            margin: 0;
            opacity: 0.9;
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .chart {
      height: 320px;
    }
  }

  .bottom-charts {
    .chart {
      height: 280px;
    }
  }
}
</style>
