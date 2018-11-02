const Table = require('tty-table')
const chalk = require('chalk')
const moment = require('moment')
const worklog = module.exports = {}

worklog.showWorkLog = (user) => (issues) => {
  const issuesWithUserWorklogs = issues.map((issue) => {
    return {
      issueKey: issue.key,
      worklogs: issue.fields.worklog.worklogs.filter(w => w.author.emailAddress === user)
    }
  })
  showTable(issuesWithUserWorklogs)
}

const showTable = (issuesWithWorklogs) => {
  var dates = [...Array(10).keys()].map(i => moment().subtract(i, 'd')).reverse()
  var headerRow = [{value: 'Issue'}].concat(dates.map((d) => {
    const weekend = d.format('dd')[0] === 'S'
    return {
      value: weekend ? chalk.grey('S') : d.format('dd')[0] + d.format(' MM/DD'),
      width: weekend ? 5 : 10
    }
  }))
  var timeRows = issuesWithWorklogs.map((issue) => {
    return [chalk.yellow(issue.issueKey)].concat(dates.map(d => {
      const time = issue.worklogs.filter(l => d.isSame(moment(l.started), 'day')).reduce((a, v) => a + v.timeSpentSeconds, 0) / 60 / 60
      return time === 0 ? chalk.grey(time) : chalk.green(time)
    }))
  })

  var t1 = Table(headerRow, [], {
    borderStyle: 1,
    borderColor: 'blue',
    paddingBottom: 0,
    headerAlign: 'center',
    align: 'center',
    color: 'white'
  })
  t1.push(...timeRows)

  const str1 = t1.render()
  console.log(str1)
}
