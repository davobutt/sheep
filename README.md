# 🐑 sheep [![Build Status](https://travis-ci.org/davobutt/sheep.svg?branch=master)](https://travis-ci.org/davobutt/sheep)

Command line jira and git utility written for NodeJS.

Simple view and time logging functions for jira. Sheep uses the current branch as the jira key if one is not supplied. 

## Install ##

Clone it, install dependencies, make sheep.js executable and then create a link in your path like

```
git clone https://github.com/davobutt/sheep.git
cd sheep
npm i
chmod +x /place/sheep/lives/sheep.js
ln -s /place/sheep/lives/sheep.js /place/on/path/sheep
```

## Usage ##

You need a `jira-config.json` that looks like

```
{
  "host": "yourdomain.atlassian.com",
  "user": "you@yourcompany.com",
  "token": "<<jira access token>>"
}
```
*[experimental]* You can generate this interactively by just running sheep without this.
You can find your jira access token at https://id.atlassian.com/manage

It's common practice to do work on a branch with the same name as your jira issue key (e.g DEV-1234)
**sheep** will find a jira issue key from your current branch or accept the issue or issues as command line params.

### view ###

Displays a brief summary of the ticket

```
sheep view
sheep view -i DEV-1234
```

### showtime ###

Displays time logged against the selected ticket (or tickets) for the last 10 days

```
sheep showtime
sheep showtime -i DEV-1234 -i DEV-1235 -i DEV-1236
```

### log ###

Logs time in hours against the specified ticket for today

```
sheep log -t 1.5
sheep log -i DEV-1234 -t 6
```

Can log time for *x* days ago with the `-d` option

```
sheep log -d4 -t5
```

### browse ###

Uses `open(1)` to browse to the jira page for the ticket
