const prompt = require('prompt')
const fs = require('fs')
var path = require('path')
var appDir = path.dirname(require.main.filename)

const interactive = module.exports = {}

const jiraConfigSchema = {
  properties: {
    host: {
      description: 'Host (yourcompany.atlassian.net)',
      required: true
    },
    user: {
      description: 'User'
    },
    token: {
      description: 'API Token',
      replace: '•',
      pattern: /[\da-zA-Z]{24}/gm,
      message: 'Expecting 24 character API token',
      hidden: true
    }
  }
}

interactive.getJiraConfig = (host, user, token) => {
  return new Promise((resolve, reject) => {
    jiraConfigSchema.properties.host.default = host
    jiraConfigSchema.properties.user.default = user
    jiraConfigSchema.properties.token.default = token
    prompt.message = ''
    prompt.start()
    prompt.get(jiraConfigSchema, (err, result) => {
      if (err) return reject(new Error())
      fs.writeFileSync(appDir + '/jira-config.json', JSON.stringify(result, null, 2))
      return resolve(result)
    })
  })
}
