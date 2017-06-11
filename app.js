import 'colors'
import 'log-timestamp'
import Credentials from './credentials.json'
import { RtmClient as Slack, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client'

const slack = new Slack(Credentials.apiKey, true, true)
const STATES = { ACTIVE: 'active', AWAY: 'away' }

let users

slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    log.log(`Welcome to Slack. You are logged in as @${rtmStartData.self.name} of ${rtmStartData.team.name}`.blue)

    users = rtmStartData.users.filter(user => !user.is_restricted).filter(user => !user.is_bot).filter(user => !!user.real_name)

    let activeUsers = users.filter(user => !user.is_bot).filter(user => user.presence === STATES.ACTIVE)
    let awayUsers = users.filter(user => !user.is_bot).filter(user => user.presence === STATES.AWAY)

    log.log(`${activeUsers.length} users active and ${awayUsers.length} users away`.yellow)
    if (activeUsers.length) {
        log.log(`Users online: ${activeUsers.map(user => user.real_name).join(', ')}`.yellow)
    }

    onlineUsers.content = users.map((user) => {
        if (user.presence === STATES.ACTIVE) {
            return `•  ${[user.real_name]}`.green
        }
    }).filter(message => !!message).join('\n')

    offlineUsers.content = users.map((user) => {
        if (user.presence !== STATES.ACTIVE) {
            return `◦  ${[user.real_name]}`.yellow
        }
    }).filter(message => !!message).join('\n')
})

slack.on(RTM_EVENTS.PRESENCE_CHANGE, function (changedUser) {
    let fullUserDetails = users.filter(user => user.id === changedUser.user)[0]
    if (!fullUserDetails) { return }
    fullUserDetails.presence = changedUser.presence

    if (changedUser.presence === STATES.AWAY) {
        log.log(`${fullUserDetails.real_name} has gone ${changedUser.presence}`.red)
    } else {
        log.log(`${fullUserDetails.real_name} has become ${changedUser.presence}`.green)
    }

    onlineUsers.content = users.map((user) => {
        if (user.presence === STATES.ACTIVE) {
            return `•  ${[user.real_name]}`.green
        }
    }).filter(message => !!message).join('\n')

    offlineUsers.content = users.map((user) => {
        if (user.presence !== STATES.ACTIVE) {
            return `◦  ${[user.real_name]}`.yellow
        }
    }).filter(message => !!message).join('\n')
})

slack.login()

var blessed = require('blessed')
var contrib = require('blessed-contrib')

var screen = blessed.screen()

var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })

//grid.set(row, col, rowSpan, colSpan, obj, opts)
var log = grid.set(0, 0, 12, 6, contrib.log, { label: 'Activity Log' })
var onlineUsers = grid.set(0, 6, 12, 3, blessed.box, { label: 'Online Users', content: '' })
var offlineUsers = grid.set(0, 9, 12, 3, blessed.box, { label: 'Offline Users', content: '' })

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

screen.render()