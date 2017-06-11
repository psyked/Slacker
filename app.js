import Credentials from './credentials.json'

import { RtmClient as Slack, CLIENT_EVENTS } from '@slack/client'
const slack = new Slack(Credentials.apiKey, true, true)

slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log('Welcome to Slack. You are logged in as @%s of %s', rtmStartData.self.name, rtmStartData.team.name)

  let states = [...new Set(rtmStartData.users.map(user => user.presence))]
  console.log(states)
})

slack.login()
