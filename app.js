import 'colors'
import 'log-timestamp'
import Credentials from './credentials.json'
import { RtmClient as Slack, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client'

const slack = new Slack(Credentials.apiKey, true, true)
const STATES = { ACTIVE: 'active', AWAY: 'away' }

let users

slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log('Welcome to Slack. You are logged in as @%s of %s'.blue, rtmStartData.self.name, rtmStartData.team.name)

    users = rtmStartData.users

    let activeUsers = rtmStartData.users.filter(user => !user.is_bot).filter(user => user.presence === STATES.ACTIVE)
    let awayUsers = rtmStartData.users.filter(user => !user.is_bot).filter(user => user.presence === STATES.AWAY)

    console.log('%s users active and %s users away'.yellow, activeUsers.length, awayUsers.length)
    if (activeUsers.length) {
        console.log('Users online: %s'.yellow, activeUsers.map(user => user.real_name).join(', '))
    }
})

slack.on(RTM_EVENTS.PRESENCE_CHANGE, function (changedUser) {
    let fullUserDetails = users.filter(user => user.id === changedUser.user)[0]
    if (!fullUserDetails) { return }
    fullUserDetails.presence = changedUser.presence

    if (changedUser.presence === STATES.AWAY) {
        console.log('%s has gone %s'.red, fullUserDetails.real_name, changedUser.presence)
    } else {
        console.log('%s has become %s'.green, fullUserDetails.real_name, changedUser.presence)
    }
})

slack.login()
