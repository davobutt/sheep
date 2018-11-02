#!/usr/bin/env node

const chalk = require('chalk')
const moment = require('moment')
var JiraClient = require('jira-connector')
const git = require('simple-git/promise')()
const { exec } = require('child_process')
const interactive = require('./src/interactive')
var cli = require('minimist')(process.argv.slice(2))
var config = require('./jira-config.json')

const worklog = require('./src/worklog')

let jira

const handleCommandResponse = (error, result) => {
  if (error) {
    let message = JSON.stringify(error, null, 2)
    if (error.errorMessages && error.errorMessages.length > 0) message = error.errorMessages[0]
    console.log(chalk.red(`🐑  Error - ${chalk.grey(message)}`))
  } else {
    console.log(chalk.blue('🐑 '), chalk.grey(result))
  }
}

const logTime = (issueKey, hours, offset = 0) => {
  console.log(chalk.blue(`🐑  Log Time ${chalk.green(issueKey)} ${hours}h ${offset ? `${offset} days ago` : ''}`))
  const seconds = parseFloat(hours) * 60 * 60
  const options = {
    issueKey,
    worklog: {
      started: moment().subtract(offset, 'd').format('YYYY-MM-DDThh:mm:ss.SSSZZ'),
      timeSpentSeconds: seconds
    }
  }
  jira.issue.addWorkLog(options, handleCommandResponse)
}

const printIssue = (issues) => {
  issues.forEach(i => console.log(chalk.blue(`🐑  ${chalk.green(i.key)} ${chalk.yellow(i.fields.summary)}`)))
}

const getIssueFromGitBranch = async () => {
  let branchName
  try {
    branchName = (await git.silent(true).revparse(['--abbrev-ref', 'HEAD'])).trim()
  } catch (e) {
  }
  return /[A-Z]{2,}-\d*/gm.test(branchName) ? branchName : null
}

const browseIssue = (issueKey) => {
  exec(`open https://${config.host}/browse/${issueKey}`)
}

const getIssues = (issues, successHandler) => {
  Promise.all(issues.map(i => jira.issue.getIssue({issueKey: i})))
    .then(results => successHandler(results))
    .catch(error => handleCommandResponse(error))
}

const main = async () => {
  if (!(config.host && config.user && config.token)) {
    console.log(chalk.red('Please configure jira in jira-config.json with host, user and token'))
    try {
      config = await interactive.getJiraConfig(config.host, config.user, config.token)
      console.log(config)
    } catch (error) {
      console.log(chalk.red(`🐑  Error - setting up config`))
    }
  }

  jira = new JiraClient({
    host: config.host,
    basic_auth: {
      username: config.user,
      password: config.token
    }
  })

  if (cli._.length === 0 || cli._.includes('help')) {
    showHelp()
    process.exit()
  }

  const firstIssue = Array.isArray(cli.i) ? cli.i[0] : cli.i
  const issueKey = firstIssue || await getIssueFromGitBranch()

  if (!issueKey) {
    console.log(chalk.yellow('Jira ticket could not be determined'))
    process.exit()
  }

  const issueParamAsArray = cli.i ? [].concat(cli.i) : [issueKey]

  if (cli._.includes('browse')) {
    browseIssue(issueKey)
  }

  if (cli._.includes('log')) {
    if (cli.t) {
      logTime(issueKey, cli.t, cli.d)
    }
  }

  if (cli._.includes('showtime')) {
    getIssues(issueParamAsArray, worklog.showWorkLog(config.user))
  }

  if (cli._.includes('view')) {
    getIssues(issueParamAsArray, printIssue)
  }
}

main()

function showHelp () {
  console.log(chalk.blue('🐑  Sheep jira & git tools'))
  console.log(chalk.green('sheep view|browse|log [-i <issue key>] [options]\n'))
  console.log('gets jira issue from current branch or')
  console.log('-i <issue key>')
  console.log()
  console.log('view\t view the issue summary')
  console.log('browse\t open the issues web page')
  console.log('log\t log time against issue for today')
  console.log('\t\t-t <hours>')
  console.log('\t\t-o <days ago>')
  console.log('\t\te.g ' + chalk.grey('sheep log -i WEB-9999 -t 1.5 -o 5'))
}
