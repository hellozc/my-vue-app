const brands = ['oppo', 'vivo', '苹果', '小米', '三星', '魅族']
const lineLegend = ['苹果', 'vivo', 'oppo', '魅族', '三星', '小米']
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const countMeta = [
  { name: '今日支付订单', icon: 'CircleCheck', color: '#2ec7c9' },
  { name: '今日收藏订单', icon: 'Star', color: '#ffb980' },
  { name: '今日未支付订单', icon: 'ShoppingBag', color: '#5ab1ef' },
  { name: '本月支付订单', icon: 'CircleCheck', color: '#2ec7c9' },
  { name: '本月收藏订单', icon: 'Star', color: '#ffb980' },
  { name: '本月未支付订单', icon: 'ShoppingBag', color: '#5ab1ef' },
]

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const buildLineSeries = () =>
  lineLegend.map((name) => ({
    name,
    type: 'line',
    smooth: true,
    data: chartDays.map(() => randomInt(400, 7500)),
  }))

export function getHomeData() {
  const tableData = brands.map((name) => ({
    name,
    todayBuy: randomInt(50, 200),
    monthBuy: randomInt(200, 500),
    totalBuy: randomInt(500, 1500),
  }))

  const countData = countMeta.map((item) => ({
    ...item,
    value: randomInt(100, 2000),
  }))

  return {
    userInfo: {
      name: 'Admin',
      role: '超级管理员',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      lastLoginTime: '2021-7-19',
      lastLoginAddress: '武汉',
    },
    tableData,
    countData,
    lineChart: {
      legend: lineLegend,
      xAxis: chartDays,
      series: buildLineSeries(),
    },
    barChart: {
      legend: ['新增用户', '活跃用户'],
      xAxis: weekDays,
      series: [
        {
          name: '新增用户',
          type: 'bar',
          itemStyle: { color: '#2ec7c9' },
          data: weekDays.map(() => randomInt(60, 220)),
        },
        {
          name: '活跃用户',
          type: 'bar',
          itemStyle: { color: '#b6a2de' },
          data: weekDays.map(() => randomInt(150, 350)),
        },
      ],
    },
    pieChart: {
      data: [
        { value: randomInt(800, 1200), name: '小米' },
        { value: randomInt(600, 900), name: '苹果' },
        { value: randomInt(400, 700), name: 'vivo' },
        { value: randomInt(300, 600), name: 'oppo' },
        { value: randomInt(200, 400), name: '魅族' },
        { value: randomInt(150, 350), name: '三星' },
      ],
    },
  }
}
